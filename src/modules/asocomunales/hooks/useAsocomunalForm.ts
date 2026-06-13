import { useState, useEffect } from "react";
import type { CreateAsocomunalDto, UpdateAsocomunalDto, Asocomunal } from "../types";

/**
 * Hook personalizado para manejar formularios de asocomunales.
 * Gestiona el estado del formulario, validaciones, errores y cambios en inputs.
 * Es reutilizable para crear y editar asocomunales.
 *
 * Beneficio: Centraliza lógica de formularios, evita duplicación de código.
 */
export function useAsocomunalForm(initialData?: Partial<Asocomunal>) {
  // Estado del formulario
  const [form, setForm] = useState<CreateAsocomunalDto | UpdateAsocomunalDto>({
    nombre: initialData?.nombre || "",
    estado: initialData?.estado ?? true,
    municipioId: initialData?.municipio?.id || 0,
    presidente: initialData?.presidente || "",
    cedula: initialData?.cedula || "",
    telefono: initialData?.telefono || "",
    correo: initialData?.correo || "",
  });

  // Estado de errores
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Estado de carga
  const [loading, setLoading] = useState(false);

  // Resetear formulario
  const resetForm = () => {
    setForm({
      nombre: initialData?.nombre || "",
      estado: initialData?.estado ?? true,
      municipioId: initialData?.municipio?.id || 0,
      presidente: initialData?.presidente || "",
      cedula: initialData?.cedula || "",
      telefono: initialData?.telefono || "",
      correo: initialData?.correo || "",
    });
    setErrors({});
    setTouched({});
  };

  // Actualizar formulario cuando cambian los datos iniciales (para edición)
  useEffect(() => {
    if (initialData) {
      resetForm();
    }
  }, [initialData]);

  const validateField = (
    key: keyof (CreateAsocomunalDto | UpdateAsocomunalDto),
    value: any,
  ): string => {
    if (key === "nombre") {
      if (!value?.toString().trim()) {
        return "El nombre es obligatorio";
      }
    }

    if (key === "municipioId") {
      if (!value || value === 0) {
        return "El municipio es obligatorio";
      }
    }

    if (key === "telefono") {
      const telefonoValue = value?.toString().trim();
      // Permite números, +, -, (), espacios, punto, coma (múltiples teléfonos separados)
      if (telefonoValue && !/^[0-9+\-\s().,;/]{7,}$/.test(telefonoValue)) {
        return "El teléfono debe contener números y caracteres como +, -, (), espacios (mínimo 7 caracteres)";
      }
    }

    if (key === "correo") {
      const correoValue = value?.toString().trim();
      // Permite múltiples correos separados por coma o punto y coma
      const emails = correoValue.split(/[,;]+/).map(e => e.trim());
      const invalidEmails = emails.filter(e => e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      if (invalidEmails.length > 0) {
        return "Uno o más correos no son válidos. Separa múltiples correos con coma (,) o punto y coma (;)";
      }
    }

    return "";
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fieldKeys: Array<keyof (CreateAsocomunalDto | UpdateAsocomunalDto)> = [
      "nombre",
      "municipioId",
      "telefono",
      "correo",
    ];

    fieldKeys.forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    setTouched((prev) => ({
      ...prev,
      nombre: true,
      municipioId: true,
      telefono: true,
      correo: true,
    }));

    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (
    key: keyof (CreateAsocomunalDto | UpdateAsocomunalDto),
    value: any,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));

    const error = validateField(key, value);
    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  const handleBlur = (key: keyof (CreateAsocomunalDto | UpdateAsocomunalDto)) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const error = validateField(key, form[key]);
    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  // Manejador de submit
  const handleSubmit = async (
    onSubmit: (data: CreateAsocomunalDto | UpdateAsocomunalDto) => Promise<void>
  ) => {
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(form);
      resetForm();
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      // Aquí podrías manejar errores específicos del backend
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    touched,
    loading,
    handleChange: handleFieldChange,
    handleBlur,
    handleSubmit,
    resetForm,
    validate,
  };
}