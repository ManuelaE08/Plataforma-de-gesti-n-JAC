import { useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { JacListItem } from "../modules/jac/types";
import caucaGeoData from "../data/cauca.json";
import L from "leaflet";

interface CaucaMapGeoJSONProps {
  jacs: JacListItem[];
  selectedMunicipio?: string;
  onSelect: (municipio: string) => void;
}

// Paleta de densidades elegante
function getDensityColor(count: number, maxCount: number) {
  if (count === 0) return "#CBD5E1"; // Slate 300
  const ratio = count / Math.max(maxCount, 1);
  if (ratio <= 0.25) return "#86EFAC"; // Light Green
  if (ratio <= 0.5) return "#4ADE80";
  if (ratio <= 0.75) return "#22C55E";
  return "#166534"; // Dark Green
}

// Función auxiliar para normalizar nombres y hacer match con el GeoJSON
function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim()
    .replace(/^PIENDAMO.*$/, "PIENDAMO - TUNIA")
    .replace(/^SOTARA.*$/, "SOTARA - PAISPAMBA")
    .replace(/^TOTORO$/, "TOTORO");
}

function CaucaMapGeoJSON({ jacs, selectedMunicipio, onSelect }: CaucaMapGeoJSONProps) {
  const [hoveredMunicipio, setHoveredMunicipio] = useState<string | null>(null);

  // Contar JAC por municipio
  const municipioCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    jacs.forEach((jac) => {
      const normalized = normalizeName(jac.municipio);
      counts[normalized] = (counts[normalized] ?? 0) + 1;
    });
    return counts;
  }, [jacs]);

  const maxCount = useMemo(() => Math.max(...Object.values(municipioCounts), 1), [municipioCounts]);

  const geoJsonData = useMemo(() => {
    return caucaGeoData;
  }, []);

  // Estilo dinámico para cada municipio
  const getStyle = (feature: any) => {
    const rawName = feature?.properties?.MPIO_CNMBR || "";
    const normName = normalizeName(rawName);
    const count = municipioCounts[normName] ?? 0;
    const isSelected = selectedMunicipio && normalizeName(selectedMunicipio) === normName;
    const isHovered = hoveredMunicipio && normalizeName(hoveredMunicipio) === normName;

    return {
      fillColor: getDensityColor(count, maxCount),
      weight: isSelected ? 3.5 : isHovered ? 2.5 : 1,
      opacity: 1,
      color: isSelected ? "#0F766E" : isHovered ? "#334155" : "#64748B",
      fillOpacity: isSelected || isHovered ? 0.85 : 0.7,
    };
  };

  // Eventos para cada municipio
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const rawName = feature?.properties?.MPIO_CNMBR || "";
    const normName = normalizeName(rawName);

    // Capitalizar primera letra para mostrar en UI
    const displayName = rawName.charAt(0) + rawName.slice(1).toLowerCase();

    // Tooltip persistente al pasar el mouse
    const count = municipioCounts[normName] ?? 0;
    layer.bindTooltip(`<strong>${displayName}</strong><br/>${count} JACs`, {
      sticky: true,
      direction: "top",
      className: "rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs font-medium text-slate-800 shadow-lg",
    });

    layer.on({
      mouseover: () => {
        setHoveredMunicipio(displayName);
      },
      mouseout: () => {
        setHoveredMunicipio(null);
      },
      click: () => {
        onSelect(displayName);
      },
    });
  };

  return (
    <div className="rounded-[24px] border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Mapa interactivo</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">Municipios del Cauca</p>
          <p className="mt-1 text-sm text-slate-600">42 municipios con presencia de JAC. Haz clic para filtrar.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50 min-h-[500px] h-[550px] relative z-[10]">
        <MapContainer
          center={[2.5062, -76.6725]}
          zoom={8.2}
          style={{ width: "100%", height: "100%" }}
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <GeoJSON
            key={selectedMunicipio || "none"}
            data={geoJsonData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2 md:grid-cols-5">
        {[
          { label: "Sin JACs", color: "bg-slate-300" },
          { label: "1-2 JACs", color: "bg-[#86EFAC]" },
          { label: "3-5 JACs", color: "bg-[#4ADE80]" },
          { label: "6-10 JACs", color: "bg-[#22C55E]" },
          { label: "11+ JACs", color: "bg-[#166534]" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700">
            <span className={`inline-flex h-3 w-3 rounded-full ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CaucaMapGeoJSON;
