import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown } from "lucide-react";

interface MunicipioSearchProps {
  municipios: string[];
  onSelect: (municipio: string) => void;
  placeholder?: string;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Combobox con búsqueda: el usuario escribe, filtra la lista de municipios y
 * selecciona uno de la lista desplegable. Al seleccionar dispara `onSelect`.
 */
function MunicipioSearch({ municipios, onSelect, placeholder }: MunicipioSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = normalize(query);
    const list = q
      ? municipios.filter((m) => normalize(m).includes(q))
      : municipios;
    return list.slice(0, 50);
  }, [query, municipios]);

  // Cierra la lista al hacer click fuera del componente.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const choose = (municipio: string) => {
    setQuery(municipio);
    setOpen(false);
    onSelect(municipio);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlight]) choose(filtered[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Buscar municipio…"}
          className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-3 pl-10 pr-10 text-base text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E4B400]/30 focus:border-[#E4B400] transition-all"
          role="combobox"
          aria-expanded={open}
          aria-controls="municipio-listbox"
        />
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        />
      </div>

      {open && filtered.length > 0 && (
        <ul
          id="municipio-listbox"
          role="listbox"
          className="absolute z-[1000] mt-2 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-1 shadow-xl"
        >
          {filtered.map((m, i) => (
            <li
              key={m}
              role="option"
              aria-selected={i === highlight}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(m);
              }}
              className={`cursor-pointer px-4 py-2.5 text-base transition-colors ${
                i === highlight
                  ? "bg-[#E4B400]/10 text-[#E4B400] dark:bg-yellow-400/10 dark:text-yellow-300"
                  : "text-slate-700 dark:text-slate-200"
              }`}
            >
              {m}
            </li>
          ))}
        </ul>
      )}

      {open && filtered.length === 0 && (
        <div className="absolute z-[1000] mt-2 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 shadow-xl">
          Sin municipios que coincidan con «{query}».
        </div>
      )}
    </div>
  );
}

export default MunicipioSearch;
