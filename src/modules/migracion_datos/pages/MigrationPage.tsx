import { useState } from "react";
import MigrationForm from "../components/MigrationForm";
import PageHeader from "../../../components/ui/PageHeader";
import { MigrationEntity } from "../types";

export default function MigrationPage() {
  const [entity, setEntity] = useState<MigrationEntity>("asocomunales");

  return (
    <div>
      <PageHeader
        title="Migración de Datos"
        subtitle="Herramienta de Importación"
        description="Importa masivamente registros utilizando archivos Excel estandarizados."
      />

      <div className="max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccione el tipo de entidad a importar
            </label>
            <select
              value={entity}
              onChange={(e) => setEntity(e.target.value as MigrationEntity)}
              className="w-full bg-gray-50 border border-gray-200 text-sm text-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
            >
              <option value="asocomunales">Asociaciones Comunales (Asocomunales)</option>
              <option value="jacs">Juntas de Acción Comunal (JACs)</option>
            </select>
          </div>

          <MigrationForm entity={entity} />
        </div>
      </div>
    </div>
  );
}

