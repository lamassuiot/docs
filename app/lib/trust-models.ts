/**
 * Scene definitions for the animated trust-model diagrams on
 * `content/docs/platform/pki/concepts/trust-model.mdx`, rendered by
 * `app/components/trust-diagram.tsx`.
 *
 * Two ideas drive the shape of this data, because they are what a static
 * box-and-arrow drawing cannot show:
 *
 * 1. **A CA is a key, not a certificate.** Every `ca` node owns a list of
 *    `slots`: one per certificate that exists for that same key pair. A root
 *    starts with one (its self-signed certificate) and gains a second when
 *    another CA cross-signs it. Same subject, same key, different issuer.
 * 2. **Some links are created after the PKI is already running.** Each scene
 *    is a sequence of `phases`; a node, an edge or a certificate slot only
 *    exists from its `phase` onwards. Cross-signing and the bridge pattern
 *    therefore appear as steps the reader advances to, not as part of the
 *    initial drawing.
 *
 * Geometry is explicit (no auto-layout): `x` is the centre of a node and `y`
 * its top edge, in the scene's user-unit coordinate system. Heights are
 * derived from the number of slots — see `nodeHeight` below.
 */

/** A string in both documentation locales: `[english, spanish]`. */
export type L = readonly [en: string, es: string];

export function t(label: L, locale: "en" | "es"): string {
  return locale === "es" ? label[1] : label[0];
}

/** One certificate held by a CA, or one anchor installed in a trust store. */
export type Slot = {
  /** Referenced by `PhaseSpec.fail` to mark the entry as no longer usable. */
  id?: string;
  /** Who issued this certificate: "self-signed", "issued by Root A"… */
  label: L;
  /** First phase in which this certificate exists. */
  phase: number;
  /**
   * Node that signs it. When set, the chip flies in from that node the first
   * time its phase is reached — the visual for "this was signed later".
   */
  from?: string;
};

export type NodeKind =
  /** A certification authority: a key pair plus its certificates. */
  | "ca"
  /** An end-entity certificate. */
  | "leaf"
  /** A relying party, with its trust store. */
  | "party"
  /** A published list of trust anchors. */
  | "list";

export type NodeSpec = {
  id: string;
  kind: NodeKind;
  /** Centre of the node, in user units. */
  x: number;
  /** Top edge of the node, in user units. */
  y: number;
  label: L;
  /** Second line in the header: a key fingerprint, a role, a note. */
  sub?: L;
  slots?: Slot[];
  /** First phase in which the node exists. Defaults to 0. */
  phase?: number;
};

export type EdgeSpec = {
  id: string;
  from: string;
  to: string;
  /**
   * `issue` is a signature (solid, drawn in); `trust` is configured trust or
   * distribution (dashed); `ghost` is a link that deliberately does **not**
   * exist, drawn crossed out.
   */
  kind: "issue" | "trust" | "ghost";
  label?: L;
  phase: number;
  /** Perpendicular offset, to separate the two edges of a reciprocal pair. */
  bow?: number;
};

export type PhaseSpec = {
  /** Short label for the step control. */
  label: L;
  /** Sentence shown under the diagram while this phase is current. */
  caption: L;
  /**
   * Edge ids traced as a validation path, listed from the end-entity
   * certificate back to the trust anchor.
   */
  path?: string[];
  /** Node ids acting as the relying party's trust anchor in this phase. */
  anchor?: string[];
  /** Node, edge or slot ids that are unusable in this phase. */
  fail?: string[];
};

export type Scene = {
  title: L;
  /** User-unit size of the viewBox. Width is 760 for every scene. */
  w: number;
  h: number;
  nodes: NodeSpec[];
  edges: EdgeSpec[];
  phases: PhaseSpec[];
};

/* ── Geometry constants, shared with the renderer ───────────────────────── */

export const CARD_W = 188;
export const LEAF_W = 152;
export const HEAD_H = 38;
export const SLOT_H = 24;
export const SLOT_GAP = 4;
export const LEAF_H = 34;

export function nodeWidth(node: NodeSpec): number {
  return node.kind === "leaf" ? LEAF_W : CARD_W;
}

