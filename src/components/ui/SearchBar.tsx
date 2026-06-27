import { Search } from "lucide-react";
import type { ChangeEvent } from "react";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2.5 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-[#E4B400]/30 focus-within:border-[#E4B400] transition-all w-full">
      {/* Icono aumentado a 18 para equilibrar el texto base */}
      <Search size={18} className="text-gray-400 dark:text-gray-500 shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        /* Tamaño de fuente adaptado a text-base global */
        className="text-base text-gray-600 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none w-full bg-transparent"
      />
    </div>
  );
}

export default SearchBar;