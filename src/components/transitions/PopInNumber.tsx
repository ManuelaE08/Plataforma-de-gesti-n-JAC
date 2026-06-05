import { useEffect, useRef } from "react";

interface PopInNumberProps {
  value: number | string;
  className?: string;
  /** Cambiar este valor vuelve a disparar la animación (p. ej. al revelar el contenido). */
  replayKey?: unknown;
}

/**
 * Number pop-in (transitions-dev #02): cada carácter re-entra con un
 * desenfoque + slide cuando el valor cambia. Los dos últimos caracteres
 * se escalonan con `data-stagger` para que los decimales se sientan vivos.
 */
function PopInNumber({ value, className, replayKey }: PopInNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const str = String(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("is-animating");
    void el.offsetHeight; // fuerza un reflow para re-disparar la animación
    el.classList.add("is-animating");
  }, [str, replayKey]);

  const chars = str.split("");
  return (
    <span ref={ref} className={`t-digit-group ${className ?? ""}`}>
      {chars.map((ch, i) => {
        const stagger =
          i === chars.length - 2 ? "1" : i === chars.length - 1 ? "2" : undefined;
        return (
          <span key={i} className="t-digit" data-stagger={stagger}>
            {ch}
          </span>
        );
      })}
    </span>
  );
}

export default PopInNumber;
