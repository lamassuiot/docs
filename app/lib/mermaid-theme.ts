/**
 * Mermaid theme for the docs. Built on mermaid's "base" theme so every color
 * comes from here instead of mermaid's built-in light/dark palettes.
 *
 * Sources of truth (keep in sync when they change):
 * - docs/app/app.css → neutral surfaces, hairline borders, Lamassu blue
 *   (--lm-accent / --color-fd-primary), square corners, Inter + JetBrains Mono.
 * - landing/src/styles/landing-tokens.css → the brand gradient
 *   (violet #5a1ff0 → indigo #4d41f6 → blue #3d78f6 → cyan #4ac2f5) and the
 *   semantic green / gold / red (--lp-green, --lp-gold, --lp-red).
 * - dashboard/src/app/globals.css → product blue (--primary, hsl 217 100% 53%),
 *   which sits between the docs blue and the landing cyan.
 *
 * The result is one brand family: blue carries the structure, violet and cyan
 * (the two ends of the gradient) tell neighbours apart and mark start/end
 * states, and green / gold / red are reserved for meaning (ok, note, error).
 *
 * Mermaid renders to a string of SVG, outside React and Tailwind, so the
 * values are literal hex (themeVariables must be colors it can parse, not
 * `var(--…)`). Fonts are the exception: the SVG is inlined into the page, so
 * it inherits the fonts the page already loaded.
 */

/** One hue as stroke + tinted fill + mid-tone border. */
type Swatch = {
  /** Stroke, arrowheads and text-on-background. */
  ink: string;
  /** Node fill. Body text (--color-fd-foreground) stays legible on it. */
  soft: string;
  /** Softer stroke for secondary outlines (clusters, composite states). */
  line: string;
};

type Palette = {
  dark: boolean;
  /** Page / diagram background (--color-fd-background). */
  bg: string;
  /** Node fill for neutral boxes (--lm-surface). */
  surface: string;
  /** Slightly raised fill for clusters and alternating rows (--color-fd-accent). */
  surface2: string;
  /** Hairline stroke for nodes and clusters. */
  border: string;
  /** Stronger neutral stroke. */
  borderStrong: string;
  /** Body text inside nodes (--color-fd-foreground). */
  text: string;
  /** Secondary text: cluster titles, loop labels. */
  muted: string;
  /** Edges and arrowheads: the blue, slightly desaturated so nodes lead. */
  edge: string;
  /** Text on a solid brand fill (sequence numbers, pie slices). */
  onInk: string;

  /** Lamassu blue (docs accent). The default for every node. */
  blue: Swatch;
  /** Gradient start, landing --lp-grad. */
  violet: Swatch;
  /** Gradient end, landing --lp-cyan. */
  cyan: Swatch;
  /** Semantic: success, active, valid. */
  green: Swatch;
  /** Semantic: notes, warnings, pending. */
  gold: Swatch;
  /** Semantic: errors, revoked, failed. */
  red: Swatch;
};

const LIGHT: Palette = {
  dark: false,
  bg: "#ffffff",
  surface: "#fbfbfa",
  surface2: "#f3f3f1",
  border: "#c2c2be",
  borderStrong: "#8f8f8b",
  text: "#171718",
  muted: "#6b6b6b",
  edge: "#4d4dd6",
  onInk: "#ffffff",

  blue: { ink: "#0100f8", soft: "#e7e7ff", line: "#8a8afb" },
  violet: { ink: "#5a1ff0", soft: "#eee7fe", line: "#a88bf6" },
  cyan: { ink: "#1b8fd0", soft: "#e0f2fb", line: "#86c5ea" },
  green: { ink: "#13804d", soft: "#dcf2e6", line: "#80c4a3" },
  gold: { ink: "#a86b00", soft: "#fbf0cc", line: "#dcb766" },
  red: { ink: "#c53030", soft: "#fbeaea", line: "#e39494" },
};

const DARK: Palette = {
  dark: true,
  bg: "#08090b",
  surface: "#0e0f12",
  surface2: "#16171b",
  border: "#3a3b42",
  borderStrong: "#63646c",
  text: "#f3f3f4",
  muted: "#9f9fa3",
  edge: "#7c84f0",
  onInk: "#08090b",

  blue: { ink: "#8f97ff", soft: "#191c4a", line: "#4a51c9" },
  violet: { ink: "#9d8bff", soft: "#21194a", line: "#5b46c4" },
  cyan: { ink: "#4ac2f5", soft: "#0b2737", line: "#1f6f96" },
  green: { ink: "#5fd49a", soft: "#0f3322", line: "#2b7a54" },
  gold: { ink: "#e7b500", soft: "#302606", line: "#7d6312" },
  red: { ink: "#ff7a7a", soft: "#2c1414", line: "#8a3a3a" },
};

