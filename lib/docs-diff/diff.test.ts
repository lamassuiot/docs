import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createProcessor } from '@mdx-js/mdx';
import { remarkGfm } from 'fumadocs-core/mdx-plugins';
import { diffText, diffTrees, type MdNode, markAllInserted } from './diff.ts';

const processor = createProcessor({ remarkPlugins: [remarkGfm] });
const parse = (source: string) => processor.parse(source) as unknown as MdNode;

function diff(base: string, head: string): { out: string; changes: number } {
  const tree = parse(head);
  const { changes } = diffTrees(parse(base), tree);
  return { out: render(tree).trimEnd(), changes };
}

/**
 * Compact rendering for assertions: {+inserted+}, [-deleted-], and block
 * markers <+ ... +> / <- ... -> for whole inserted/deleted blocks.
 */
function render(node: MdNode): string {
  const children = () => (node.children ?? []).map(render).join('');
  const cls = (node.attributes as { name: string; value: string }[] | undefined)?.find((a) => a.name === 'className')?.value ?? '';
  const hClass = String((node.data?.hProperties as { className?: string[] } | undefined)?.className ?? '');
  switch (node.type) {
    case 'text':
    case 'inlineCode':
      return node.type === 'inlineCode' ? `\`${node.value}\`` : (node.value ?? '');
    case 'code':
      return `\`\`\`${node.meta ?? ''}\n${node.value}\n\`\`\`\n`;
    case 'mdxJsxTextElement':
      if (cls === 'lm-diff-ins') return `{+${children()}+}`;
      if (cls === 'lm-diff-del') return `[-${children()}-]`;
      return children();
    case 'mdxJsxFlowElement':
      if (cls.includes('lm-diff-ins')) return `<+${children().trim()}+>\n`;
      if (cls.includes('lm-diff-del')) return `<-${children().trim()}->\n`;
      if (cls === 'lm-diff-final') return `FINAL:${children()}`;
      if (cls === 'lm-diff-merged') return `MERGED:${children()}`;
      return `<${node.name}>${children()}</${node.name}>\n`;
    case 'strong':
      return `**${children()}**`;
    case 'link':
      return `[${children()}](${node.url})`;
    case 'listItem':
      return `${hClass.includes('lm-diff-ins') ? '+' : hClass.includes('lm-diff-del') ? '-' : ' '}* ${children().trim()}\n`;
    case 'tableRow':
      return `${hClass.includes('lm-diff-ins') ? '+' : hClass.includes('lm-diff-del') ? '-' : ' '}| ${(node.children ?? []).map(render).join(' | ')} |\n`;
    case 'paragraph':
    case 'heading':
      return `${node.type === 'heading' ? `${'#'.repeat(node.depth ?? 1)} ` : ''}${children()}\n`;
    default:
      return children();
  }
}

test('one word changed in a long paragraph marks only that word', () => {
  const { out, changes } = diff(
    'El servicio CA emite certificados X.509 para los dispositivos registrados en la plataforma.',
    'El servicio CA emite certificados X.509 para los dispositivos aprobados en la plataforma.',
  );
  assert.equal(out, 'El servicio CA emite certificados X.509 para los dispositivos [-registrados-]{+aprobados+} en la plataforma.');
  assert.equal(changes, 1);
});

test('a sentence appended to a paragraph is a pure insertion', () => {
  const { out } = diff('Primera frase. Segunda frase.', 'Primera frase. Segunda frase. Tercera frase nueva.');
  assert.equal(out, 'Primera frase. Segunda frase.{+ Tercera frase nueva.+}');
});

test('reflowing a paragraph across lines is not a change', () => {
  const { out, changes } = diff('Una línea larga\nque continúa aquí.', 'Una línea larga que\ncontinúa aquí.');
  assert.equal(changes, 0);
  assert.equal(out.replace(/\s+/g, ' '), 'Una línea larga que continúa aquí.');
});

test('a rewritten sentence reads as one replacement, not word confetti', () => {
  const { out } = diff(
    'Antes de arrancar, configura el valor del puerto.',
    'Antes de arrancar, reinicia todo el sistema tras aplicar cambios.',
  );
  assert.equal(out, 'Antes de arrancar, [-configura el valor del puerto-]{+reinicia todo el sistema tras aplicar cambios+}.');
});

