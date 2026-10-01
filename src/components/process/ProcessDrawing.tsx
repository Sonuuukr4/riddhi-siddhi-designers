import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * An illustrative plan that is drawn layer by layer, one layer per process
 * stage: site → diagram → structure → light → dimensions → furniture.
 * It is a generic diagram of the design process, not a project drawing.
 *
 * Elements use pathLength=1 so a single CSS rule can draw any stroke.
 */

type DrawProps = { d?: number; className?: string; style?: CSSProperties };
const drawStyle = (d = 0, style?: CSSProperties): CSSProperties => ({ transitionDelay: `${d * 70}ms`, ...style });

const P = ({ d, className, style, ...rest }: DrawProps & { path: string }) => (
  <path d={rest.path} pathLength={1} className={cn("draw", className)} style={drawStyle(d, style)} />
);
const L = ({ d, className, x1, y1, x2, y2 }: DrawProps & { x1: number; y1: number; x2: number; y2: number }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} className={cn("draw", className)} style={drawStyle(d)} />
);
const C = ({ d, className, cx, cy, r }: DrawProps & { cx: number; cy: number; r: number }) => (
  <circle cx={cx} cy={cy} r={r} pathLength={1} className={cn("draw", className)} style={drawStyle(d)} />
);
const R = ({ d, className, x, y, w, h }: DrawProps & { x: number; y: number; w: number; h: number }) => (
  <rect x={x} y={y} width={w} height={h} pathLength={1} className={cn("draw", className)} style={drawStyle(d)} />
);
/** Text and dashed strokes fade rather than draw. */
const T = ({
  x,
  y,
  children,
  anchor = "start",
  d = 4,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
  d?: number;
}) => (
  <text x={x} y={y} textAnchor={anchor} className="fade" style={drawStyle(d)}>
    {children}
  </text>
);
const Dashed = ({ path, d = 0, className }: { path: string; d?: number; className?: string }) => (
  <path d={path} className={cn("fade", className)} strokeDasharray="6 5" style={drawStyle(d)} />
);

function Layer({ index, step, children }: { index: number; step: number; children: ReactNode }) {
  const state = step === index ? "current" : step > index ? "past" : "future";
  return (
    <g className={cn("layer", `layer-${state}`)} data-state={state}>
      {children}
    </g>
  );
}

