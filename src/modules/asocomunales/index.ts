// Export types
export * from "./types";

// Export hooks
export * from "./hooks/useAsocomunales";
export * from "./hooks/useMunicipios";

// Export services
export * from "./services/asocomunalesService";
export * from "./services/municipiosService";

// Export components
export * from "./components/ModalCrearAsocomunal";

// Export pages (if needed for dynamic imports)
export { default as Asocomunales } from "./pages/Asocomunales";
export { default as AsocomunalDetalle } from "./pages/AsocomunalDetalle";