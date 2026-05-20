import {
  ArrowLeft,
  Users,
  MapPin,
  FileText,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Pencil,
  Tags,
  Check,
  X,
  CheckCircle2,
} from "lucide-react";

import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/ui/EmptyState";

import { useAuth } from "../context/AuthContext";
import { orgVariant, rolVariant } from "../hooks/useJac";
import { JACService } from "../modules/jac/services/jacService";

// Se agregó SolicitudesService para poder editar las solicitudes
import { SolicitudesService } from "../modules/solicitudes/services/solicitudes.service";

import type { JacItem } from "../modules/jac/types";

const card =
  "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";

const label =
  "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1";

const selectCls =
  "appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer shrink-0";

function JacDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, isAuthLoading } = useAuth();

  const esAdmin =
    user?.rol === "admin" || user?.rol === "superadmin";

  const canViewAfiliados =
    esAdmin || user?.rol === "operador";

  const canViewConfidential = esAdmin;

  const [jac, setJac] = useState<JacItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || isAuthLoading) return;

    let cancelled = false;

    setLoading(true);
    setError(null);

    const load = canViewConfidential
      ? JACService.findOne(Number(id))
      : JACService.findOnePublic(Number(id));

    load
      .then((data) => {
        if (!cancelled) setJac(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, canViewConfidential, isAuthLoading]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(
      () => setDebouncedBusqueda(busqueda),
      300
    );

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busqueda]);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const startEditing = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue("");
  };

  const handleSave = async () => {
    if (!jac || !editingField) return;

    try {
      const dto: any = {};

      if (editingField === "ruc") dto.numeroRUC = tempValue;
      if (editingField === "estado")
        dto.estado = tempValue.toLowerCase();
      if (editingField === "tipo")
        dto.tipo = tempValue.toLowerCase();

      const fieldNames: Record<string, string> = {
        ruc: "Número RUC",
        estado: "Estado",
        tipo: "Tipo",
      };

      if (esAdmin) {
        const updated = await JACService.update(jac.id, dto);

        setJac(updated);

        try {
          await SolicitudesService.registrarAccionAdmin({
            entidadAfectada: "JAC",
            entidadId: String(jac.id),
            tipoAccion: "EDITAR",
            payloadAnterior: {
              [editingField]:
                editingField === "ruc"
                  ? jac.numeroRUC
                  : editingField === "estado"
                  ? jac.estado
                  : jac.tipo,
            },
            payloadDeseado: dto,
          });
        } catch {
          console.warn(
            "No se pudo registrar la acción en auditoría"
          );
        }

        setSuccessMessage(
          `${fieldNames[editingField] || "Campo"} actualizado correctamente`
        );
      } else if (user?.rol === "operador") {
        await SolicitudesService.crear({
          entidadAfectada: "JAC",
          entidadId: String(jac.id),
          tipoAccion: "EDITAR",
          payloadAnterior: {
            [editingField]:
              editingField === "ruc"
                ? jac.numeroRUC
                : editingField === "estado"
                ? jac.estado
                : jac.tipo,
          },
          payloadDeseado: dto,
        });

        setSuccessMessage(
          `Propuesta de cambio de ${
            fieldNames[editingField] || "campo"
          } enviada para revisión`
        );
      }

      setEditingField(null);
      setTempValue("");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Error al actualizar"
      );
    }
  };

  const handleClearAfiliados = () => {
    setBusqueda("");
    setFiltroRol("");
    setDebouncedBusqueda("");
  };

  const miembrosFiltrados = useMemo(() => {
    if (!jac || !jac.miembros) return [];

    return jac.miembros.filter((m) => {
      const matchNombre =
        !debouncedBusqueda ||
        [m.nombre, m.documento].some((v) =>
          v
            ?.toLowerCase()
            .includes(debouncedBusqueda.toLowerCase())
        );

      const matchRol =
        !filtroRol || m.rol === filtroRol;

      return matchNombre && matchRol;
    });
  }, [jac, debouncedBusqueda, filtroRol]);

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Detalle de JAC"
          subtitle="Información detallada"
          description="Cargando información de la junta..."
        >
          <button
            onClick={() => navigate("/jac")}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
        </PageHeader>

        <div className={`${card} p-8 flex items-center justify-center`}>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  if (error || !jac) {
    return (
      <div>
        <PageHeader
          title="Detalle de JAC"
          subtitle="Información detallada"
          description="No se encontró la JAC solicitada"
        >
          <button
            onClick={() => navigate("/jac")}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
        </PageHeader>

        <div className={card}>
          <EmptyState
            message={
              error ??
              "La JAC que intenta consultar no existe o no está disponible"
            }
            inTable={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* resto del JSX permanece igual */}
    </div>
  );
}

export default JacDetalle;