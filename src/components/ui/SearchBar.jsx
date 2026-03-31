import { Search } from "lucide-react";

function SearchBar({ placeholder, value, onChange }) {
  return (
    <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#1B7F4B]/30 focus-within:border-[#1B7F4B] transition-all">
      <Search size={14} className="text-gray-400 shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="text-sm text-gray-600 placeholder:text-gray-400 outline-none w-full"
      />
    </div>
  );
}

export default SearchBar;