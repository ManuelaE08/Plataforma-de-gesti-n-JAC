import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Building2, Users, LayoutDashboard, ArrowRight, Moon, Sun, MapPin, FileText, ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTema } from "../context/TemaContext";
import { JACService, type PublicStats } from "../modules/jac/services/jacService";
import Aurora from "../components/Aurora";
import logoGobernacion from "../assets/logo-secretariaGob.png";
import PopInNumber from "../components/transitions/PopInNumber";
import RevealText from "../components/transitions/RevealText";
import HoverSpringGroup from "../components/transitions/HoverSpringGroup";

const EMPTY_STATS: PublicStats = {
  activeJacsCount: 0,
  totalJACS: 0,
  rucCount: 0,
  urbanCount: 0,
  ruralCount: 0,
  totalAsocomunales: 0,
  topMunicipios: [],
};

interface FeatureCardData {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
  cta: string;
  highlight?: boolean;
}

function StatTeaser({ label, value, suffix, replayKey }: { label: string; value: number | string; suffix?: string; replayKey?: unknown }) {
  return (
    <div className="h-full rounded-[24px] border border-[#F5D76E]/40 dark:border-gray-700 bg-[#E4B400] dark:bg-gray-800 p-6 shadow-[0_8px_30px_rgba(228,180,0,0.10)] dark:shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(228,180,0,0.18)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
      <div className="flex items-baseline gap-1">
        <PopInNumber value={value} replayKey={replayKey} className="text-3xl sm:text-4xl font-extrabold text-white" />
        {suffix && <span className="text-xl font-extrabold text-white">{suffix}</span>}
      </div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/85 dark:text-gray-400">{label}</p>
    </div>
  );
}