/**
 * Height of a node. Slots are laid out below the header and every slot the
 * node will *ever* hold reserves its row from the start, so a certificate
 * arriving in a later phase drops into a visible empty place instead of
 * resizing the card mid-animation.
 */
export function nodeHeight(node: NodeSpec): number {
  if (node.kind === "leaf") return LEAF_H;
  const n = node.slots?.length ?? 0;
  if (n === 0) return HEAD_H;
  return HEAD_H + 4 + n * SLOT_H + (n - 1) * SLOT_GAP + 8;
}

/* ── Reusable labels ────────────────────────────────────────────────────── */

const SELF: L = ["self-signed", "autofirmado"];
const KEY: L = ["key pair", "par de claves"];

/** CA names, so the chips that reference them stay localized too. */
const ROOT_CA: L = ["Root CA", "CA raíz"];
const ROOT_A: L = ["Root A", "Raíz A"];
const ROOT_B: L = ["Root B", "Raíz B"];
const ROOTS_AB: L = ["Root A + Root B", "Raíz A + Raíz B"];
const CA_A: L = ["CA A", "CA A"];
const CA_B: L = ["CA B", "CA B"];
const PCA_A: L = ["PCA A", "PCA A"];
const PCA_B: L = ["PCA B", "PCA B"];
const BRIDGE: L = ["Bridge CA", "CA puente"];
const UNIFIER: L = ["Unifying CA", "CA unificadora"];

const by = (n: L): L => [`issued by ${n[0]}`, `emitido por ${n[1]}`];
const crossBy = (n: L): L => [`signed by ${n[0]}`, `firmado por ${n[1]}`];
const anchorOf = (n: L): L => [`anchor: ${n[0]}`, `ancla: ${n[1]}`];
const IDENTITY = (suffix = ""): L => [
  `Identity${suffix}`,
  `Identidad${suffix}`,
];

const TRUSTS: L = ["trusts", "confía en"];
const SIGNS: L = ["signs", "firma"];

/* ── Scenes ─────────────────────────────────────────────────────────────── */

