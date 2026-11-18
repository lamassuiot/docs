import { Pause, Play, RotateCcw } from "lucide-react";
import {
  type CSSProperties,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDemoAutoplay } from "@/lib/demo-autoplay";
import {
  type EdgeSpec,
  HEAD_H,
  type NodeSpec,
  nodeHeight,
  nodeWidth,
  SCENES,
  SLOT_GAP,
  SLOT_H,
  type Slot,
  t,
} from "@/lib/trust-models";

/** How long each step stays on screen while the diagram plays itself. */
const STEP_MS = 3600;
/** The opening step is quicker: it only sets the scene. */
const FIRST_STEP_MS = 1800;
/** Gap between a node's edge and the start of an arrow, in user units. */
const EDGE_GAP = 7;

type Point = { x: number; y: number };
type Box = {
  cx: number;
  cy: number;
  w: number;
  h: number;
  left: number;
  top: number;
};

/* ── Geometry ───────────────────────────────────────────────────────────── */

/**
 * Where a line aimed at `towards` leaves the box, plus `EDGE_GAP` of air.
 * Scaling the direction vector by the smaller of the two half-extent ratios
 * lands the point on whichever side the line actually crosses.
 */
function exitPoint(box: Box, towards: Point): Point {
  const dx = towards.x - box.cx;
  const dy = towards.y - box.cy;
  const len = Math.hypot(dx, dy) || 1;
  const tx = dx === 0 ? Number.POSITIVE_INFINITY : box.w / 2 / Math.abs(dx);
  const ty = dy === 0 ? Number.POSITIVE_INFINITY : box.h / 2 / Math.abs(dy);
  const k = Math.min(tx, ty) + EDGE_GAP / len;
  return { x: box.cx + dx * k, y: box.cy + dy * k };
}

type EdgeGeometry = {
  d: string;
  /** Midpoint of the curve, where the label sits. */
  mid: Point;
  /** Unit normal at the midpoint, to push a label clear of the line. */
  norm: Point;
  /** Arrowhead tip and the angle it points at, in degrees. */
  tip: Point;
  angle: number;
};

/**
 * A quadratic curve between two boxes. `bow` pushes the control point
 * perpendicular to the straight line, which is what keeps the two halves of a
 * reciprocal pair (A → B and B → A) from landing on top of each other.
 */
function edgeGeometry(from: Box, to: Box, bow = 0): EdgeGeometry {
  const mx = (from.cx + to.cx) / 2;
  const my = (from.cy + to.cy) / 2;
  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;
  const len = Math.hypot(dx, dy) || 1;
  const ctrl: Point = { x: mx + (-dy / len) * bow, y: my + (dx / len) * bow };

  const start = exitPoint(from, ctrl);
  const end = exitPoint(to, ctrl);
  // Point and tangent of the quadratic at t = 0.5.
  const mid: Point = {
    x: 0.25 * start.x + 0.5 * ctrl.x + 0.25 * end.x,
    y: 0.25 * start.y + 0.5 * ctrl.y + 0.25 * end.y,
  };
  const angle = (Math.atan2(end.y - ctrl.y, end.x - ctrl.x) * 180) / Math.PI;
  // The tangent of a quadratic at t = 0.5 is simply end - start.
  const tl = Math.hypot(end.x - start.x, end.y - start.y) || 1;
  const norm: Point = { x: -(end.y - start.y) / tl, y: (end.x - start.x) / tl };

  return {
    d: `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`,
    mid,
    norm,
    tip: end,
    angle,
  };
}

function boxOf(node: NodeSpec): Box {
  const w = nodeWidth(node);
  const h = nodeHeight(node);
  return {
    cx: node.x,
    cy: node.y + h / 2,
    w,
    h,
    left: node.x - w / 2,
    top: node.y,
  };
}

/** Centre of the row a certificate chip occupies inside its node. */
function slotPoint(node: NodeSpec, index: number): Point {
  return {
    x: node.x,
    y: node.y + HEAD_H + 4 + index * (SLOT_H + SLOT_GAP) + SLOT_H / 2,
  };
}

/* ── Glyphs ─────────────────────────────────────────────────────────────── */

