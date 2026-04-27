import { useState, useCallback } from "react";
import type { CreateJacDto, UpdateJacDto, Jac } from "../types";

interface JacFormState {
  nombreCompleto: string;
  nombreCorto: string;
  asocomunalId: number | null;
  numeroRUC: string;
}

interface JacFormErrors {
  nombreCompleto?: string;
  nombreCorto?: string;
  asocomunalId?: string;
  numeroRUC?: string;
}

/**
 * Hook para manejar el formulario de JAC.
 * Maneja validaciones, estado del formulario y envío.
 * 
 * Reglas de validación:
 * - nombreCompleto: Obligatorio, mínimo 5 caracteres
 * - nombreCorto: Opcional
 * - asocomunalId: Opcional
 * - numeroRUC: Opcional, formato RUC si se proporciona
 */
export function useJacForm(initialData?: Partial<Jac>) {
  const [form, setForm] = useState<JacFormState>({
    nombreCompleto: initialData?.nombreCompleto || "",
    nombreCorto: initialData?.nombreCorto || "",
    asocomunalId: initialData?.asocomunalId || null,
    numeroRUC: initialData?.numeroRUC || "",
  });

  const [errors, setErrors] = useState<JacFormErrors>({});
  const [touched, setTouched] = useState<Record<keyof JacFormState, boolean>>({
    nombreCompleto: false,
    nombreCorto: false,
    asocomunalId: false,
    numeroRUC: false,
  });
  const [loading, setLoading] = useState(false);

  /**
   * Valida un campo específico del formulario.
   */
  const validateField = useCallback((key: keyof JacFormState, value: any): string | undefined => {
    switch (key) {
      case "nombreCompleto":
        if (!value || value.toString().trim() === "") {
          return "El nombre completo es obligatorio";
        }
        if (value.toString().trim().length < 5) {
          return "El nombre completo debe tener al menos 5 caracteres";
        }
        break;

      case "numeroRUC":
        if (value && value.toString().trim() !== "") {
          // Validación básica del formato RUC: dígitos-dígito
          const rucPattern = /^\d{6,12}-\d{1}$/;
          if (!rucPattern.test(value.toString().trim())) {
            return "Formato de RUC inválido (ejemplo: 900123456-1)";
          }
        }
        break;
    }

    return undefined;
  }, []);

  /**
   * Valida todo el formulario.
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: JacFormErrors = {};

    Object.keys(form).forEach((key) => {
      const error = validateField(key as keyof JacFormState, form[key as keyof JacFormState]);
      if (error) {
        newErrors[key as keyof JacFormErrors] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, validateField]);

  /**
   * Maneja el cambio de un campo.
   */
  const handleChange = useCallback((key: keyof JacFormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    
    // Validar el campo si ya fue tocado
    if (touched[key]) {
      const error = validateField(key, value);
      setErrors((prev) => ({
        ...prev,
        [key]: error,
      }));
    }
  }, [touched, validateField]);

  /**
   * Maneja cuando un campo pierde el foco.
   */
  const handleBlur = useCallback((key: keyof JacFormState) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const error = validateField(key, form[key]);
    setErrors((prev) => ({
      ...prev,
      [key]: error,
    }));
  }, [form, validateField]);

  /**
   * Maneja el envío del formulario.
   */
  const handleSubmit = useCallback(async (
    onSubmit: (data: CreateJacDto | UpdateJacDto) => Promise<void>
  ) => {
    // Marcar todos los campos como tocados
    setTouched({
      nombreCompleto: true,
      nombreCorto: true,
      asocomunalId: true,
      numeroRUC: true,
    });

    // Validar el formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar los datos para enviar
      const data: CreateJacDto | UpdateJacDto = {
        nombreCompleto: form.nombreCompleto.trim(),
        nombreCorto: form.nombreCorto.trim() || null,
        asocomunalId: form.asocomunalId || null,
        numeroRUC: form.numeroRUC.trim() || null,
      };

      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [form, validateForm]);

  /**
   * Resetea el formulario.
   */
  const resetForm = useCallback(() => {
    setForm({
      nombreCompleto: initialData?.nombreCompleto || "",
      nombreCorto: initialData?.nombreCorto || "",
      asocomunalId: initialData?.asocomunalId || null,
      numeroRUC: initialData?.numeroRUC || "",
    });
    setErrors({});
    setTouched({
      nombreCompleto: false,
      nombreCorto: false,
      asocomunalId: false,
      numeroRUC: false,
    });
  }, [initialData]);

  return {
    form,
    errors,
    touched,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    validateForm,
  };
}