function FeatureCard({ data }: { data: FeatureCardData }) {
  const { title, description, to, icon: Icon, cta, highlight } = data;
  return (
    <Link
      to={to}
      className={`group relative flex h-full flex-col rounded-[24px] border p-7 transition-all duration-300 hover:-translate-y-1 {highlight
        ? "border-transparent bg-[#E4B400] dark:bg-gray-800 text-white shadow-[0_8px_30px_rgba(228,180,0,0.10)] dark:shadow-none hover:shadow-[0_20px_40px_rgba(228,180,0,0.18)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
        : "border-transparent bg-[#E4B400] dark:bg-gray-800 text-white shadow-[0_8px_30px_rgba(228,180,0,0.10)] dark:shadow-none hover:shadow-[0_20px_40px_rgba(228,180,0,0.18)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
        }`}
    >
      {highlight && (
        <span className="absolute right-5 top-5 rounded-full bg-white dark:bg-gray-700 px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#E4B400] dark:text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-none">
          Recomendado
        </span>
      )}
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-[16px] ${highlight ? "bg-white dark:bg-white/20 text-[#E4B400] dark:text-white" : "bg-white/20 text-white"
          }`}
      >
        <Icon size={24} />
      </div>
      <h3 className="mt-5 text-lg font-bold tracking-tight text-white">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-white/90">
        {description}
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-white">
        {cta}
        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
      </span>
    </Link>
  );
}

function Home() {
  const { user, login } = useAuth();
  const { tema, toggleTema } = useTema();

  const [stats, setStats] = useState<PublicStats | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.title = "Plataforma JAC · Cauca";
  }, []);

  useEffect(() => {
    let active = true;
    JACService.getPublicStats()
      .then((s) => {
        if (active) {
          setStats(s);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Usuario autenticado: directo al dashboard.
  if (user) return <Navigate to="/inicio" replace />;

  const data = stats ?? EMPTY_STATS;
  const rucPercent =
    data.activeJacsCount > 0 ? Math.round((data.rucCount / data.activeJacsCount) * 100) : 0;

  const features: FeatureCardData[] = [
    {
      title: "Directorio de JAC",
      description: "Consulta las Juntas de Acción Comunal por municipio, barrio o vereda, con su estado y afiliación.",
      to: "/jac",
      icon: Building2,
      cta: "Explorar JAC",
    },
    {
      title: "Asocomunales",
      description: "Conoce las federaciones que agrupan a las JAC del departamento y las juntas que las integran.",
      to: "/asocomunales",
      icon: Users,
      cta: "Ver asocomunales",
    },
    {
      title: "Dashboard de datos abiertos",
      description: "Estadísticas, mapa de cobertura y transparencia comunal del Cauca, todo en un solo lugar.",
      to: "/inicio",
      icon: LayoutDashboard,
      cta: "Ir al dashboard",
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-gray-900 transition-colors duration-300">
      {/* Barra superior — fondo amarillo mostaza, texto blanco */}
      <header className="sticky top-0 z-50 border-b border-[#cfa200]/40 dark:border-gray-800/60 bg-[#E4B400]/95 dark:bg-gray-900/95 backdrop-blur-md transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img
              src={logoGobernacion}
              alt="Gobernación del Cauca"
              className="h-14 w-auto shrink-0 object-contain"
            />
            <span className="hidden truncate text-lg font-bold tracking-tight text-white sm:block">
              Plataforma JAC · Cauca
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/jac" className="rounded-full px-4 py-2 text-lg font-semibold text-white/90 transition-colors hover:bg-white/15 hover:text-white">
              Juntas
            </Link>
            <Link to="/asocomunales" className="rounded-full px-4 py-2 text-lg font-semibold text-white/90 transition-colors hover:bg-white/15 hover:text-white">
              Asocomunales
            </Link>
            <Link to="/inicio" className="rounded-full px-4 py-2 text-lg font-semibold text-white/90 transition-colors hover:bg-white/15 hover:text-white">
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTema}
              className="rounded-full border border-white/40 p-2 text-white transition-colors hover:bg-white/15"
              aria-label={tema === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {tema === "oscuro" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              onClick={login}
              className="rounded-full bg-white dark:bg-gray-800 px-5 py-2 text-sm font-bold text-[#1A1A1A] dark:text-white transition-colors hover:bg-[#F8F9FA] dark:hover:bg-gray-700"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Hero principal — dominante amarillo mostaza */}
      <section className="relative min-h-[60vh] overflow-hidden bg-[#E4B400] dark:bg-gray-900 py-16 sm:py-24 transition-colors duration-300">
        <div className="absolute inset-0 z-0 opacity-60">
          <Aurora colorStops={tema === "oscuro" ? ["#1F2937", "#374151", "#111827"] : ["#E4B400", "#F5D76E", "#FFFFFF"]} blend={0.33} amplitude={1.0} speed={0.5} />
        </div>
        {/* Overlay institucional para mantener dominancia amarilla */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[#E4B400]/70 dark:bg-gray-900/70 mix-blend-multiply transition-colors duration-300" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-[#1A1A1A]/40 dark:from-[#111827]/80 via-transparent to-transparent" />
        {/* Decoración circular */}
        <div className="pointer-events-none absolute -top-10 -right-10 z-0 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 z-0 h-80 w-80 rounded-full bg-[#F5D76E]/30 blur-2xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <RevealText>
            <span className="t-stagger-line t-stagger-line--1 inline-flex w-fit items-center gap-2 rounded-full backdrop-blur-sm bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white">
              Gobernación del Cauca · Datos abiertos
            </span>
            <h1 className="t-stagger-line t-stagger-line--2 mt-6 max-w-3xl text-4xl font-extrabold uppercase leading-tight tracking-wider text-white sm:text-5xl lg:text-6xl">
              Las Juntas de Acción Comunal del Cauca, al alcance de todos
            </h1>
            <p className="t-stagger-line t-stagger-line--3 mt-5 max-w-2xl text-base text-white/90 sm:text-lg">
              Plataforma pública para consultar y dar transparencia a las JAC y Asocomunales del
              departamento: directorios, cobertura territorial y estadísticas en tiempo real.
            </p>
          </RevealText>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/inicio"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/50 backdrop-blur-sm bg-white/10 px-7 py-3.5 text-base font-bold text-white transition-colors hover:bg-white/25"
            >
              Ver dashboard <ArrowRight size={18} />
            </Link>
            <Link
              to="/jac"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/50 backdrop-blur-sm bg-white/10 px-7 py-3.5 text-base font-bold text-white transition-colors hover:bg-white/25"
            >
              Explorar JAC
            </Link>
          </div>
        </div>
      </section>

      {/* Cifras destacadas — tarjetas amarillas, texto blanco */}
      <section className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 sm:px-6">
        <HoverSpringGroup className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <StatTeaser label="Juntas de Acción Comunal" value={data.totalJACS} replayKey={ready} />
          <StatTeaser label="Asocomunales" value={data.totalAsocomunales} replayKey={ready} />
          <StatTeaser label="Municipios del Cauca" value={42} replayKey={ready} />
          <StatTeaser label="Cobertura RUC" value={rucPercent} suffix="%" replayKey={ready} />
        </HoverSpringGroup>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#E4B400] dark:text-white">Servicios</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1A1A1A] dark:text-white sm:text-4xl">
            ¿Qué puedes hacer aquí?
          </h2>
          <p className="mt-3 text-lg text-[#5F6368] dark:text-gray-400">
            Explora la información comunal del Cauca de forma abierta y sin necesidad de iniciar sesión.
          </p>
        </div>

        <HoverSpringGroup className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((f) => (
            <FeatureCard key={f.title} data={f} />
          ))}
        </HoverSpringGroup>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-[32px] border border-transparent bg-[#E4B400] dark:bg-gray-800 px-6 py-5 text-base text-white transition-colors duration-300">
          <span className="inline-flex items-center gap-2"><MapPin size={18} className="text-white" /> Mapa de cobertura por municipio</span>
          <span className="inline-flex items-center gap-2"><FileText size={18} className="text-white" /> Registro Único Comunal (RUC)</span>
          <span className="inline-flex items-center gap-2"><ShieldCheck size={18} className="text-white" /> Datos abiertos y verificables</span>
        </div>
      </section>

      {/* Footer — línea bicolor con logo al final, lado derecho */}
      {/* Footer — línea bicolor con logo al final, lado derecho */}
      <footer className="relative bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="flex items-center gap-4 pr-4 sm:pr-6">
          {/* Línea horizontal bicolor institucional */}
          <div className="flex h-2.5 flex-1">
            <div className="h-full w-[60%] bg-[#E4B400]" />
            <div className="h-full w-[40%] bg-[#E4B400]" />
          </div>

          {/* Logo al final de la línea */}
          <div className="shrink-0 pt-2">
            <img
              src={logoGobernacion}
              alt="Gobernación del Cauca"
              className="h-14 w-auto shrink-0 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
            />
          </div>
        </div>

        {/* Contenido del footer */}
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-10 sm:px-6">
          <div className="flex flex-col gap-2 text-base text-[#1A1A1A] dark:text-white sm:flex-row sm:items-center sm:gap-6">
            <p className="font-medium">Plataforma de Gestión JAC y Asocomunales</p>
            <p className="font-bold text-[#E4B400] dark:text-white">Gobernación del Cauca © 2026</p>
          </div>

          {/* Créditos del equipo de desarrollo (Estilo Neutro / Gris y Extendido) */}
          <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
            {/* Encabezado de Créditos */}
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2 mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5F6368] dark:text-gray-400">
                Desarrollo Académico
              </p>
              <span className="hidden text-gray-400 dark:text-gray-600 sm:inline">•</span>
              <p className="text-xs font-medium text-[#5F6368] dark:text-gray-400">
                Ingeniería de Sistemas — Universidad del Cauca
              </p>
            </div>

            {/* Distribución en Grid: Ocupa todo el ancho horizontal */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 text-xs text-[#1A1A1A]/80 sm:text-sm">
              {[
                { name: "Everson Leandro Restrepo Gaviria", email: "eversonrestrepo@unicauca.edu.co" },
                { name: "Juan David Vela Coronado", email: "juanvela@unicauca.edu.co" },
                { name: "Duvan Felipe Armero Cuaran", email: "duvanfeli@unicauca.edu.co" },
                { name: "Karold Dirley Delgado Arciniegas", email: "karolddelgado@unicauca.edu.co" },
                { name: "Manuela Meneses Erazo", email: "manmeneses@unicauca.edu.co" },
              ].map((dev) => (
                <div key={dev.email} className="flex flex-col">
                  {/* Enlace Mailto interactivo */}
                  <a
                    href={`mailto:${dev.email}`}
                    title={`Enviar correo a ${dev.name}`}
                    className="group flex flex-col items-start gap-y-0.5"
                  >
                    {/* Nombre */}
                    <span className="font-medium group-hover:text-black dark:group-hover:text-white transition-colors duration-200 leading-tight dark:text-gray-300">
                      {dev.name}
                    </span>
                    {/* Correo secundario */}
                    <span className="text-[11px] font-normal lowercase text-[#5F6368] dark:text-gray-400 transition-colors duration-200 group-hover:text-gray-900 dark:group-hover:text-gray-200 sm:text-xs break-all">
                      {dev.email}
                    </span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default Home;