/** A key: the thing a CA actually is, and the thing its certificates share. */
function KeyGlyph() {
  return (
    <g className="lm-td-glyph">
      <circle cx="-4.5" cy="0" r="3.4" />
      <path d="M -1.3 0 H 7 M 4.2 0 V 3.2 M 6.6 0 V 2.4" />
    </g>
  );
}

/** A certificate: one document signed by one issuer. */
function CertGlyph() {
  return (
    <g className="lm-td-glyph">
      <rect x="-5.5" y="-4.5" width="11" height="9" />
      <path d="M -3 -1.6 H 3 M -3 1.2 H 1" />
    </g>
  );
}

/** A trust store, drawn as a shield. */
function StoreGlyph() {
  return (
    <g className="lm-td-glyph">
      <path d="M 0 -5.2 L 5 -3.2 V 0.4 Q 5 3.8 0 5.4 Q -5 3.8 -5 0.4 V -3.2 Z" />
    </g>
  );
}

/* ── Rendering ──────────────────────────────────────────────────────────── */

type RenderProps = { locale: "en" | "es"; phase: number; fail: Set<string> };

function SlotChip({
  node,
  slot,
  index,
  source,
  locale,
  phase,
  fail,
}: RenderProps & {
  node: NodeSpec;
  slot: Slot;
  index: number;
  source: Box | null;
}) {
  const w = nodeWidth(node) - 16;
  const p = slotPoint(node, index);
  // A reserved-but-empty row only makes sense once its card is on screen.
  const nodeOn = phase >= (node.phase ?? 0);
  const on = nodeOn && phase >= slot.phase;
  const failed = slot.id !== undefined && fail.has(slot.id);
  // Where the chip flies in from, relative to its own resting place.
  const vars =
    source && on
      ? ({
          "--lm-td-dx": `${(source.cx - p.x).toFixed(1)}px`,
          "--lm-td-dy": `${(source.cy - p.y).toFixed(1)}px`,
        } as CSSProperties)
      : undefined;

  return (
    <g transform={`translate(${p.x} ${p.y})`}>
      <g
        className={`lm-td-slot${nodeOn ? "" : " is-off"}${on ? " is-on" : ""}${source ? " can-fly" : ""}${failed ? " is-fail" : ""}`}
        style={vars}
      >
        <rect x={-w / 2} y={-SLOT_H / 2} width={w} height={SLOT_H} rx="0" />
        <g transform={`translate(${-w / 2 + 14} 0)`}>
          <CertGlyph />
        </g>
        <text x={-w / 2 + 26} y="0.5" className="lm-td-slot-label">
          {t(slot.label, locale)}
        </text>
        {failed ? (
          <path
            className="lm-td-strike"
            d={`M ${-w / 2 + 4} ${-SLOT_H / 2 + 3} L ${w / 2 - 4} ${SLOT_H / 2 - 3}`}
          />
        ) : null}
      </g>
    </g>
  );
}

