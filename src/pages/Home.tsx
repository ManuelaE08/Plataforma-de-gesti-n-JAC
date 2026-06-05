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
import logoGobernacion from "../assets/logo-gobernacion.png";
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
    <div className="h-full rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
      <div className="flex items-baseline gap-1">
        <PopInNumber value={value} replayKey={replayKey} className="text-3xl sm:text-4xl font-bold text-[#1B7F4B] dark:text-emerald-400" />
        {suffix && <span className="text-xl font-bold text-[#1B7F4B] dark:text-emerald-400">{suffix}</span>}
      </div>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function FeatureCard({ data }: { data: FeatureCardData }) {
  const { title, description, to, icon: Icon, cta, highlight } = data;
  return (
    <Link
      to={to}
      className={`group relative flex h-full flex-col rounded-2xl border p-6 shadow-sm transition-colors ${
        highlight
          ? "attention-pulse border-transparent bg-gradient-to-br from-[#1B7F4B] to-[#0F5132] text-white"
          : "border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#1B7F4B]/40"
      }`}
    >
      {highlight && (
        <span className="absolute right-4 top-4 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Recomendado
        </span>
      )}
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
          highlight ? "bg-white/15 text-white" : "bg-[#1B7F4B]/10 text-[#1B7F4B] dark:bg-emerald-400/10 dark:text-emerald-400"
        }`}
      >
        <Icon size={24} />
      </div>
      <h3 className={`mt-4 text-lg font-bold ${highlight ? "text-white" : "text-slate-900 dark:text-white"}`}>{title}</h3>
      <p className={`mt-2 flex-1 text-sm ${highlight ? "text-emerald-50/90" : "text-slate-500 dark:text-slate-400"}`}>
        {description}
      </p>
      <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-bold ${highlight ? "text-white" : "text-[#1B7F4B] dark:text-emerald-400"}`}>
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
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-900">
      {/* Barra superior ligera */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img
              src={logoGobernacion}
              alt="Gobernación del Cauca"
              className="h-10 w-10 shrink-0 object-contain"
            />
            <span className="hidden truncate text-sm font-bold text-slate-900 dark:text-white sm:block">
              Plataforma JAC · Cauca
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/jac" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-gray-800">
              Juntas
            </Link>
            <Link to="/asocomunales" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-gray-800">
              Asocomunales
            </Link>
            <Link to="/inicio" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-gray-800">
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTema}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:border-gray-700 dark:text-slate-300 dark:hover:bg-gray-800"
              aria-label={tema === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {tema === "oscuro" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              onClick={login}
              className="rounded-lg bg-[#1B7F4B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#166340]"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Hero con fondo Aurora (React Bits) */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 z-0">
          <Aurora colorStops={["#e9de16", "#0027b5", "#ff2727"]} blend={0.33} amplitude={1.0} speed={0.5} />
        </div>
        {/* Overlay para asegurar legibilidad del texto sobre la aurora */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <RevealText>
            <span className="t-stagger-line t-stagger-line--1 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-50">
              Gobernación del Cauca · Datos abiertos
            </span>
            <h1 className="t-stagger-line t-stagger-line--2 mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Las Juntas de Acción Comunal del Cauca, al alcance de todos
            </h1>
            <p className="t-stagger-line t-stagger-line--3 mt-4 max-w-2xl text-base text-emerald-50/90 sm:text-lg">
              Plataforma pública para consultar y dar transparencia a las JAC y Asocomunales del
              departamento: directorios, cobertura territorial y estadísticas en tiempo real.
            </p>
          </RevealText>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/inicio"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-bold text-[#1B7F4B] shadow-sm transition-transform hover:scale-[1.03]"
            >
              Ver dashboard <ArrowRight size={18} />
            </Link>
            <Link
              to="/jac"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-white/20"
            >
              Explorar JAC
            </Link>
          </div>
        </div>
      </section>

      {/* Cifras destacadas */}
      <section className="mx-auto -mt-10 max-w-7xl px-4 sm:px-6">
        <HoverSpringGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTeaser label="Juntas de Acción Comunal" value={data.totalJACS} replayKey={ready} />
          <StatTeaser label="Asocomunales" value={data.totalAsocomunales} replayKey={ready} />
          <StatTeaser label="Municipios del Cauca" value={42} replayKey={ready} />
          <StatTeaser label="Cobertura RUC" value={rucPercent} suffix="%" replayKey={ready} />
        </HoverSpringGroup>
      </section>

      {/* Qué puedes hacer */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            ¿Qué puedes hacer aquí?
          </h2>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
            Explora la información comunal del Cauca de forma abierta y sin necesidad de iniciar sesión.
          </p>
        </div>

        <HoverSpringGroup className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {features.map((f) => (
            <FeatureCard key={f.title} data={f} />
          ))}
        </HoverSpringGroup>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-[#1B7F4B] dark:text-emerald-400" /> Mapa de cobertura por municipio</span>
          <span className="inline-flex items-center gap-2"><FileText size={16} className="text-[#1B7F4B] dark:text-emerald-400" /> Registro Único Comunal (RUC)</span>
          <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-[#1B7F4B] dark:text-emerald-400" /> Datos abiertos y verificables</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Plataforma de Gestión JAC y Asocomunales</p>
          <p className="font-semibold text-[#1B7F4B] dark:text-emerald-400">Gobernación del Cauca © 2026</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
