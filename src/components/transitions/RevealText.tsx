import { useEffect, useRef, type ReactNode } from "react";

interface RevealTextProps {
  children: ReactNode;
  className?: string;
}

/**
 * Texts reveal (transitions-dev #18): entrada escalonada con blur de
 * líneas de texto apiladas. Cada hijo debe llevar la clase
 * `t-stagger-line t-stagger-line--N` para heredar el retraso por línea.
 */
function RevealText({ children, className }: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("is-hiding");
    el.classList.remove("is-shown");
    void el.offsetHeight; // fuerza un reflow para que la entrada se reproduzca
    el.classList.add("is-shown");
  }, []);

  return (
    <div ref={ref} className={`t-stagger ${className ?? ""}`}>
      {children}
    </div>
  );
}

export default RevealText;
