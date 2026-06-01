import { X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { JACService } from "../../modules/jac/services/jacService";

//Importaciones neuvas para registrar la auditoria
import { SolicitudesService } from "../../modules/solicitudes/services/solicitudes.service";
import { useAuth } from "../../context/AuthContext";
import { Permissions } from "../../utils/permissions";
import type { CreateJACDto, TipoJacEnum } from "../../modules/jac/types";

interface ModalCrearJacProps {
  onClose: () => void;
  /** Se ejecuta cuando la JAC se crea exitosamente. El padre usualmente
   *  pide un refetch del listado. */
  onSave: () => void;
}

interface AsocomunalOption {
  id: number;
  nombre: string;
  municipioNombre?: string | null;
}

const inputCls = (hasError: boolean) =>
  `w-full border text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all
   text-gray-700 dark:text-gray-200
   bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800
   placeholder:text-gray-300 dark:placeholder:text-gray-600
   ${hasError
    ? "border-red-300 dark:border-red-600"
    : "border-gray-200 dark:border-gray-600"}`;

const selectCls = (hasError: boolean) =>
  `appearance-none w-full border text-sm rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer text-gray-700 dark:text-gray-200
   ${hasError
    ? "border-red-300 dark:border-red-600"
    : "border-gray-200 dark:border-gray-600"}`;

interface FormState {
  asocomunalId: string;
  tipo: TipoJacEnum | "";
  nombreCompleto: string;
  nombreCorto: string;
  numeroRUC: string;
  nit: string;
  numeroPersoneriaJuridica: string;
}

const initialForm: FormState = {
  asocomunalId: "",
  tipo: "",
  nombreCompleto: "",
  nombreCorto: "",
  numeroRUC: "",
  nit: "",
  numeroPersoneriaJuridica: "",
};

const MAX = {
  nombreCompleto: 100,
  nombreCorto: 100,
  numeroRUC: 30,
  nit: 30,
  numeroPersoneriaJuridica: 50,
} as const;

export function ModalCrearJac({ onClose, onSave }: ModalCrearJacProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [asocomunales, setAsocomunales] = useState<AsocomunalOption[]>([]);
  const [loadingAso, setLoadingAso] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    JACService.getAsocomunalesReplica()
      .then((data) => setAsocomunales(data ?? []))
      .catch((err) => console.error("Error cargando asocomunales:", err))
      .finally(() => setLoadingAso(false));
  }, []);

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!form.asocomunalId) e.asocomunalId = "La Asocomunal responsable es obligatoria";
    if (!form.tipo) e.tipo = "Seleccione el tipo (barrio o vereda)";

    const nombreCompleto = form.nombreCompleto.trim();
    if (!nombreCompleto) e.nombreCompleto = "El nombre completo es obligatorio";
    else if (nombreCompleto.length < 3)
      e.nombreCompleto = "El nombre completo debe tener al menos 3 caracteres";
    else if (nombreCompleto.length > MAX.nombreCompleto)
      e.nombreCompleto = `El nombre completo no puede superar ${MAX.nombreCompleto} caracteres`;

    if (form.nombreCorto.trim().length > MAX.nombreCorto)
      e.nombreCorto = `El nombre corto no puede superar ${MAX.nombreCorto} caracteres`;
    if (form.numeroRUC.trim().length > MAX.numeroRUC)
      e.numeroRUC = `El número de RUC no puede superar ${MAX.numeroRUC} caracteres`;
    if (form.nit.trim().length > MAX.nit)
      e.nit = `El NIT no puede superar ${MAX.nit} caracteres`;
    const numeroPersoneria = form.numeroPersoneriaJuridica.trim();
    if (!numeroPersoneria)
      e.numeroPersoneriaJuridica = "El número de personería jurídica es obligatorio";
    else if (numeroPersoneria.length > MAX.numeroPersoneriaJuridica)
      e.numeroPersoneriaJuridica = `El número de personería jurídica no puede superar ${MAX.numeroPersoneriaJuridica} caracteres`;

    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});

    const aso = asocomunales.find((a) => a.id === Number(form.asocomunalId));
    const tipoLabel = form.tipo === "barrio" ? "Barrio" : "Vereda";

    // Confirmación con SweetAlert2 — el usuario debe ver exactamente
    // qué se va a guardar antes de hacerlo.
    const confirm = await Swal.fire({
      title: "¿Confirmar creación de la JAC?",
      html: `
        <div style="text-align:left; font-size:14px; line-height:1.7;">
          <p>Se creará la siguiente JAC:</p>
          <ul style="margin-top:8px; padding-left:18px;">
            <li><b>Nombre:</b> ${escapeHtml(form.nombreCompleto.trim())}</li>
            <li><b>Tipo:</b> ${tipoLabel}</li>
            <li><b>Asocomunal:</b> ${escapeHtml(aso?.nombre ?? "—")}${aso?.municipioNombre ? ` (${escapeHtml(aso.municipioNombre)})` : ""}</li>
            ${form.nombreCorto.trim() ? `<li><b>Nombre corto:</b> ${escapeHtml(form.nombreCorto.trim())}</li>` : ""}
            ${form.numeroRUC.trim() ? `<li><b>Número RUC:</b> ${escapeHtml(form.numeroRUC.trim())}</li>` : "<li><b>Número RUC:</b> <i>no registrado</i></li>"}
            ${form.nit.trim() ? `<li><b>NIT:</b> ${escapeHtml(form.nit.trim())}</li>` : ""}
            ${form.numeroPersoneriaJuridica.trim() ? `<li><b>Personería jurídica:</b> ${escapeHtml(form.numeroPersoneriaJuridica.trim())}</li>` : ""}
          </ul>
          <p style="margin-top:12px; color:#92400e;">
            La JAC se creará con estado <b>Inactiva</b>. Pasará a <b>Activa</b>
            cuando alcance el mínimo legal de afiliados según su tipo
            (Ley 2166 de 2021, Art. 11).
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, crear JAC",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1B7F4B",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;

    const payload: CreateJACDto = {
      asocomunalId: Number(form.asocomunalId),
      tipo: form.tipo as TipoJacEnum,
      nombreCompleto: form.nombreCompleto.trim(),
      ...(form.nombreCorto.trim() ? { nombreCorto: form.nombreCorto.trim() } : {}),
      ...(form.numeroRUC.trim() ? { numeroRUC: form.numeroRUC.trim() } : {}),
      ...(form.nit.trim() ? { nit: form.nit.trim() } : {}),
      numeroPersoneriaJuridica: form.numeroPersoneriaJuridica.trim(),
    };

    // Enriquecer el payload con el nombre de la asocomunal para auditoría
    const payloadAudit: any = { ...payload };
    if (aso) payloadAudit.asocomunalId_nombre = aso.nombre;

    try {
      setSubmitting(true);

      if (Permissions.isAdmin(user)) {
        // Admin crea directamente y registra en auditoría
        await JACService.create(payload);

        // Registrar la acción en auditoría (log)
        try {
          await SolicitudesService.registrarAccionAdmin({
            entidadAfectada: "JAC",
            tipoAccion: "CREAR",
            payloadDeseado: payloadAudit,
          });
        } catch {
          // Si falla el log de auditoría, no bloquear la operación
          console.warn("No se pudo registrar la acción en auditoría");
        }

        await Swal.fire({
          title: "JAC creada",
          text: "La JAC quedó registrada con estado Inactiva.",
          icon: "success",
          confirmButtonColor: "#1B7F4B",
          timer: 2200,
          timerProgressBar: true,
        });

        //Nuevo cambio, el operador solo puede proponer, no crear directamente
      } else if (user?.rol === "operador") {
        // Operador propone la creación vía Maker-Checker
        await SolicitudesService.crear({
          entidadAfectada: "JAC",
          tipoAccion: "CREAR",
          payloadDeseado: payloadAudit,
        });

        await Swal.fire({
          title: "¡Propuesta enviada!",
          text: "Su solicitud ha sido enviada para revisión del administrador.",
          icon: "success",
          confirmButtonColor: "#1B7F4B",
        });
      }

      onSave();
      onClose();
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error desconocido al crear la JAC";
      await Swal.fire({
        title: "No se pudo crear la JAC",
        text: mensaje,
        icon: "error",
        confirmButtonColor: "#1B7F4B",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const { [key]: _, ...rest } = prev; return rest; });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Crear nueva JAC</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              La JAC nace inactiva hasta que alcance el mínimo legal de afiliados.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Asocomunal — obligatoria */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Asocomunal responsable <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.asocomunalId}
                onChange={(e) => setField("asocomunalId", e.target.value)}
                className={selectCls(!!errors.asocomunalId)}
                disabled={loadingAso}
              >
                <option value="">Seleccione una Asocomunal...</option>
                {asocomunales.map((aso) => (
                  <option key={aso.id} value={aso.id}>
                    {aso.nombre}{aso.municipioNombre ? ` (${aso.municipioNombre})` : ""}
                  </option>
                ))}
              </select>
              {loadingAso && (
                <div className="absolute right-8 top-2.5">
                  <Loader2 className="animate-spin text-[#1B7F4B]" size={16} />
                </div>
              )}
            </div>
            {errors.asocomunalId && <p className="text-xs text-red-500 dark:text-red-400">{errors.asocomunalId}</p>}
          </div>

          {/* Tipo de JAC — obligatorio */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Tipo de JAC <span className="text-red-500">*</span>
            </label>
            <select
              value={form.tipo}
              onChange={(e) => setField("tipo", e.target.value as TipoJacEnum | "")}
              className={selectCls(!!errors.tipo)}
            >
              <option value="">Seleccione el tipo...</option>
              <option value="barrio">Barrio (mínimo 50 afiliados)</option>
              <option value="vereda">Vereda (mínimo 20 afiliados)</option>
            </select>
            {errors.tipo && <p className="text-xs text-red-500 dark:text-red-400">{errors.tipo}</p>}
          </div>

          {/* Nombre completo — obligatorio */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nombreCompleto}
              onChange={(e) => setField("nombreCompleto", e.target.value)}
              placeholder="Junta de Acción Comunal Barrio El Pino"
              className={inputCls(!!errors.nombreCompleto)}
            />
            {errors.nombreCompleto && <p className="text-xs text-red-500 dark:text-red-400">{errors.nombreCompleto}</p>}
          </div>

          {/* Nombre corto — opcional */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Nombre corto <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={form.nombreCorto}
              onChange={(e) => setField("nombreCorto", e.target.value)}
              placeholder="JAC El Pino"
              maxLength={MAX.nombreCorto}
              className={inputCls(!!errors.nombreCorto)}
            />
            {errors.nombreCorto && <p className="text-xs text-red-500 dark:text-red-400">{errors.nombreCorto}</p>}
          </div>

          {/* RUC — opcional */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Número RUC <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={form.numeroRUC}
              onChange={(e) => setField("numeroRUC", e.target.value)}
              placeholder="Sin registrar"
              maxLength={MAX.numeroRUC}
              className={inputCls(!!errors.numeroRUC)}
            />
            {errors.numeroRUC && <p className="text-xs text-red-500 dark:text-red-400">{errors.numeroRUC}</p>}
          </div>

          {/* NIT — opcional */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              NIT <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={form.nit}
              onChange={(e) => setField("nit", e.target.value)}
              placeholder="Sin registrar"
              maxLength={MAX.nit}
              className={inputCls(!!errors.nit)}
            />
            {errors.nit && <p className="text-xs text-red-500 dark:text-red-400">{errors.nit}</p>}
          </div>

          {/* Personería jurídica — opcional */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Número de personería jurídica <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.numeroPersoneriaJuridica}
              onChange={(e) => setField("numeroPersoneriaJuridica", e.target.value)}
              placeholder="Sin registrar"
              maxLength={MAX.numeroPersoneriaJuridica}
              required
              className={inputCls(!!errors.numeroPersoneriaJuridica)}
            />
            {errors.numeroPersoneriaJuridica && <p className="text-xs text-red-500 dark:text-red-400">{errors.numeroPersoneriaJuridica}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingAso || submitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "Creando..." : "Crear JAC"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Escapa caracteres mínimos para inyectar texto seguro en el HTML del modal de SweetAlert2. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
