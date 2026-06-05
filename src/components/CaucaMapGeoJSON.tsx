import { useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { FeatureCollection } from "geojson";
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
  const [searchTerm, setSearchTerm] = useState<string>("");

  const geoJsonData = useMemo(() => caucaGeoData as FeatureCollection, []);

  const allMunicipios = useMemo(() => {
    return Array.from(new Set(geoJsonData.features
      .map((feature: any) => feature?.properties?.MPIO_CNMBR || "")
      .filter(Boolean)))
      .sort((a: string, b: string) => a.localeCompare(b, "es", { sensitivity: "base" }));
  }, [geoJsonData]);

  const normalizedSearchTerm = normalizeName(searchTerm);
  const filteredMunicipios = useMemo(() => {
    if (!normalizedSearchTerm) return allMunicipios;
    return allMunicipios.filter((name) => normalizeName(name).includes(normalizedSearchTerm));
  }, [allMunicipios, normalizedSearchTerm]);

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

    const element = (layer as any).getElement?.();
    if (element instanceof Element) {
      element.setAttribute("tabindex", "-1");
      if (element instanceof HTMLElement || element instanceof SVGElement) {
        (element as HTMLElement | SVGElement).style.outline = "none";
      }
    }

    layer.on({
      mouseover: () => {
        setHoveredMunicipio(displayName);
      },
      mouseout: () => {
        setHoveredMunicipio(null);
      },
      click: () => {
        onSelect(displayName);
        if (element instanceof HTMLElement || element instanceof SVGElement) {
          (element as HTMLElement | SVGElement).blur?.();
        }
      },
    });
  };

  const getLegendItems = () => {
    const band1 = Math.max(1, Math.ceil(maxCount * 0.25));
    const band2 = Math.max(band1 + 1, Math.ceil(maxCount * 0.5));
    const band3 = Math.max(band2 + 1, Math.ceil(maxCount * 0.75));

    const makeLabel = (lower: number, upper?: number) => {
      if (upper === undefined || lower > upper) {
        return `${lower}+ JAC${lower === 1 ? "" : "s"}`;
      }
      if (lower === upper) {
        return `${lower} JAC${lower === 1 ? "" : "s"}`;
      }
      return `${lower}-${upper} JACs`;
    };

    const legendBuckets = [
      { label: "Sin JACs", value: 0 },
      { label: makeLabel(1, band1), value: band1 },
      { label: makeLabel(band1 + 1, band2), value: band2 },
      { label: makeLabel(band2 + 1, band3), value: band3 },
      { label: makeLabel(band3 + 1), value: maxCount },
    ];

    return legendBuckets.map((bucket) => ({
      label: bucket.label,
      color: getDensityColor(bucket.value, maxCount),
    }));
  };

  return (
    <div className="rounded-[24px] border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Mapa interactivo</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">Municipios del Cauca</p>
          <p className="mt-1 text-sm text-slate-600">42 municipios con presencia de JAC. Usa la búsqueda o haz clic en el mapa.</p>
        </div>
        <div className="w-full lg:w-96">
          <div className="relative">
            <label htmlFor="municipio-search" className="sr-only">Buscar municipio</label>
            <input
              id="municipio-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar municipio..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
            {searchTerm && (
              <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-2xl">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-800">Resultados de búsqueda ({filteredMunicipios.length})</p>
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700 shadow-sm transition hover:bg-indigo-100"
                  >
                    Limpiar
                  </button>
                </div>
                <div className="max-h-48 overflow-auto space-y-2">
                  {filteredMunicipios.length > 0 ? (
                    filteredMunicipios.slice(0, 10).map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          onSelect(name);
                          setSearchTerm("");
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-base font-medium text-slate-800 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
                      >
                        {name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No se encontró ningún municipio.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-500">Filtra municipios por nombre y selecciona uno para ver sus JAC.</p>
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
        {getLegendItems().map((item) => (
          <div key={item.label} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700">
            <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CaucaMapGeoJSON;