function NodeCard({
  node,
  locale,
  phase,
  fail,
  anchors,
  boxes,
}: RenderProps & {
  node: NodeSpec;
  anchors: Set<string>;
  boxes: Map<string, Box>;
}) {
  const w = nodeWidth(node);
  const h = nodeHeight(node);
  const on = phase >= (node.phase ?? 0);
  const isAnchor = anchors.has(node.id);
  const failed = fail.has(node.id);
  const leaf = node.kind === "leaf";

  return (
    <>
      <g
        transform={`translate(${node.x - w / 2} ${node.y})`}
        className={[
          "lm-td-node",
          `is-${node.kind}`,
          on ? "is-on" : "",
          isAnchor ? "is-anchor" : "",
          failed ? "is-fail" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <rect className="lm-td-card" x="0" y="0" width={w} height={h} />

        {leaf ? (
          <>
            <g transform={`translate(18 ${h / 2})`}>
              <CertGlyph />
            </g>
            <text x="32" y={h / 2 + 0.5} className="lm-td-leaf-label">
              {t(node.label, locale)}
            </text>
          </>
        ) : (
          <>
            <g transform="translate(20 17)">
              {node.kind === "ca" ? <KeyGlyph /> : <StoreGlyph />}
            </g>
            <text x="34" y="14" className="lm-td-title">
              {t(node.label, locale)}
            </text>
            {node.sub ? (
              <text x="34" y="27.5" className="lm-td-sub">
                {t(node.sub, locale)}
              </text>
            ) : null}
            {node.slots?.length ? (
              <line
                className="lm-td-rule"
                x1="8"
                y1={HEAD_H - 2}
                x2={w - 8}
                y2={HEAD_H - 2}
              />
            ) : null}
          </>
        )}

        {isAnchor ? (
          <g className="lm-td-anchor-tag" transform={`translate(${w - 10} 0)`}>
            <rect x="-66" y="-9" width="66" height="18" />
            <text x="-33" y="0.5">
              {locale === "es" ? "ANCLA" : "ANCHOR"}
            </text>
          </g>
        ) : null}
      </g>

      {/* Certificate chips are positioned in scene coordinates, so they are
          rendered outside the group that places the card. */}
      {node.slots?.map((slot, i) => (
        <SlotChip
          key={`${node.id}-slot-${t(slot.label, "en")}`}
          node={node}
          slot={slot}
          index={i}
          source={slot.from ? (boxes.get(slot.from) ?? null) : null}
          locale={locale}
          phase={phase}
          fail={fail}
        />
      ))}
    </>
  );
}

function Edge({
  edge,
  geo,
  locale,
  phase,
  fail,
}: RenderProps & { edge: EdgeSpec; geo: EdgeGeometry }) {
  const on = phase >= edge.phase;
  const failed = fail.has(edge.id);
  const cls = [
    "lm-td-edge",
    `is-${edge.kind}`,
    on ? "is-on" : "",
    failed ? "is-fail" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const solid = edge.kind === "issue";
  // A crossed-out link keeps the cross on the line and moves its label clear.
  const crossed = edge.kind === "ghost" || failed;
  const label = crossed
    ? { x: geo.mid.x + geo.norm.x * 17, y: geo.mid.y + geo.norm.y * 17 }
    : geo.mid;

  return (
    <g className={cls}>
      <path
        className="lm-td-line"
        d={geo.d}
        pathLength={solid ? 1 : undefined}
      />
      <path
        className="lm-td-head"
        d="M 0 0 L -8 -4 L -8 4 Z"
        transform={`translate(${geo.tip.x} ${geo.tip.y}) rotate(${geo.angle})`}
      />
      {edge.label ? (
        <text
          className="lm-td-edge-label"
          x={label.x}
          y={label.y}
          paintOrder="stroke"
        >
          {t(edge.label, locale)}
        </text>
      ) : null}
      {crossed ? (
        <g transform={`translate(${geo.mid.x} ${geo.mid.y})`}>
          <path className="lm-td-cross" d="M -5 -5 L 5 5 M 5 -5 L -5 5" />
        </g>
      ) : null}
    </g>
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */

/**
 * An animated trust-model diagram, replacing the flowcharts that used to
 * describe these topologies as static boxes.
 *
 * Every scene is a short sequence of steps the reader can play, pause or jump
 * between. Two things the diagram is built to make visible:
 *
 * - a CA is a key pair, and the certificates for that key stack up inside its
 *   card — so a cross-signed root visibly becomes one key with two
 *   certificates, the same subject under two different issuers;
 * - cross-signing, bridging and installing an anchor are steps that happen
 *   after the PKIs already exist, so they arrive as later phases rather than
 *   as lines that were always on the page.
 *
 * Scene data lives in `app/lib/trust-models.ts`.
 */
export function TrustDiagram({
  model,
  locale = "en",
}: {
  model: string;
  locale?: "en" | "es";
}) {
  const scene = SCENES[model];
  const rawId = useId();
  const svgId = `td-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const figRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoplayPref] = useDemoAutoplay();
  const autoStarted = useRef(false);

  const { boxes, edges } = useMemo(() => {
    const boxes = new Map<string, Box>();
    if (!scene)
      return { boxes, edges: [] as { edge: EdgeSpec; geo: EdgeGeometry }[] };
    for (const node of scene.nodes) boxes.set(node.id, boxOf(node));
    const edges = scene.edges.map((edge) => ({
      edge,
      geo: edgeGeometry(
        boxes.get(edge.from) as Box,
        boxes.get(edge.to) as Box,
        edge.bow ?? 0,
      ),
    }));
    return { boxes, edges };
  }, [scene]);

  const steps = scene?.phases.length ?? 0;
  const atEnd = phase >= steps - 1;

  // Play once, the first time the reader scrolls the diagram into view, and
  // only when the site-wide Auto-play switch is on and the reader has not
  // asked for reduced motion. The controls below stay available either way.
  useEffect(() => {
    const el = figRef.current;
    if (!el || !autoplayPref || steps < 2) return;
    if (
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !autoStarted.current) {
            autoStarted.current = true;
            setPhase(0);
            setPlaying(true);
          }
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoplayPref, steps]);

  useEffect(() => {
    if (!playing) return;
    if (phase >= steps - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(
      () => setPhase(phase + 1),
      phase === 0 ? FIRST_STEP_MS : STEP_MS,
    );
    return () => clearTimeout(id);
  }, [playing, phase, steps]);

  if (!scene) {
    return null;
  }

  const current = scene.phases[phase];
  const anchors = new Set(current.anchor ?? []);
  const fail = new Set(current.fail ?? []);
  const sceneTitle = t(scene.title, locale);
  const caption = t(current.caption, locale);

  const playLabel = atEnd
    ? locale === "es"
      ? "Repetir"
      : "Replay"
    : playing
      ? locale === "es"
        ? "Pausar"
        : "Pause"
      : locale === "es"
        ? "Reproducir"
        : "Play";

  return (
    <figure className="lm-td" ref={figRef}>
      <div className="lm-td-stage">
        <svg
          viewBox={`0 0 ${scene.w} ${scene.h}`}
          className="lm-td-svg"
          role="img"
          aria-labelledby={`${svgId}-t ${svgId}-c`}
        >
          <title id={`${svgId}-t`}>{sceneTitle}</title>
          <desc id={`${svgId}-c`}>{caption}</desc>

          {edges.map(({ edge, geo }) => (
            <Edge
              key={edge.id}
              edge={edge}
              geo={geo}
              locale={locale}
              phase={phase}
              fail={fail}
            />
          ))}

          {/* Validation path: one stroke per hop, drawn from the end-entity
              certificate back to the anchor, against the issuance arrows.
              Keyed by phase so stepping back and forth replays it. */}
          {current.path?.map((edgeId, i) => {
            const hop = edges.find((e) => e.edge.id === edgeId);
            if (!hop) return null;
            return (
              <path
                key={`${phase}-trace-${edgeId}`}
                className="lm-td-trace"
                d={hop.geo.d}
                pathLength={1}
                style={{ animationDelay: `${i * 420}ms` }}
              />
            );
          })}

          {scene.nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              boxes={boxes}
              anchors={anchors}
              locale={locale}
              phase={phase}
              fail={fail}
            />
          ))}
        </svg>
      </div>

      <div className="lm-td-controls">
        <button
          type="button"
          className="lm-td-play"
          onClick={() => {
            if (atEnd) {
              setPhase(0);
              setPlaying(true);
            } else {
              setPlaying(!playing);
            }
          }}
        >
          {atEnd ? (
            <RotateCcw aria-hidden="true" />
          ) : playing ? (
            <Pause aria-hidden="true" />
          ) : (
            <Play aria-hidden="true" />
          )}
          <span>{playLabel}</span>
        </button>

        <ol className="lm-td-steps">
          {scene.phases.map((p, i) => (
            <li key={t(p.label, "en")}>
              <button
                type="button"
                className={`lm-td-step${i === phase ? " is-current" : ""}${i < phase ? " is-done" : ""}`}
                aria-current={i === phase ? "step" : undefined}
                onClick={() => {
                  setPlaying(false);
                  setPhase(i);
                }}
              >
                <span className="lm-td-step-n">{i + 1}</span>
                <span className="lm-td-step-l">{t(p.label, locale)}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <figcaption className="lm-td-caption" aria-live="polite">
        {caption}
      </figcaption>
    </figure>
  );
}