const SANS = "Inter, ui-sans-serif, system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

function themeVariables(p: Palette) {
  return {
    darkMode: p.dark,
    background: p.bg,
    fontFamily: SANS,
    fontSize: "14px",

    // Core palette (flowchart, class, ER, requirement…).
    primaryColor: p.blue.soft,
    primaryTextColor: p.text,
    primaryBorderColor: p.blue.ink,
    secondaryColor: p.violet.soft,
    secondaryTextColor: p.text,
    secondaryBorderColor: p.violet.ink,
    tertiaryColor: p.surface2,
    tertiaryTextColor: p.text,
    tertiaryBorderColor: p.border,
    lineColor: p.edge,
    textColor: p.text,
    mainBkg: p.blue.soft,
    nodeBorder: p.blue.ink,
    nodeTextColor: p.text,
    border2: p.border,
    arrowheadColor: p.edge,

    // Flowchart / clusters / edge labels.
    clusterBkg: p.surface2,
    clusterBorder: p.border,
    titleColor: p.text,
    edgeLabelBackground: p.bg,
    defaultLinkColor: p.edge,

    // State diagrams.
    stateBkg: p.blue.soft,
    stateLabelColor: p.text,
    labelBackgroundColor: p.bg,
    transitionColor: p.edge,
    transitionLabelColor: p.text,
    specialStateColor: p.violet.ink,
    compositeBackground: p.surface2,
    compositeBorder: p.border,
    compositeTitleBackground: p.surface2,
    altBackground: p.surface2,
    innerEndBackground: p.violet.ink,
    errorBkgColor: p.red.soft,
    errorTextColor: p.red.ink,

    // Notes: gold, like a highlighter mark in the margin.
    noteBkgColor: p.gold.soft,
    noteTextColor: p.text,
    noteBorderColor: p.gold.line,

    // Sequence diagrams.
    actorBkg: p.blue.soft,
    actorBorder: p.blue.ink,
    actorTextColor: p.text,
    actorLineColor: p.border,
    signalColor: p.edge,
    signalTextColor: p.text,
    labelBoxBkgColor: p.violet.soft,
    labelBoxBorderColor: p.violet.line,
    labelTextColor: p.text,
    loopTextColor: p.muted,
    activationBkgColor: p.cyan.soft,
    activationBorderColor: p.cyan.ink,
    sequenceNumberColor: p.onInk,

    // Class / ER.
    classText: p.text,
    attributeBackgroundColorOdd: p.surface,
    attributeBackgroundColorEven: p.surface2,

    // Categorical series (pie, gantt, journey, git…): walk the brand gradient
    // first, then the semantic colors, so adjacent slices stay distinct.
    pie1: p.blue.ink,
    pie2: p.violet.ink,
    pie3: p.cyan.ink,
    pie4: p.green.ink,
    pie5: p.gold.ink,
    pie6: p.red.ink,
    pie7: p.borderStrong,
    pieTitleTextColor: p.text,
    pieSectionTextColor: p.onInk,
    pieStrokeColor: p.bg,
    pieOuterStrokeColor: p.border,
    pieLegendTextColor: p.text,

    // Git graphs follow the same order.
    git0: p.blue.ink,
    git1: p.violet.ink,
    git2: p.cyan.ink,
    git3: p.green.ink,
    git4: p.gold.ink,
    git5: p.red.ink,
    git6: p.blue.line,
    git7: p.violet.line,
  };
}

/** Fill + stroke for a node painted with one swatch. */
function paint(s: Swatch) {
  return `fill: ${s.soft}; stroke: ${s.ink};`;
}

/**
 * CSS appended to every rendered diagram. It covers what themeVariables
 * cannot: the docs use square corners everywhere, hairline strokes, and
 * monospaced identifiers.
 */
