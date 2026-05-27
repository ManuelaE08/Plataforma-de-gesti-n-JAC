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

// Usamos exactamente la misma clase estilizada que tienes en tu archivo principal para los selectores
const selectCls = "appearance-none w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-base text-gray-600 dark:text-gray-300 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat";

export default function MunicipioCombobox({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={selectCls}
    >
      <option value="">Todos los municipios</option>
      {MUNICIPIOS.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}