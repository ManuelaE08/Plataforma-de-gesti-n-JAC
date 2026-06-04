export interface DonutSegment {
  label: string;
  value: number;
  /** Color del arco (hex). Conviene un tono claro para que el % en negro sea legible. */
  color: string;
}

interface SegmentedDonutProps {
  title: string;
  subtitle?: string;
  segments: DonutSegment[];
  /** Píldora opcional arriba a la derecha (ej. total de registros). */
  badge?: string;
}

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 80;
const STROKE = 40; // aro más grueso: el % cabe holgado dentro de la rebanada
const GAP = 48; // separación (en unidades de longitud) entre segmentos
const CIRC = 2 * Math.PI * RADIUS;

/**
 * Donut segmentado con gaps redondeados, porcentaje sobre cada arco y
 * leyenda inferior. Estilo inspirado en tarjetas de "breakdown" de dashboards.
 */
function SegmentedDonut({ title, subtitle, segments, badge }: SegmentedDonutProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const fraction = total > 0 ? seg.value / total : 0;
    const startLen = cumulative * CIRC;
    const arcLen = Math.max(fraction * CIRC - GAP, 0.001);
    const midLen = startLen + (fraction * CIRC) / 2;
    const midAngle = (midLen / CIRC) * 2 * Math.PI - Math.PI / 2;
    cumulative += fraction;
    return {
      ...seg,
      fraction,
      dashArray: `${arcLen} ${CIRC - arcLen}`,
      dashOffset: -(startLen + GAP / 2),
      labelX: CENTER + RADIUS * Math.cos(midAngle),
      labelY: CENTER + RADIUS * Math.sin(midAngle),
    };
  });

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{title}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        {badge && (
          <span className="shrink-0 inline-flex items-center rounded-full bg-[#1B7F4B]/10 dark:bg-emerald-400/10 px-3 py-1 text-xs font-bold text-[#1B7F4B] dark:text-emerald-400">
            {badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center my-2">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-[250px] w-[250px] sm:h-[270px] sm:w-[270px]"
          role="img"
          aria-label={title}
        >
          {/* Pista de fondo */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-slate-100 dark:stroke-gray-700/50"
          />

          {/* Segmentos */}
          <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={arc.dashArray}
                strokeDashoffset={arc.dashOffset}
                className="transition-all duration-700 ease-out"
              />
            ))}
          </g>

          {/* Porcentajes sobre cada arco (en negro, segmentos claros) */}
          {arcs.map((arc) =>
            arc.fraction >= 0.05 ? (
              <text
                key={`lbl-${arc.label}`}
                x={arc.labelX}
                y={arc.labelY}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[16px] font-extrabold tabular-nums"
                fill="#000000"
              >
                {Math.round(arc.fraction * 100)}%
              </text>
            ) : null
          )}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-[3px]"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {seg.label}
            </span>
            <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
              {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SegmentedDonut;
