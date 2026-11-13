/**
 * Mermaid theme for the docs. Built on mermaid's "base" theme so every color
 * comes from here instead of mermaid's built-in light/dark palettes.
 *
 * Sources of truth (keep in sync when they change):
 * - docs/app/app.css  → neutral surfaces, hairline borders, blue accent,
 *   square corners, Inter + JetBrains Mono.
 * - landing/src/styles/landing-tokens.css → warm orange accent, used here
 *   only for emphasis (notes, error/terminal states, composite headers) so
 *   diagrams read as part of the same product family as the landing.
 *
 * Mermaid renders to a string of SVG, outside React and Tailwind, so the
 * values are literal hex (themeVariables must be colors it can parse, not
 * `var(--…)`). Fonts are the exception: the SVG is inlined into the page, so
 * it inherits the fonts the page already loaded.
 */

type Palette = {
  dark: boolean;
  /** Page / diagram background (--color-fd-background). */
  bg: string;
  /** Node fill (--lm-surface). */
  surface: string;
  /** Slightly raised fill for clusters and alternating rows. */
  surface2: string;
  /** Hairline stroke for nodes and clusters. */
  border: string;
  /** Stronger stroke for hover-free emphasis and actors. */
  borderStrong: string;
  /** Body text inside nodes (--color-fd-foreground). */
  text: string;
  /** Secondary text: cluster titles, sequence numbers. */
  muted: string;
  /** Edges and arrowheads. */
  line: string;
  /** Docs accent (--lm-accent / --color-fd-primary). */
  accent: string;
  accentSoft: string;
  accentBorder: string;
  /** Landing accent, warm orange. */
  warm: string;
  warmSoft: string;
  warmBorder: string;
  /** Semantic colors from the landing palette. */
  green: string;
  greenSoft: string;
  gold: string;
  goldSoft: string;
  red: string;
  redSoft: string;
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
  line: "#5b5bd8",
  accent: "#0100f8",
  accentSoft: "#e4e4ff",
  accentBorder: "#7d7dfa",
  warm: "#cc5411",
  warmSoft: "#ffe9d6",
  warmBorder: "#e8b88f",
  green: "#13804d",
  greenSoft: "#d9f1e4",
  gold: "#a86b00",
  goldSoft: "#fbefc8",
  red: "#c53030",
  redSoft: "#fbeaea",
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
  line: "#7c84f0",
  accent: "#8f97ff",
  accentSoft: "#1b1e4d",
  accentBorder: "#4a51c9",
  warm: "#ff9b4a",
  warmSoft: "#35200d",
  warmBorder: "#8a5426",
  green: "#5fd49a",
  greenSoft: "#0f3322",
  gold: "#f2be67",
  goldSoft: "#33270a",
  red: "#ff7a7a",
  redSoft: "#2a1414",
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
    primaryColor: p.accentSoft,
    primaryTextColor: p.text,
    primaryBorderColor: p.accent,
    secondaryColor: p.accentSoft,
    secondaryTextColor: p.text,
    secondaryBorderColor: p.accentBorder,
    tertiaryColor: p.surface2,
    tertiaryTextColor: p.text,
    tertiaryBorderColor: p.border,
    lineColor: p.line,
    textColor: p.text,
    mainBkg: p.accentSoft,
    nodeBorder: p.accent,
    nodeTextColor: p.text,
    border2: p.border,
    arrowheadColor: p.line,

    // Flowchart / clusters / edge labels.
    clusterBkg: p.surface2,
    clusterBorder: p.border,
    titleColor: p.text,
    edgeLabelBackground: p.bg,
    defaultLinkColor: p.line,

    // State diagrams.
    stateBkg: p.accentSoft,
    stateLabelColor: p.text,
    labelBackgroundColor: p.bg,
    transitionColor: p.line,
    transitionLabelColor: p.text,
    specialStateColor: p.warm,
    compositeBackground: p.surface2,
    compositeBorder: p.border,
    compositeTitleBackground: p.surface2,
    altBackground: p.surface2,
    innerEndBackground: p.warm,
    errorBkgColor: p.redSoft,
    errorTextColor: p.red,

    // Notes: warm, like the landing's highlighter marks.
    noteBkgColor: p.warmSoft,
    noteTextColor: p.text,
    noteBorderColor: p.warmBorder,

    // Sequence diagrams.
    actorBkg: p.accentSoft,
    actorBorder: p.accent,
    actorTextColor: p.text,
    actorLineColor: p.border,
    signalColor: p.accent,
    signalTextColor: p.text,
    labelBoxBkgColor: p.surface2,
    labelBoxBorderColor: p.border,
    labelTextColor: p.text,
    loopTextColor: p.muted,
    activationBkgColor: p.accentSoft,
    activationBorderColor: p.accent,
    sequenceNumberColor: p.dark ? "#08090b" : "#ffffff",

    // Class / ER.
    classText: p.text,
    attributeBackgroundColorOdd: p.surface,
    attributeBackgroundColorEven: p.surface2,

    // Categorical series (pie, gantt, journey, git…): blue first, then the
    // landing's warm and semantic colors so adjacent slices stay distinct.
    pie1: p.accent,
    pie2: p.warm,
    pie3: p.green,
    pie4: p.borderStrong,
    pie5: p.red,
    pie6: p.accentBorder,
    pie7: p.warmBorder,
    pieTitleTextColor: p.text,
    pieSectionTextColor: p.dark ? "#08090b" : "#ffffff",
    pieStrokeColor: p.bg,
    pieOuterStrokeColor: p.border,
    pieLegendTextColor: p.text,
  };
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

    /* Start and end markers: solid ink, no halo. */
    .start-state, .state-start, .end-state-inner { fill: ${p.warm}; stroke: none; }
    .end-state-outer, .state-end { fill: ${p.bg}; stroke: ${p.warm}; stroke-width: 1.5px; }
    .node .outer-path path { fill: ${p.bg} !important; stroke: ${p.warm} !important; stroke-width: 1.5px; }
    .node .inner-path path { fill: ${p.warm} !important; stroke: ${p.warm} !important; }

    /* Arrows in the docs accent. */
    .transition, .edgePath .path, .flowchart-link { stroke: ${p.line}; }
    marker path, .arrowMarkerPath { fill: ${p.line}; stroke: ${p.line}; }

    /* Nodes cycle through the docs blue and the landing's orange, green and
       gold so neighbouring states are told apart at a glance. Blue is the
       default fill; the other three override it by position. */
    .nodes > .node:nth-child(4n+2) .label-container { fill: ${p.warmSoft}; stroke: ${p.warm}; }
    .nodes > .node:nth-child(4n+3) .label-container { fill: ${p.greenSoft}; stroke: ${p.green}; }
    .nodes > .node:nth-child(4n+4) .label-container { fill: ${p.goldSoft}; stroke: ${p.gold}; }
    .node .label-container { stroke-width: 1.5px; }

    /* Composite states and clusters: raised surface, accent title. */
    .statediagram-cluster rect.outer { fill: ${p.surface2}; stroke: ${p.warmBorder}; }
    .statediagram-cluster .cluster-label, .cluster-label span, .cluster text {
      color: ${p.warm};
      fill: ${p.warm};
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    /* The "highlight" class is the one escape hatch for emphasis. */
    .node.highlight rect, .node.highlight polygon, g.highlight rect {
      fill: ${p.accentSoft};
      stroke: ${p.accent};
    }
    .node.warm rect, g.warm rect {
      fill: ${p.warmSoft};
      stroke: ${p.warm};
    }
    .node.ok rect, g.ok rect { fill: ${p.greenSoft}; stroke: ${p.green}; }
    .node.danger rect, g.danger rect { fill: ${p.redSoft}; stroke: ${p.red}; }
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
