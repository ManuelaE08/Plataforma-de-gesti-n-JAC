import { Search, MapPin } from "lucide-react";
import type { JAC } from "../data/mockData";

interface JACDirectoryProps {
  jacs: JAC[];
  searchTerm: string;
  selectedZona: "Todas" | "Urbanas" | "Rurales";
  selectedMunicipio?: string;
  onSearchTermChange: (value: string) => void;
  onZonaChange: (value: "Todas" | "Urbanas" | "Rurales") => void;
  onClearMunicipio: () => void;
}

function JACDirectory({
  jacs,
  searchTerm,
  selectedZona,
  selectedMunicipio,
  onSearchTermChange,
  onZonaChange,
  onClearMunicipio,
}: JACDirectoryProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Directorio de JACs</p>
          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Búsqueda y Directorio de Organizaciones</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Buscar por nombre de JAC..."
            className="w-full rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-3 pl-11 pr-4 text-sm text-slate-700 dark:text-gray-200 outline-none transition focus:border-[#E4B400] focus:ring-2 focus:ring-[#E4B400]/20 placeholder:text-slate-400 dark:placeholder:text-gray-500"
            aria-label="Buscar por nombre de JAC"
          />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        {(["Todas", "Urbanas", "Rurales"] as const).map((zona) => {
          const active = selectedZona === zona;
          return (
            <button
              key={zona}
              type="button"
              onClick={() => onZonaChange(zona)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? "bg-[#E4B400] text-white shadow-md" : "bg-white dark:bg-gray-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-600"
              }`}
            >
              {zona}
            </button>
          );
        })}
      </div>

      {selectedMunicipio && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[#D1FAE5] dark:border-yellow-900/50 bg-[#ECFDF5] dark:bg-yellow-950/20 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#D1FAE5] dark:bg-yellow-800 text-[#166534] dark:text-yellow-100">F</span>
          <div>
            <p className="text-sm font-semibold text-[#166534] dark:text-yellow-400">Filtrando por:</p>
            <p className="text-sm font-medium">{selectedMunicipio}</p>
          </div>
          <button
            type="button"
            onClick={onClearMunicipio}
            className="rounded-full bg-[#DCFCE7] dark:bg-yellow-900/50 px-3 py-1 text-xs font-semibold text-[#166534] dark:text-yellow-300 hover:opacity-90"
          >
            Quitar filtro
          </button>
        </div>
      )}

      <div className="max-h-[600px] overflow-y-auto pr-1">
        <div className="grid gap-4">
          {jacs.length === 0 ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/20 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-slate-600">
                <Search size={32} />
              </div>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">No se encontraron JACs</p>
              <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">Intenta ajustar tus criterios de búsqueda o filtrar por otro municipio.</p>
            </div>
          ) : (
            jacs.map((jac) => (
              <div key={jac.id} className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 p-4 shadow-sm transition hover:border-[#E4B400] dark:hover:border-yellow-500 hover:shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {jac.nombre}
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4B400]/30 dark:border-yellow-800/50 bg-[#ECFDF5] dark:bg-yellow-950/20 px-3 py-1.5 text-xs sm:text-sm font-bold text-[#E4B400] dark:text-yellow-400 shadow-sm uppercase tracking-wider">
                    <MapPin size={13} className="text-[#E4B400] dark:text-yellow-400 shrink-0" />
                    {jac.municipio}
                  </span>
                  
                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm ${
                    jac.tipoZona === "Urbana"
                      ? "border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-950/20 text-[#166534] dark:text-yellow-400"
                      : "border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 text-[#5B21B6] dark:text-purple-400"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${jac.tipoZona === "Urbana" ? "bg-yellow-500" : "bg-purple-500"}`} />
                    {jac.tipoZona}
                  </span>

                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm ${
                    jac.estado === "Activa"
                      ? "border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-950/20 text-[#166534] dark:text-yellow-400"
                      : "border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/20 text-slate-500 dark:text-slate-400"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${jac.estado === "Activa" ? "bg-yellow-500 animate-pulse" : "bg-slate-400"}`} />
                    {jac.estado}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
        Mostrando {jacs.length} JAC{jacs.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}

export default JACDirectory;
