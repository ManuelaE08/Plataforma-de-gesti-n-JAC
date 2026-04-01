import { ChevronDown } from "lucide-react";

interface SelectFilterProps {
  placeholder: string;
  options: string[];
}

function SelectFilter({ placeholder, options }: SelectFilterProps) {
  return (
    <div className="relative">
      <select className="appearance-none w-full bg-white border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer">
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

export default SelectFilter;