export const SCENES: Record<string, Scene> = {
  /* ------------------------------------------------------------------ */
  "single-ca": {
    title: ["Single CA", "CA única"],
    w: 760,
    h: 300,
    nodes: [
      {
        id: "root",
        kind: "ca",
        x: 380,
        y: 46,
        label: ROOT_CA,
        sub: KEY,
        slots: [{ label: SELF, phase: 0 }],
      },
      {
        id: "id",
        kind: "leaf",
        x: 380,
        y: 206,
        label: IDENTITY(),
        phase: 1,
      },
    ],
    edges: [{ id: "e1", from: "root", to: "id", kind: "issue", phase: 1 }],
    phases: [
      {
        label: ROOT_CA,
        caption: [
          "A self-signed root: one key pair and one certificate, its own.",
          "Una raíz autofirmada: un par de claves y un certificado, el suyo.",
        ],
        anchor: ["root"],
      },
      {
        label: ["Issuance", "Emisión"],
        caption: [
          "The root signs end-entity certificates directly. Every identity depends on that single key.",
          "La raíz firma directamente los certificados de entidad final. Todas las identidades dependen de esa única clave.",
        ],
        anchor: ["root"],
      },
      {
        label: ["Validation", "Validación"],
        caption: [
          "The relying party builds the chain in the opposite direction: from the identity back to the anchor it trusts.",
          "El consumidor construye la cadena en sentido contrario: de la identidad hasta el ancla en la que confía.",
        ],
        anchor: ["root"],
        path: ["e1"],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  hierarchy: {
    title: ["Hierarchy", "Jerarquía"],
    w: 760,
    h: 400,
    nodes: [
      {
        id: "root",
        kind: "ca",
        x: 380,
        y: 32,
        label: ROOT_CA,
        sub: KEY,
        slots: [{ label: SELF, phase: 0 }],
      },
      {
        id: "ia",
        kind: "ca",
        x: 172,
        y: 172,
        label: ["Intermediate A", "Intermedia A"],
        sub: KEY,
        slots: [{ label: by(ROOT_CA), phase: 1, from: "root" }],
        phase: 1,
      },
      {
        id: "ib",
        kind: "ca",
        x: 588,
        y: 172,
        label: ["Intermediate B", "Intermedia B"],
        sub: KEY,
        slots: [{ label: by(ROOT_CA), phase: 1, from: "root" }],
        phase: 1,
      },
      {
        id: "ea",
        kind: "leaf",
        x: 172,
        y: 322,
        label: IDENTITY(" A"),
        phase: 2,
      },
      {
        id: "eb",
        kind: "leaf",
        x: 588,
        y: 322,
        label: IDENTITY(" B"),
        phase: 2,
      },
    ],
    edges: [
      { id: "r_ia", from: "root", to: "ia", kind: "issue", phase: 1 },
      { id: "r_ib", from: "root", to: "ib", kind: "issue", phase: 1 },
      { id: "ia_ea", from: "ia", to: "ea", kind: "issue", phase: 2 },
      { id: "ib_eb", from: "ib", to: "eb", kind: "issue", phase: 2 },
    ],
    phases: [
      {
        label: ["Root", "Raíz"],
        caption: [
          "The root is the anchor and stays out of daily issuance.",
          "La raíz es el ancla y queda fuera de la emisión diaria.",
        ],
        anchor: ["root"],
      },
      {
        label: ["Intermediates", "Intermedias"],
        caption: [
          "The root signs one CA certificate per operating domain. Each intermediate is a new key pair with a certificate issued by the root.",
          "La raíz firma un certificado de CA por dominio operativo. Cada intermedia es un par de claves nuevo con un certificado emitido por la raíz.",
        ],
        anchor: ["root"],
      },
      {
        label: ["Identities", "Identidades"],
        caption: [
          "The intermediates issue the identities; the root signs no end entities.",
          "Las intermedias emiten las identidades; la raíz no firma entidades finales.",
        ],
        anchor: ["root"],
      },
      {
        label: ["Validation", "Validación"],
        caption: [
          "The consumer trusts the root and needs the intermediate as auxiliary material to complete the chain.",
          "El consumidor confía en la raíz y necesita la intermedia como material auxiliar para completar la cadena.",
        ],
        anchor: ["root"],
        path: ["ia_ea", "r_ia"],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  "cross-sign": {
    title: ["Direct cross-certification", "Certificación cruzada directa"],
    w: 760,
    h: 400,
    nodes: [
      {
        id: "a",
        kind: "ca",
        x: 158,
        y: 38,
        label: PCA_A,
        sub: ["key A", "clave A"],
        slots: [
          { label: SELF, phase: 0 },
          { id: "a_cross", label: crossBy(PCA_B), phase: 3, from: "b" },
        ],
      },
      {
        id: "b",
        kind: "ca",
        x: 602,
        y: 38,
        label: PCA_B,
        sub: ["key B", "clave B"],
        slots: [
          { label: SELF, phase: 0 },
          { id: "b_cross", label: crossBy(PCA_A), phase: 1, from: "a" },
        ],
      },
      { id: "ea", kind: "leaf", x: 158, y: 312, label: IDENTITY(" A") },
      { id: "eb", kind: "leaf", x: 602, y: 312, label: IDENTITY(" B") },
    ],
    edges: [
      { id: "a_ea", from: "a", to: "ea", kind: "issue", phase: 0 },
      { id: "b_eb", from: "b", to: "eb", kind: "issue", phase: 0 },
      {
        id: "a_b",
        from: "a",
        to: "b",
        kind: "issue",
        label: SIGNS,
        phase: 1,
        bow: -30,
      },
      {
        id: "b_a",
        from: "b",
        to: "a",
        kind: "issue",
        label: SIGNS,
        phase: 3,
        bow: -30,
      },
    ],
    phases: [
      {
        label: ["Two domains", "Dos dominios"],
        caption: [
          "Two PKIs with no relation between them. Each CA holds one key pair and one self-signed certificate.",
          "Dos PKIs sin relación entre sí. Cada CA tiene un par de claves y un certificado autofirmado.",
        ],
      },
      {
        label: ["Cross-sign A → B", "Firma cruzada A → B"],
        caption: [
          "An operation run after both PKIs exist: A issues a second certificate for the key B already had. B now has two certificates — same subject, same key, different issuer.",
          "Una operación posterior al alta de ambas PKIs: A emite un segundo certificado para la clave que B ya tenía. B pasa a tener dos certificados: mismo sujeto, misma clave, distinto emisor.",
        ],
      },
      {
        label: ["Path from A", "Ruta desde A"],
        caption: [
          "Anchored on A, the chain to identity B runs through B's cross-certificate. B's self-signed certificate takes no part in this path.",
          "Anclado en A, la cadena hasta la identidad B pasa por el certificado cruzado de B. El certificado autofirmado de B no interviene en esta ruta.",
        ],
        anchor: ["a"],
        path: ["b_eb", "a_b"],
      },
      {
        label: ["Reciprocity", "Reciprocidad"],
        caption: [
          "The opposite direction needs its own signature: B issues a certificate for A's key. One direction never implies the other.",
          "El sentido contrario necesita su propia firma: B emite un certificado para la clave de A. Un sentido nunca implica el otro.",
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  mesh: {
    title: ["Partial mesh", "Malla parcial"],
    w: 760,
    h: 450,
    nodes: [
      {
        id: "a",
        kind: "ca",
        x: 140,
        y: 32,
        label: CA_A,
        sub: ["key A", "clave A"],
        slots: [
          { label: SELF, phase: 0 },
          { label: crossBy(CA_B), phase: 1, from: "b" },
        ],
      },
      {
        id: "b",
        kind: "ca",
        x: 620,
        y: 32,
        label: CA_B,
        sub: ["key B", "clave B"],
        slots: [
          { label: SELF, phase: 0 },
          { label: crossBy(CA_A), phase: 1, from: "a" },
        ],
      },
      {
        id: "c",
        kind: "ca",
        x: 380,
        y: 282,
        label: ["CA C", "CA C"],
        sub: ["key C", "clave C"],
        slots: [
          { label: SELF, phase: 0 },
          { label: crossBy(CA_A), phase: 2, from: "a" },
          { label: crossBy(CA_B), phase: 2, from: "b" },
        ],
      },
    ],
    edges: [
      { id: "a_b", from: "a", to: "b", kind: "issue", phase: 1, bow: -26 },
      { id: "b_a", from: "b", to: "a", kind: "issue", phase: 1, bow: -26 },
      { id: "a_c", from: "a", to: "c", kind: "issue", phase: 2, bow: -18 },
      { id: "b_c", from: "b", to: "c", kind: "issue", phase: 2, bow: -18 },
      {
        id: "c_a",
        from: "c",
        to: "a",
        kind: "ghost",
        label: ["absent", "ausente"],
        phase: 3,
        bow: -18,
      },
      {
        id: "c_b",
        from: "c",
        to: "b",
        kind: "ghost",
        label: ["absent", "ausente"],
        phase: 3,
        bow: -18,
      },
    ],
    phases: [
      {
        label: ["Three CAs", "Tres CAs"],
        caption: [
          "Three self-signed CAs, each the anchor of its own domain.",
          "Tres CAs autofirmadas, cada una ancla de su propio dominio.",
        ],
      },
      {
        label: ["A ↔ B", "A ↔ B"],
        caption: [
          "A and B cross-sign each other. Both ends of a reciprocal link are two separate operations, and each adds a certificate to the other's key.",
          "A y B se firman mutuamente. Los dos extremos de un enlace recíproco son dos operaciones distintas, y cada una añade un certificado a la clave de la otra.",
        ],
      },
      {
        label: ["A → C, B → C", "A → C, B → C"],
        caption: [
          "A and B both cross-sign C. C now holds three certificates for one key: its own, and one from each neighbour.",
          "A y B firman las dos a C. C pasa a tener tres certificados para una sola clave: el suyo y uno de cada vecina.",
        ],
      },
      {
        label: ["Missing links", "Enlaces que faltan"],
        caption: [
          "C → A and C → B were never issued. From C's anchor there is no path into A or B: in a partial mesh, reciprocity must not be assumed.",
          "C → A y C → B nunca se emitieron. Desde el ancla de C no hay ruta hacia A ni hacia B: en una malla parcial no debe suponerse reciprocidad.",
        ],
        anchor: ["c"],
        fail: ["c_a", "c_b"],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  hybrid: {
    title: ["Hybrid model", "Modelo híbrido"],
    w: 760,
    h: 420,
    nodes: [
      {
        id: "ra",
        kind: "ca",
        x: 148,
        y: 26,
        label: ROOT_A,
        sub: ["key A", "clave A"],
        slots: [{ label: SELF, phase: 0 }],
      },
      {
        id: "ia",
        kind: "ca",
        x: 148,
        y: 176,
        label: ["Intermediate A", "Intermedia A"],
        sub: KEY,
        slots: [{ label: by(ROOT_A), phase: 0 }],
      },
      { id: "ea", kind: "leaf", x: 148, y: 326, label: IDENTITY(" A") },
      {
        id: "rb",
        kind: "ca",
        x: 612,
        y: 26,
        label: ROOT_B,
        sub: ["key B", "clave B"],
        slots: [
          { label: SELF, phase: 0 },
          { id: "rb_cross", label: crossBy(ROOT_A), phase: 1, from: "ra" },
        ],
      },
      {
        id: "ib",
        kind: "ca",
        x: 612,
        y: 186,
        label: ["Intermediate B", "Intermedia B"],
        sub: KEY,
        slots: [{ label: by(ROOT_B), phase: 0 }],
      },
      { id: "eb", kind: "leaf", x: 612, y: 336, label: IDENTITY(" B") },
    ],
    edges: [
      { id: "ra_ia", from: "ra", to: "ia", kind: "issue", phase: 0 },
      { id: "ia_ea", from: "ia", to: "ea", kind: "issue", phase: 0 },
      { id: "rb_ib", from: "rb", to: "ib", kind: "issue", phase: 0 },
      { id: "ib_eb", from: "ib", to: "eb", kind: "issue", phase: 0 },
      {
        id: "ra_rb",
        from: "ra",
        to: "rb",
        kind: "issue",
        label: SIGNS,
        phase: 1,
      },
    ],
    phases: [
      {
        label: ["Two hierarchies", "Dos jerarquías"],
        caption: [
          "Two organizations, each with its own root, issuing CA and identities.",
          "Dos organizaciones, cada una con su raíz, su CA emisora y sus identidades.",
        ],
      },
      {
        label: ["Cross-sign A → B", "Firma cruzada A → B"],
        caption: [
          "Neither root is replaced. A cross-signs root B, which is why B appears twice in the console: as a self-signed root and under A, with the same key and a different issuer.",
          "Ninguna raíz se sustituye. A firma de forma cruzada a la raíz B, y por eso B aparece dos veces en la consola: como raíz autofirmada y bajo A, con la misma clave y distinto emisor.",
        ],
      },
      {
        label: ["Path from A", "Ruta desde A"],
        caption: [
          "From anchor A the chain is identity → intermediate B → B's cross-certificate → A. Remove any link and validation fails.",
          "Desde el ancla A la cadena es identidad → intermedia B → certificado cruzado de B → A. Si falta cualquier enlace, la validación falla.",
        ],
        anchor: ["ra"],
        path: ["ib_eb", "rb_ib", "ra_rb"],
      },
      {
        label: ["Direct path", "Ruta directa"],
        caption: [
          "A validator that also trusts B may take the direct path, shorter and not going through A. The cross-certificate does not make it unnecessary.",
          "Un validador que también confíe en B puede tomar la ruta directa, más corta y sin pasar por A. El certificado cruzado no la hace innecesaria.",
        ],
        anchor: ["rb"],
        path: ["ib_eb", "rb_ib"],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  unifying: {
    title: ["Unifying trust point", "Punto de confianza unificador"],
    w: 760,
    h: 500,
    nodes: [
      {
        id: "u",
        kind: "ca",
        x: 380,
        y: 22,
        label: UNIFIER,
        sub: KEY,
        slots: [{ label: SELF, phase: 1 }],
        phase: 1,
      },
      {
        id: "a",
        kind: "ca",
        x: 146,
        y: 166,
        label: PCA_A,
        sub: ["key A", "clave A"],
        slots: [
          { label: SELF, phase: 0 },
          { label: crossBy(UNIFIER), phase: 1, from: "u" },
        ],
      },
      {
        id: "b",
        kind: "ca",
        x: 614,
        y: 166,
        label: PCA_B,
        sub: ["key B", "clave B"],
        slots: [
          { label: SELF, phase: 0 },
          { label: crossBy(UNIFIER), phase: 1, from: "u" },
        ],
      },
      { id: "ea", kind: "leaf", x: 146, y: 320, label: IDENTITY(" A") },
      { id: "eb", kind: "leaf", x: 614, y: 320, label: IDENTITY(" B") },
      {
        id: "rp",
        kind: "party",
        x: 380,
        y: 396,
        label: ["Relying party", "Consumidor"],
        sub: ["trust store", "almacén de confianza"],
        slots: [
          {
            label: ["anchor: Unifying CA", "ancla: CA unificadora"],
            phase: 2,
          },
        ],
        phase: 2,
      },
    ],
    edges: [
      { id: "a_ea", from: "a", to: "ea", kind: "issue", phase: 0 },
      { id: "b_eb", from: "b", to: "eb", kind: "issue", phase: 0 },
      { id: "u_a", from: "u", to: "a", kind: "issue", label: SIGNS, phase: 1 },
      { id: "u_b", from: "u", to: "b", kind: "issue", label: SIGNS, phase: 1 },
      {
        id: "rp_u",
        from: "rp",
        to: "u",
        kind: "trust",
        label: TRUSTS,
        phase: 2,
      },
    ],
    phases: [
      {
        label: ["Two domains", "Dos dominios"],
        caption: [
          "Each principal CA is self-signed and issues inside its own domain.",
          "Cada CA principal está autofirmada y emite dentro de su propio dominio.",
        ],
      },
      {
        label: UNIFIER,
        caption: [
          "A superior CA unilaterally signs both PCAs. Each PCA keeps its self-signed certificate and its existing operation; it just gains a second one.",
          "Una CA superior firma unilateralmente a las dos PCAs. Cada PCA conserva su certificado autofirmado y su operación actual; solo gana un segundo certificado.",
        ],
      },
      {
        label: ["New anchor", "Ancla nueva"],
        caption: [
          "The relying parties that need cross-domain validation install the unifying CA as their anchor. One that only needs its own domain can keep trusting its PCA.",
          "Los consumidores que necesitan validar entre dominios instalan la CA unificadora como su ancla. El que solo necesita su propio dominio puede seguir confiando en su PCA.",
        ],
        anchor: ["u"],
      },
      {
        label: ["Cross-domain", "Entre dominios"],
        caption: [
          "From that anchor, an identity in either domain validates through the PCA's cross-certificate.",
          "Desde esa ancla, una identidad de cualquiera de los dominios valida a través del certificado cruzado de su PCA.",
        ],
        anchor: ["u"],
        path: ["b_eb", "u_b"],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  bridge: {
    title: ["Bridge CA", "CA puente"],
    w: 760,
    h: 430,
    nodes: [
      {
        id: "a",
        kind: "ca",
        x: 110,
        y: 56,
        label: PCA_A,
        sub: ["key A", "clave A"],
        slots: [
          { label: SELF, phase: 0 },
          { label: crossBy(BRIDGE), phase: 1, from: "p" },
        ],
      },
      {
        id: "p",
        kind: "ca",
        x: 380,
        y: 42,
        label: BRIDGE,
        sub: ["key, not an anchor", "clave, no un ancla"],
        slots: [
          { label: SELF, phase: 0 },
          { label: crossBy(PCA_A), phase: 1, from: "a" },
          { label: crossBy(PCA_B), phase: 2, from: "b" },
        ],
      },
      {
        id: "b",
        kind: "ca",
        x: 650,
        y: 56,
        label: PCA_B,
        sub: ["key B", "clave B"],
        slots: [
          { label: SELF, phase: 0 },
          { label: crossBy(BRIDGE), phase: 2, from: "p" },
        ],
      },
      { id: "ea", kind: "leaf", x: 110, y: 318, label: IDENTITY(" A") },
      { id: "eb", kind: "leaf", x: 650, y: 318, label: IDENTITY(" B") },
    ],
    edges: [
      { id: "a_ea", from: "a", to: "ea", kind: "issue", phase: 0 },
      { id: "b_eb", from: "b", to: "eb", kind: "issue", phase: 0 },
      { id: "a_p", from: "a", to: "p", kind: "issue", phase: 1, bow: -22 },
      { id: "p_a", from: "p", to: "a", kind: "issue", phase: 1, bow: -22 },
      { id: "b_p", from: "b", to: "p", kind: "issue", phase: 2, bow: -22 },
      { id: "p_b", from: "p", to: "b", kind: "issue", phase: 2, bow: -22 },
    ],
    phases: [
      {
        label: ["Domains and bridge", "Dominios y puente"],
        caption: [
          "Two domains that keep their own anchors, and a bridge CA that is not an anchor for either of them.",
          "Dos dominios que conservan sus propias anclas y una CA puente que no es ancla de ninguno.",
        ],
      },
      {
        label: ["A ↔ bridge", "A ↔ puente"],
        caption: [
          "The first relationship is set up after both PKIs are running, and in both directions: A signs the bridge's key and the bridge signs A's.",
          "La primera relación se establece con las dos PKIs ya en marcha, y en ambos sentidos: A firma la clave del puente y el puente firma la de A.",
        ],
      },
      {
        label: ["B ↔ bridge", "B ↔ puente"],
        caption: [
          "B joins the same way. The bridge now holds three certificates for one key; each domain holds two. No domain had to change its anchor.",
          "B se incorpora igual. El puente tiene ya tres certificados para una sola clave; cada dominio tiene dos. Ningún dominio ha tenido que cambiar de ancla.",
        ],
      },
      {
        label: ["Path A → B", "Ruta A → B"],
        caption: [
          "From anchor A the path runs A → bridge → B → identity. The bridge issues end-entity certificates only for its own operation.",
          "Desde el ancla A la ruta es A → puente → B → identidad. El puente solo emite certificados de entidad final para su propia operación.",
        ],
        anchor: ["a"],
        path: ["b_eb", "p_b", "a_p"],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  "trust-list-local": {
    title: ["Local trust list", "Lista de confianza local"],
    w: 760,
    h: 460,
    nodes: [
      {
        id: "rp",
        kind: "party",
        x: 380,
        y: 20,
        label: ["Relying party", "Consumidor"],
        sub: ["trust store", "almacén de confianza"],
        slots: [
          { id: "an_a", label: anchorOf(ROOT_A), phase: 1 },
          { id: "an_b", label: anchorOf(ROOT_B), phase: 1 },
        ],
      },
      {
        id: "a",
        kind: "ca",
        x: 146,
        y: 226,
        label: ROOT_A,
        sub: KEY,
        slots: [{ label: SELF, phase: 0 }],
      },
      {
        id: "b",
        kind: "ca",
        x: 614,
        y: 226,
        label: ROOT_B,
        sub: KEY,
        slots: [{ label: SELF, phase: 0 }],
      },
      { id: "ea", kind: "leaf", x: 146, y: 376, label: IDENTITY(" A") },
      { id: "eb", kind: "leaf", x: 614, y: 376, label: IDENTITY(" B") },
    ],
    edges: [
      { id: "a_ea", from: "a", to: "ea", kind: "issue", phase: 0 },
      { id: "b_eb", from: "b", to: "eb", kind: "issue", phase: 0 },
      {
        id: "rp_a",
        from: "rp",
        to: "a",
        kind: "trust",
        label: TRUSTS,
        phase: 1,
      },
      {
        id: "rp_b",
        from: "rp",
        to: "b",
        kind: "trust",
        label: TRUSTS,
        phase: 1,
      },
    ],
    phases: [
      {
        label: ["Two PKIs", "Dos PKIs"],
        caption: [
          "Two independent roots. Neither signs the other: there is no cross-certification anywhere in this model.",
          "Dos raíces independientes. Ninguna firma a la otra: en este modelo no hay certificación cruzada en ninguna parte.",
        ],
      },
      {
        label: ["Install anchors", "Instalar anclas"],
        caption: [
          "The relying party explicitly installs both roots in its own store. Trust is a local decision, not something a CA grants.",
          "El consumidor instala explícitamente las dos raíces en su propio almacén. La confianza es una decisión local, no algo que conceda una CA.",
        ],
        anchor: ["a", "b"],
      },
      {
        label: ["Both validate", "Ambas validan"],
        caption: [
          "Each identity validates against its own root. The chains stay separate; the list is what makes both acceptable.",
          "Cada identidad valida contra su propia raíz. Las cadenas siguen separadas; es la lista lo que hace aceptables a las dos.",
        ],
        anchor: ["a", "b"],
        path: ["a_ea", "b_eb"],
      },
      {
        label: ["Remove Root B", "Quitar la raíz B"],
        caption: [
          "Removing an anchor from the list is enough to stop accepting its domain, with no change at the CA. Managing additions, removals and updates is the cost of this model.",
          "Quitar un ancla de la lista basta para dejar de aceptar su dominio, sin tocar la CA. Administrar altas, bajas y actualizaciones es el coste de este modelo.",
        ],
        anchor: ["a"],
        fail: ["an_b", "rp_b", "eb"],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  "trust-list-authority": {
    title: ["Trust authority", "Autoridad de confianza"],
    w: 760,
    h: 460,
    nodes: [
      {
        id: "ta",
        kind: "party",
        x: 380,
        y: 22,
        label: ["Trust authority", "Autoridad de confianza"],
        sub: ["maintains the list", "mantiene la lista"],
      },
      {
        id: "list",
        kind: "list",
        x: 380,
        y: 142,
        label: ["Published list", "Lista publicada"],
        sub: ["trust anchors", "anclas de confianza"],
        slots: [
          { label: ROOT_A, phase: 0 },
          { label: ROOT_B, phase: 0 },
        ],
      },
      {
        id: "rp1",
        kind: "party",
        x: 146,
        y: 340,
        label: ["Relying party 1", "Consumidor 1"],
        sub: ["trust store", "almacén de confianza"],
        slots: [{ label: anchorOf(ROOTS_AB), phase: 2 }],
        phase: 1,
      },
      {
        id: "rp2",
        kind: "party",
        x: 614,
        y: 340,
        label: ["Relying party 2", "Consumidor 2"],
        sub: ["trust store", "almacén de confianza"],
        slots: [{ label: anchorOf(ROOT_A), phase: 2 }],
        phase: 1,
      },
    ],
    edges: [
      {
        id: "ta_list",
        from: "ta",
        to: "list",
        kind: "trust",
        label: ["maintains", "mantiene"],
        phase: 0,
      },
      {
        id: "l_rp1",
        from: "list",
        to: "rp1",
        kind: "trust",
        label: ["distributes", "distribuye"],
        phase: 1,
      },
      {
        id: "l_rp2",
        from: "list",
        to: "rp2",
        kind: "trust",
        label: ["distributes", "distribuye"],
        phase: 1,
      },
    ],
    phases: [
      {
        label: ["The list", "La lista"],
        caption: [
          "An authority maintains a shared list of trust anchors for several consumers.",
          "Una autoridad mantiene una lista compartida de anclas de confianza para varios consumidores.",
        ],
      },
      {
        label: ["Distribution", "Distribución"],
        caption: [
          "The list reaches the relying parties. Distributing certificates is not the same as installing trust anchors.",
          "La lista llega a los consumidores. Distribuir certificados no es lo mismo que instalar anclas de confianza.",
        ],
      },
      {
        label: ["Each party decides", "Cada consumidor decide"],
        caption: [
          "Each relying party applies the list according to its own configuration: one installs both anchors, the other keeps only Root A.",
          "Cada consumidor aplica la lista según su propia configuración: uno instala las dos anclas y el otro se queda solo con la raíz A.",
        ],
      },
    ],
  },
};

export type SceneId = keyof typeof SCENES;