function themeCSS(p: Palette) {
  return `
    /* Square corners, like every other surface in the docs. */
    .node rect, .node polygon, .cluster rect, .statediagram-state rect,
    .statediagram-cluster rect, .label-container, .actor, .note, .labelBox,
    .edgeLabel rect, .classBox rect { rx: 0; ry: 0; }

    /* Flat surfaces: the docs have no drop shadows. */
    .node *, .statediagram-state *, .cluster *, .actor, .note, .labelBox,
    .classBox * { filter: none !important; }

    /* Sequence text follows the page font and stays proportionate. */
    .messageText, .noteText, .loopText, .labelText { font-family: ${SANS}; font-size: 13px !important; stroke: none; }
    .messageText { fill: ${p.text}; }

    /* Hairline strokes. */
    .cluster rect { stroke-width: 1px; }
    .edgePath .path, .flowchart-link, .transition, .messageLine0,
    .messageLine1 { stroke-width: 1.25px; }

    /* Edge labels sit on the page background, with a little breathing room. */
    .edgeLabel, .edgeLabel p, .edgeLabel span {
      background-color: ${p.bg};
      color: ${p.text};
      font-size: 12.5px;
    }
    .edgeLabel p, .edgeLabel span.edgeLabel {
      padding: 1px 6px;
    }
    .edgeLabel rect { fill: ${p.bg}; opacity: 1; }

    /* Identifiers (states, actors, entities) in the docs' mono face. */
    .statediagram-state .label, .statediagram-state .nodeLabel,
    .statediagram-state .nodeLabel p, g.stateGroup text, .actor tspan,
    .entityLabel, .classTitle {
      font-family: ${MONO};
      font-size: 13px;
      font-weight: 500;
      letter-spacing: -0.01em;
    }

    /* Start and end markers: the gradient's violet end, no halo. */
    .start-state, .state-start, .end-state-inner { fill: ${p.violet.ink}; stroke: none; }
    .end-state-outer, .state-end { fill: ${p.bg}; stroke: ${p.violet.ink}; stroke-width: 1.5px; }
    .node .outer-path path { fill: ${p.bg} !important; stroke: ${p.violet.ink} !important; stroke-width: 1.5px; }
    .node .inner-path path { fill: ${p.violet.ink} !important; stroke: ${p.violet.ink} !important; }

    /* Edges in a softened Lamassu blue. */
    .transition, .edgePath .path, .flowchart-link { stroke: ${p.edge}; }
    marker path, .arrowMarkerPath { fill: ${p.edge}; stroke: ${p.edge}; }

    /* Nodes walk the brand gradient (blue → violet → cyan) and then a neutral
       surface, so neighbouring nodes are told apart without borrowing the
       semantic colors. Blue is the default fill; the others go by position. */
    .node .label-container { stroke-width: 1.5px; }
    .nodes > .node:nth-child(4n+2) .label-container { ${paint(p.violet)} }
    .nodes > .node:nth-child(4n+3) .label-container { ${paint(p.cyan)} }
    .nodes > .node:nth-child(4n+4) .label-container { fill: ${p.surface}; stroke: ${p.borderStrong}; }

    /* Composite states and clusters: raised surface, violet title. */
    .statediagram-cluster rect.outer { fill: ${p.surface2}; stroke: ${p.violet.line}; }
    .statediagram-cluster .cluster-label, .cluster-label span, .cluster text {
      color: ${p.violet.ink};
      fill: ${p.violet.ink};
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    /* Explicit classes win over the positional colors above:
         class X ok        → green (valid, active, issued)
         class X warn      → gold  (pending, expiring, note)
         class X danger    → red   (revoked, failed, error)
         class X highlight → blue  (the node the text is about)
         class X violet / cyan → brand colors without a meaning */
    .nodes > .node.highlight .label-container, g.highlight rect { ${paint(p.blue)} }
    .nodes > .node.violet .label-container, g.violet rect { ${paint(p.violet)} }
    .nodes > .node.cyan .label-container, g.cyan rect { ${paint(p.cyan)} }
    .nodes > .node.ok .label-container, g.ok rect { ${paint(p.green)} }
    .nodes > .node.warn .label-container, g.warn rect { ${paint(p.gold)} }
    .nodes > .node.danger .label-container, g.danger rect { ${paint(p.red)} }
  `;
}

/** Full mermaid config for the reader's current color mode. */
export function mermaidConfig(isDark: boolean) {
  const p = isDark ? DARK : LIGHT;
  return {
    startOnLoad: false,
    look: "classic" as const,
    securityLevel: "strict" as const,
    theme: "base" as const,
    themeVariables: themeVariables(p),
    themeCSS: themeCSS(p),
    fontFamily: SANS,
    flowchart: { curve: "basis" as const, padding: 14, htmlLabels: true },
    state: { padding: 12 },
    sequence: {
      mirrorActors: false,
      useMaxWidth: true,
      messageFontFamily: SANS,
      messageFontSize: 13,
      noteFontFamily: SANS,
      noteFontSize: 13,
      actorFontFamily: MONO,
      actorFontSize: 13,
    },
  };
}
