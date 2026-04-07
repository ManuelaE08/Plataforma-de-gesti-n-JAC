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
    telefono: initialData?.telefono || "",
    correo: initialData?.correo || "",
  });

  // Estado de errores
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado de carga
  const [loading, setLoading] = useState(false);

  // Resetear formulario
  const resetForm = () => {
    setForm({
      nombre: initialData?.nombre || "",
      estado: initialData?.estado ?? true,
      municipioId: initialData?.municipio?.id || 0,
      presidente: initialData?.presidente || "",
      telefono: initialData?.telefono || "",
      correo: initialData?.correo || "",
    });
    setErrors({});
  };

  // Actualizar formulario cuando cambian los datos iniciales (para edición)
  useEffect(() => {
    if (initialData) {
      resetForm();
    }
  }, [initialData]);

  // Función de validación
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.nombre?.toString().trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    if (!form.municipioId || form.municipioId === 0) {
      newErrors.municipioId = "El municipio es obligatorio";
    }

    // Validaciones adicionales si es necesario
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.toString())) {
      newErrors.correo = "El correo electrónico no es válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejador de cambios en inputs
  const handleChange = (key: keyof (CreateAsocomunalDto | UpdateAsocomunalDto), value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: "" }));
    }
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
    loading,
    handleChange,
    handleSubmit,
    resetForm,
    validate,
  };
}