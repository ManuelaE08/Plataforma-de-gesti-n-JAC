import { Table } from "lucide-react";

interface PreviewTableProps {
  data: any[];
  entity: string;
}

export default function PreviewTable({ data, entity }: PreviewTableProps) {
  if (!data || data.length === 0) return null;

  const sampleData = data.slice(0, 5);
  const totalRows = data.length;

  // Todas las columnas del primer objeto — sin límite
  const columns = Object.keys(sampleData[0] || {});

  return (
    <div className="mt-4 border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-medium text-sm">
          <Table className="w-4 h-4" />
          Previsualización ({entity === 'jacs' ? 'JAC' : 'Asocomunales'})
        </div>
        <span className="text-xs text-neutral-500 bg-neutral-200 px-2 py-1 rounded-full font-medium">
          {totalRows} filas · {columns.length} columnas
        </span>
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 font-medium text-xs uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sampleData.map((row, idx) => (
              <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 text-neutral-700 max-w-[200px] truncate" title={row[col]?.toString() || ''}>
                    {row[col] || <span className="text-neutral-300 italic text-xs">vacío</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalRows > 5 && (
        <div className="bg-neutral-50 px-4 py-2 text-xs text-center text-neutral-500 border-t border-neutral-100">
          Mostrando 5 de {totalRows} registros encontrados
        </div>
      )}
    </div>
  );
}
