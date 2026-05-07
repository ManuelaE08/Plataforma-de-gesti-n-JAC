import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

const MUNICIPIOS = [
  "Almaguer", "Argelia", "Balboa", "Bolívar", "Buenos Aires", "Cajibío",
  "Caldono", "Caloto", "Corinto", "El Tambo", "Florencia", "Guachené",
  "Guapi", "Inzá", "Jambaló", "La Sierra", "La Vega", "López de Micay",
  "Mercaderes", "Miranda", "Morales", "Padilla", "Páez", "Patía",
  "Piamonte", "Piendamó", "Popayán", "Puerto Tejada", "Puracé", "Rosas",
  "San Sebastián", "Santa Rosa", "Santander de Quilichao", "Silvia",
  "Sotará", "Suárez", "Sucre", "Timbío", "Timbiquí", "Toribío",
  "Totoró", "Villa Rica",
];

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function MunicipioCombobox({ value, onChange }: Props) {
  const [query,  setQuery]  = useState(value);
  const [open,   setOpen]   = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Keep input text in sync when parent clears the filter
  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        // If user typed something but didn't pick, revert to committed value
        setQuery(value);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [value]);

  const matches = query.trim()
    ? MUNICIPIOS.filter((m) => m.toLowerCase().includes(query.toLowerCase()))
    : MUNICIPIOS;

  function select(m: string) {
    onChange(m);
    setQuery(m);
    setOpen(false);
  }

  function clear() {
    onChange("");
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#1B7F4B]/30 focus-within:border-[#1B7F4B] transition-all">
        <input
          type="text"
          placeholder="Municipio..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-3 py-2 focus:outline-none"
        />
        {value ? (
          <button
            onClick={clear}
            className="px-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Limpiar"
          >
            <X size={14} />
          </button>
        ) : (
          <span className="px-2 text-gray-400 pointer-events-none">
            <ChevronDown size={14} />
          </span>
        )}
      </div>

      {open && matches.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg text-sm">
          {!query.trim() && (
            <li
              onMouseDown={() => { onChange(""); setQuery(""); setOpen(false); }}
              className="px-3 py-2 text-gray-400 dark:text-gray-500 italic cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Todos los municipios
            </li>
          )}
          {matches.map((m) => (
            <li
              key={m}
              onMouseDown={() => select(m)}
              className={`px-3 py-2 cursor-pointer hover:bg-[#1B7F4B]/10 dark:hover:bg-[#1B7F4B]/20 transition-colors ${
                m === value ? "font-semibold text-[#1B7F4B] dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
