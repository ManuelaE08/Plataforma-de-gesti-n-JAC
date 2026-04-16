import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Tema = "claro" | "oscuro";

interface TemaContextType {
  tema: Tema;
  setTema: (tema: Tema) => void;
  toggleTema: () => void;
}

const TemaContext = createContext<TemaContextType | null>(null);

function obtenerTemaInicial(): Tema {
  const guardado = window.localStorage.getItem("tema");
  if (guardado === "claro" || guardado === "oscuro") {
    return guardado;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro";
}

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(obtenerTemaInicial);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("dark", tema === "oscuro");
    window.localStorage.setItem("tema", tema);
  }, [tema]);

  const value = useMemo(
    () => ({
      tema,
      setTema,
      toggleTema: () => setTema((prev) => (prev === "claro" ? "oscuro" : "claro")),
    }),
    [tema]
  );

  return <TemaContext.Provider value={value}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const context = useContext(TemaContext);
  if (!context) {
    throw new Error("useTema debe usarse dentro de TemaProvider");
  }
  return context;
}