import { useRef, useState } from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";

interface DropzoneExcelProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string | null;
}

export default function DropzoneExcel({ file, onFileSelect, error }: DropzoneExcelProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (newFile: File) => {
    // Validar extensión (.xlsx, .xls)
    const validExtensions = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];
    if (validExtensions.includes(newFile.type) || newFile.name.endsWith('.xlsx') || newFile.name.endsWith('.xls')) {
      onFileSelect(newFile);
    } else {
      alert("Por favor selecciona un archivo de Excel válido (.xlsx o .xls)");
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-neutral-300 bg-white hover:bg-gray-50'}
          ${error ? 'border-red-500 bg-red-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx, .xls"
          className="hidden"
          onChange={handleChange}
        />
        
        {!file ? (
          <>
             <div className="bg-primary/10 p-3 rounded-full mb-4">
               <UploadCloud className="w-8 h-8 text-primary" />
             </div>
             <p className="text-sm font-medium text-gray-700 mb-1">
               Haz clic para elegir un archivo local o arrástralo aquí
             </p>
             <p className="text-xs text-gray-500">
               Formato soportado: Excel (.xlsx, .xls)
             </p>
          </>
        ) : (
          <div className="flex items-center gap-4 bg-white border border-gray-200 p-4 rounded-lg w-full max-w-sm relative mt-2" onClick={(e) => e.stopPropagation()}>
             <div className="bg-green-100 p-2 rounded-lg">
               <FileIcon className="w-6 h-6 text-green-600" />
             </div>
             <div className="flex-1 overflow-hidden text-left">
               <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
               <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
             </div>
             <button
               type="button"
               onClick={() => onFileSelect(null)}
               className="p-1 hover:bg-gray-100 rounded-full transition-colors absolute -top-2 -right-2 bg-white border border-gray-200"
             >
               <X className="w-4 h-4 text-gray-500" />
             </button>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}
