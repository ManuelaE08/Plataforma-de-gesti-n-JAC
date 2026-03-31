import { useState } from "react";
import { Plus, UserRound, Trash2 } from "lucide-react";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import SelectFilter from "../components/ui/SelectFilter";
import EmptyState from "../components/ui/EmptyState";

const jacData = [
  { nombre: "JAC Barrio El Recuerdo", municipio: "Popayán", barrio: "El Recuerdo", afiliados: 125, documental: "Vigente", organizativo: "Activa", aprobacion: "Activo" },
  { nombre: "JAC Vereda La Meseta", municipio: "Santander", barrio: "La Meseta", afiliados: 89, documental: "Vencida", organizativo: "Activa", aprobacion: "Pendiente" },
  { nombre: "JAC Comunidad Los Pinos", municipio: "Patía", barrio: "Los Pinos", afiliados: 156, documental: "Vigente", organizativo: "Activa", aprobacion: "Activo" },
  { nombre: "JAC Barrio Centro", municipio: "Timbío", barrio: "Centro", afiliados: 210, documental: "Por vencer", organizativo: "Activa", aprobacion: "Activo" },
  { nombre: "JAC Vereda El Porvenir", municipio: "Piendamó", barrio: "El Porvenir", afiliados: 78, documental: "Vencida", organizativo: "Inactiva", aprobacion: "Rechazado" },
  { nombre: "JAC Barrio La Esmeralda", municipio: "Popayán", barrio: "La Esmeralda", afiliados: 142, documental: "Vigente", organizativo: "Activa", aprobacion: "Activo" },
  { nombre: "JAC Vereda San José", municipio: "Bolívar", barrio: "San José", afiliados: 95, documental: "Vigente", organizativo: "Activa", aprobacion: "Activo" },
  { nombre: "JAC Comunidad El Bosque", municipio: "Miranda", barrio: "El Bosque", afiliados: 67, documental: "Vencida", organizativo: "Inactiva", aprobacion: "Activo" },
];

const docVariant = { "Vigente": "green", "Vencida": "red", "Por vencer": "amber" };
const orgVariant = { "Activa": "green", "Inactiva": "gray" };
const aprobVariant = { "Activo": "green", "Pendiente": "amber", "Rechazado": "red" };

const columns = ["Nombre de la JAC", "Municipio", "Barrio/Vereda", "Afiliados", "Estado documental", "Estado organizativo", "Estado de aprobación", "Acciones"];

function Jac() {
  const [busqueda, setBusqueda] = useState("");
  const filtered = jacData.filter(j =>
    [j.nombre, j.municipio, j.barrio].some(v => v.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div>
      <PageHeader
        title="Juntas de Acción Comunal"
        role="Administrador/Auditor"
        subtitle="Gestión de Juntas de Acción Comunal"
        description="Administre y consulte la información de las JAC del departamento"
      >
        <button className="flex items-center gap-2 bg-[#1B7F4B] hover:bg-[#166340] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0">
          <Plus size={16} /> Crear nueva JAC
        </button>
      </PageHeader>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filtros de búsqueda avanzados</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SearchBar placeholder="Buscar por nombre o barrio/vereda..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <SelectFilter placeholder="Todos los municipios" options={["Popayán", "Santander", "Patía", "Timbío", "Piendamó", "Bolívar", "Miranda"]} />
          <SelectFilter placeholder="Todos los estados" options={["Activa", "Inactiva"]} />
          <SelectFilter placeholder="Todos los estados documentales" options={["Vigente", "Por vencer", "Vencida"]} />
          <div className="border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <input type="number" placeholder="Número mínimo de afiliados" className="text-sm text-gray-600 placeholder:text-gray-400 outline-none w-full" />
          </div>
          <div className="border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <input type="date" className="text-sm text-gray-500 outline-none w-full" />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {columns.map(c => (
                  <th key={c} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? <EmptyState message="No se encontraron JAC con los criterios seleccionados" /> : filtered.map((jac, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{jac.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{jac.municipio}</td>
                  <td className="px-4 py-3 text-gray-600">{jac.barrio}</td>
                  <td className="px-4 py-3 text-gray-700 tabular-nums font-medium">{jac.afiliados}</td>
                  <td className="px-4 py-3"><Badge label={jac.documental} variant={docVariant[jac.documental]} /></td>
                  <td className="px-4 py-3"><Badge label={jac.organizativo} variant={orgVariant[jac.organizativo]} /></td>
                  <td className="px-4 py-3"><Badge label={jac.aprobacion} variant={aprobVariant[jac.aprobacion]} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"><UserRound size={15} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Jac;