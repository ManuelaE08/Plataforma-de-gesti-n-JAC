import { useState, useEffect } from "react";
import type { UpdateJACDto, JacItem } from "../types";

/**
 * Hook personalizado para manejar formularios de edición de JACs.
 * Gestiona el estado del formulario, validaciones, errores y cambios en inputs.
 * Soporta editar: nombreCompleto, asocomunalId, numeroRUC, estado
 *
 * Beneficio: Centraliza lógica de formularios, evita duplicación de código.
 */
export function useJacForm(initialData?: Partial<JacItem>) {
  // Mapear estado de frontend (mayúsculas) a backend (minúsculas)
  const mapEstado = (estado?: string): "activa" | "inactiva" | "cancelada" | undefined => {
    if (!estado) return undefined;
    const mapped = estado.toLowerCase();
    if (mapped === "activa" || mapped === "inactiva" || mapped === "cancelada") {
      return mapped as "activa" | "inactiva" | "cancelada";
    }
    return undefined;
  };

  // Estado del formulario
  const [form, setForm] = useState<UpdateJACDto>({
    nombreCompleto: initialData?.nombre || "",
    asocomunalId: initialData?.asocomunalId || undefined,
    numeroRUC: initialData?.numeroRUC || "",
    estado: mapEstado(initialData?.estado),
  });

  // Estado de errores
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Estado de carga
  const [loading, setLoading] = useState(false);

  // Resetear formulario
  const resetForm = () => {
    setForm({
      nombreCompleto: initialData?.nombre || "",
      asocomunalId: initialData?.asocomunalId || undefined,
      numeroRUC: initialData?.numeroRUC || "",
      estado: mapEstado(initialData?.estado),
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
    key: keyof UpdateJACDto,
    value: any,
  ): string => {
    if (key === "nombreCompleto") {
      if (!value?.toString().trim()) {
        return "El nombre es obligatorio";
      }
      if (value.toString().trim().length < 3) {
        return "El nombre debe tener al menos 3 caracteres";
      }
    }

    if (key === "numeroRUC") {
      if (value && value.toString().trim().length < 5) {
        return "El RUC debe tener al menos 5 caracteres";
      }
    }

    return "";
  };

  const handleChange = (key: keyof UpdateJACDto, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    const error = validateField(key, value);
    setErrors((prev) => ({
      ...prev,
      [key]: error,
    }));
  };

  const handleBlur = (key: keyof UpdateJACDto) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.nombreCompleto?.toString().trim()) {
      newErrors.nombreCompleto = "El nombre es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    onSubmit: (data: UpdateJACDto) => Promise<void>,
  ) => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    touched,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
}