export function ProcessDrawing({ step }: { step: number }) {
  return (
    <svg
      viewBox="0 0 640 520"
      role="img"
      aria-label="An illustrative plan drawing building up through six stages of the design process"
      className="process-drawing h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
    >
      <defs>
        <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="0.8" />
        </pattern>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10" fill="none" stroke="currentColor" />
        </marker>
      </defs>

      {/* 01 — Understand: site, orientation, sun, access */}
      <Layer index={0} step={step}>
        <Dashed path="M48 62 L592 40 L604 470 L40 458 Z" />
        <Dashed path="M64 470 Q 322 -70 592 470" d={3} className="opacity-60" />
        <C cx={118} cy={248} r={6} d={4} />
        <C cx={322} cy={96} r={8} d={5} />
        <C cx={528} cy={250} r={6} d={6} />
        <T x={322} y={78} anchor="middle" d={6}>
          SUN PATH
        </T>
        <C cx={560} cy={96} r={18} d={2} />
        <P path="M560 80 L567 108 L560 102 L553 108 Z" d={3} />
        <T x={560} y={70} anchor="middle" d={4}>
          N
        </T>
        <L x1={322} y1={510} x2={322} y2={466} d={5} />
        <P path="M314 474 L322 464 L330 474" d={6} />
        <T x={334} y={502} d={7}>
          ACCESS
        </T>
        <C cx={96} cy={104} r={22} d={4} />
        <L x1={80} y1={88} x2={112} y2={120} d={5} />
        <L x1={112} y1={88} x2={80} y2={120} d={5} />
        <C cx={548} cy={420} r={17} d={6} />
        <T x={60} y={448} d={7}>
          SITE
        </T>
      </Layer>

      {/* 02 — Concept: adjacency diagram */}
      <Layer index={1} step={step}>
        <L x1={250} y1={300} x2={320} y2={225} d={5} />
        <L x1={380} y1={262} x2={320} y2={225} d={5} />
        <L x1={420} y1={160} x2={320} y2={225} d={6} />
        <L x1={230} y1={170} x2={320} y2={225} d={6} />
        <L x1={250} y1={300} x2={380} y2={262} d={7} />
        <C cx={250} cy={300} r={56} d={0} />
        <C cx={380} cy={262} r={46} d={1} />
        <C cx={420} cy={160} r={40} d={2} />
        <C cx={230} cy={170} r={38} d={3} />
        <C cx={320} cy={225} r={26} d={4} />
        <T x={250} y={304} anchor="middle">
          LIVE
        </T>
        <T x={380} y={266} anchor="middle">
          GATHER
        </T>
        <T x={420} y={164} anchor="middle">
          REST
        </T>
        <T x={230} y={174} anchor="middle">
          WORK
        </T>
        <T x={320} y={229} anchor="middle">
          CENTRE
        </T>
      </Layer>

      {/* 03 — Develop: structural grid, walls, openings */}
      <Layer index={2} step={step}>
        {[140, 260, 380, 500].map((x, i) => (
          <g key={x}>
            <Dashed path={`M${x} 104 V 398`} d={i} className="opacity-50" />
            <C cx={x} cy={94} r={9} d={i} />
            <T x={x} y={97.5} anchor="middle" d={i + 1}>
              {"ABCD"[i]}
            </T>
          </g>
        ))}
        {[120, 250, 380].map((y, i) => (
          <g key={y}>
            <Dashed path={`M124 ${y} H 516`} d={i + 2} className="opacity-50" />
            <C cx={114} cy={y} r={9} d={i + 2} />
            <T x={114} y={y + 3.5} anchor="middle" d={i + 3}>
              {i + 1}
            </T>
          </g>
        ))}
        <P path="M300 380 H140 V120 H500 V380 H340" d={1} className="wall" />
        <R x={280} y={190} w={100} h={100} d={3} className="wall-thin" />
        <P
          path="M260 120 V170 M140 250 H200 M240 250 H280 M380 250 H430 M470 250 H500 M380 120 V160"
          d={4}
          className="wall-thin"
        />
        <P path="M300 380 A40 40 0 0 0 340 340" d={6} />
        <L x1={340} y1={380} x2={340} y2={340} d={6} />
        <P path="M200 250 A40 40 0 0 1 240 290" d={7} />
        <P path="M430 250 A40 40 0 0 0 470 290" d={7} />
      </Layer>

      {/* 04 — Visualize: poché, open court, light, section cut */}
      <Layer index={3} step={step}>
        <rect x={280} y={190} width={100} height={100} fill="url(#hatch)" stroke="none" className="fade opacity-50" />
        <P path="M140 120 H500 V380 H140 Z M148 128 V372 H492 V128 Z" d={0} className="poche" />
        {[0, 1, 2, 3, 4].map((i) => (
          <L
            key={i}
            x1={160 + i * 22}
            y1={40 + i * 6}
            x2={290 + i * 22}
            y2={200 + i * 6}
            d={i + 1}
            className="opacity-70"
          />
        ))}
        <Dashed path="M90 232 H 560" d={4} className="cut" />
        <C cx={78} cy={232} r={11} d={5} />
        <T x={78} y={236} anchor="middle" d={6}>
          A
        </T>
        <C cx={572} cy={232} r={11} d={5} />
        <T x={572} y={236} anchor="middle" d={6}>
          A
        </T>
        <T x={300} y={180} d={7}>
          OPEN TO SKY
        </T>
      </Layer>

      {/* 05 — Execute: dimensions and levels */}
      <Layer index={4} step={step}>
        <L x1={140} y1={70} x2={500} y2={70} d={0} />
        {[140, 260, 380, 500].map((x, i) => (
          <L key={x} x1={x - 5} y1={75} x2={x + 5} y2={65} d={i + 1} />
        ))}
        {[200, 320, 440].map((x, i) => (
          <T key={x} x={x} y={62} anchor="middle" d={i + 3}>
            3600
          </T>
        ))}
        <L x1={540} y1={120} x2={540} y2={380} d={2} />
        {[120, 250, 380].map((y, i) => (
          <L key={y} x1={535} y1={y + 5} x2={545} y2={y - 5} d={i + 3} />
        ))}
        <T x={552} y={189} d={5}>
          3900
        </T>
        <T x={552} y={319} d={5}>
          3900
        </T>
        <P path="M300 410 L310 398 L320 410 Z" d={5} />
        <T x={326} y={410} d={6}>
          +0.45 FFL
        </T>
        <L x1={140} y1={50} x2={500} y2={50} d={6} />
        <T x={320} y={44} anchor="middle" d={7}>
          10800
        </T>
      </Layer>

      {/* 06 — Refine: furniture, planting, finishes */}
      <Layer index={5} step={step}>
        <R x={162} y={300} w={74} h={30} d={0} />
        <L x1={162} y1={308} x2={236} y2={308} d={1} />
        <C cx={199} cy={350} r={11} d={1} />
        <R x={404} y={286} w={66} h={34} d={2} />
        {[412, 437, 462].map((x, i) => (
          <R key={x} x={x - 6} y={276} w={12} h={7} d={i + 3} />
        ))}
        {[412, 437, 462].map((x, i) => (
          <R key={x} x={x - 6} y={323} w={12} h={7} d={i + 3} />
        ))}
        <R x={404} y={136} w={60} h={74} d={3} />
        <R x={410} y={142} w={20} h={12} d={4} />
        <R x={438} y={142} w={20} h={12} d={4} />
        <R x={158} y={134} w={64} h={22} d={4} />
        <C cx={190} cy={170} r={8} d={5} />
        <C cx={312} cy={228} r={14} d={5} />
        <C cx={350} cy={258} r={10} d={6} />
        <C cx={340} cy={210} r={7} d={6} />
        <P path="M492 160 L560 160 M140 340 L80 340 M330 380 L330 430 L380 430" d={6} className="opacity-70" />
        <T x={566} y={163} d={8}>
          LIME PLASTER
        </T>
        <T x={74} y={336} anchor="end" d={8}>
          TIMBER
        </T>
        <T x={386} y={433} d={8}>
          STONE FLOOR
        </T>
      </Layer>
    </svg>
  );
}
