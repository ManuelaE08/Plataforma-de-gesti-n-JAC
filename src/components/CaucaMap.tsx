import type { MunicipioPosition } from "../data/mockData";

interface CaucaMapProps {
  puntos: Array<MunicipioPosition & { count: number }>;
  selectedMunicipio?: string;
  onSelect: (municipio: string) => void;
}

function getDensityColor(count: number, maxCount: number) {
  if (count === 0) return "#E5E7EB";
  const ratio = count / Math.max(maxCount, 1);
  if (ratio <= 0.2) return "#86EFAC";
  if (ratio <= 0.4) return "#4ADE80";
  if (ratio <= 0.7) return "#22C55E";
  return "#1B7F4B";
}

function CaucaMap({ puntos, selectedMunicipio, onSelect }: CaucaMapProps) {
  const maxCount = puntos.reduce((prev, current) => Math.max(prev, current.count), 0);

  return (
    <div className="rounded-[24px] border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Mapa del Cauca</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">42 municipios</p>
        </div>
        <div className="rounded-3xl bg-slate-100 px-3 py-2 text-xs text-slate-600">SVG interactivo</div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50 p-4 h-[500px] flex items-center justify-center">
        <svg viewBox="0 0 420 340" className="w-full h-full max-h-full" role="img" aria-label="Mapa interactivo de municipios del Cauca" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="mapShadow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000" floodOpacity="0.12" />
            </filter>
          </defs>
          <rect x="0" y="0" width="420" height="340" rx="32" fill="#F8FAFC" />
          <g filter="url(#mapShadow)">
            {puntos.map((punto) => {
              const fill = getDensityColor(punto.count, maxCount);
              const isSelected = punto.nombre === selectedMunicipio;
              const radius = Math.max(8, Math.min(18, punto.importance * 3 + 7));

              return (
                <g key={punto.nombre} transform={`translate(${punto.x}, ${punto.y})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r={radius}
                    fill={fill}
                    stroke={isSelected ? "#1B7F4B" : "rgba(15, 23, 42, 0.08)"}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="cursor-pointer transition-all duration-200 hover:opacity-90"
                    onClick={() => onSelect(punto.nombre)}
                    aria-label={`Municipio ${punto.nombre} con ${punto.count} JACs`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect(punto.nombre);
                      }
                    }}
                  />
                  {punto.count > 0 && (
                    <text x="0" y="4" textAnchor="middle" className="text-[10px] font-semibold fill-slate-900 pointer-events-none">{punto.count}</text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Sin JACs", color: "bg-slate-300" },
          { label: "Bajo", color: "bg-[#86EFAC]" },
          { label: "Medio", color: "bg-[#4ADE80]" },
          { label: "Medio-alto", color: "bg-[#22C55E]" },
          { label: "Alta", color: "bg-[#1B7F4B] text-white" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700">
            <span className={`inline-flex h-3.5 w-3.5 rounded-full ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CaucaMap;
