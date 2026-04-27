/**
 * Módulo JAC (Juntas de Acción Comunal)
 * 
 * Este archivo exporta todos los componentes, hooks, servicios y tipos
 * del módulo JAC para facilitar su importación en otras partes de la aplicación.
 */

// Export types
export * from "./types";

// Export hooks
export * from "./hooks/useJac";
export * from "./hooks/useJacForm";

// Export services
export * from "./services/jacService";

// Export adapters
export * from "./adapters/jac.adapter";

// Export components
export * from "./components/JacForm";
export * from "./components/ModalCrearJac";
export * from "./components/ModalEditarJac";