test('paragraphs with nothing in common are a removed block and an added block', () => {
  const { out } = diff('Configura el puerto.', 'Reinicia todo tras aplicar cambios.');
  assert.equal(out, '<-Configura el puerto.->\n<+Reinicia todo tras aplicar cambios.+>');
});

test('a new paragraph between unchanged ones is a single inserted block', () => {
  const { out, changes } = diff('Uno.\n\nTres.', 'Uno.\n\nDos, nuevo.\n\nTres.');
  assert.equal(out, 'Uno.\n<+Dos, nuevo.+>\nTres.');
  assert.equal(changes, 1);
});

test('a removed paragraph is re-inserted as a deleted block in place', () => {
  const { out } = diff('Uno.\n\nDos.\n\nTres.', 'Uno.\n\nTres.');
  assert.equal(out, 'Uno.\n<-Dos.->\nTres.');
});

test('edits keep formatting and links around the changed words', () => {
  const { out } = diff(
    'Consulta la **guía de EST** en [la referencia](/est) para más detalle.',
    'Consulta la **guía de EST** en [la referencia oficial](/est) para más detalle.',
  );
  assert.equal(out, 'Consulta la **guía de EST** en [la referencia{+ oficial+}](/est) para más detalle.');
});

test('inline code is compared as a unit', () => {
  const { out } = diff('Usa `--ttl 30` para limitar.', 'Usa `--ttl 60` para limitar.');
  assert.equal(out, 'Usa [-`--ttl 30`-]{+`--ttl 60`+} para limitar.');
});

test('list items: added item and edited item are told apart', () => {
  const { out } = diff('- Alfa\n- Beta con texto\n- Gamma', '- Alfa\n- Beta con más texto\n- Nuevo\n- Gamma');
  assert.equal(out, ' * Alfa\n * Beta con {+más +}texto\n+* Nuevo\n * Gamma');
});

test('table rows: edited cell, added row and removed row', () => {
  const { out } = diff(
    '| Campo | Valor |\n| - | - |\n| ttl | 30 días |\n| viejo | x |',
    '| Campo | Valor |\n| - | - |\n| ttl | 60 días |\n| nuevo | y |',
  );
  assert.equal(out, ' | Campo | Valor |\n | ttl | [-30-]{+60+} días |\n-| viejo | x |\n+| nuevo | y |');
});

test('changes inside an MDX component are diffed in place', () => {
  const { out } = diff(
    '<Callout type="warn">\n\nNo borres la CA raíz.\n\n</Callout>',
    '<Callout type="warn">\n\nNo borres nunca la CA raíz.\n\n</Callout>',
  );
  assert.equal(out, '<Callout>No borres {+nunca +}la CA raíz.\n</Callout>');
});

test('a component whose props changed is shown as replaced', () => {
  const { out } = diff('<Card title="A" href="/a" />', '<Card title="B" href="/a" />');
  assert.equal(out, '<-<Card></Card>->\n<+<Card></Card>+>');
});

test('headings with a different level are not paired', () => {
  const { out } = diff('## Configuración', '### Configuración');
  assert.equal(out, '<-## [-Configuración-]->\n<+### Configuración+>');
});

test('code blocks get a line diff, with the final version kept separately', () => {
  const tree = parse('```yaml\na: 1\nb: 3\nc: 4\n```');
  diffTrees(parse('```yaml\na: 1\nb: 2\nc: 4\n```'), tree);
  const [final, merged] = tree.children ?? [];
  assert.equal(render(final), 'FINAL:```\na: 1\nb: 3\nc: 4\n```\n');
  assert.equal(render(merged), 'MERGED:```lmdiff="=-+="\na: 1\nb: 2\nb: 3\nc: 4\n```\n');
});

test('a new page marks every block as inserted', () => {
  const tree = parse('# Título\n\nTexto.');
  assert.equal(markAllInserted(tree).changes, 2);
  assert.equal(render(tree).trim(), '<+# Título+>\n<+Texto.+>');
});

test('unchanged content produces no markup', () => {
  const source = '# A\n\nTexto con **negrita**.\n\n- uno\n- dos\n\n```sh\nls\n```';
  const { out, changes } = diff(source, source);
  assert.equal(changes, 0);
  assert.doesNotMatch(out, /[{[<][+-]/);
});

test('diffText splits a title into kept, removed and added words', () => {
  assert.deepEqual(diffText('Protocolo EST', 'Protocolo EST y CMP'), [
    { op: 'eq', text: 'Protocolo EST' },
    { op: 'ins', text: ' y CMP' },
  ]);
});
