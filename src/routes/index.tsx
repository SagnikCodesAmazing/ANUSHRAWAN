import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Cpu,
  Fuel,
  Gauge,
  MapPinned,
  Radio,
  Scale,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import heroTruck from "@/assets/hero-truck.jpg";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "ANUSHRAWAN (अनुश्रवण) — Real-Time Cargo Theft Detection & Highway Telemetry",
      },
      {
        name: "description",
        content:
          "India's premier load-sensor fleet security system: live truck tracking, weight monitoring, and instant theft alerts across Bharat's highway corridors.",
      },
      {
        property: "og:title",
        content: "ANUSHRAWAN (अनुश्रवण) — Bharat Fleet Cargo Security",
      },
      {
        property: "og:description",
        content:
          "Detect cargo theft the second it happens with load sensors, live route maps and instant alerts for Indian logistics fleets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STATS = [
  { label: "High-Value Cargo Protected", value: "₹48.6 Cr+", hindi: "सुरक्षित कार्गो मूल्य" },
  { label: "Active Commercial HCVs", value: "1,250+", hindi: "सक्रिय वाहन" },
  { label: "Theft Detection Latency", value: "< 1.2s", hindi: "त्वरित चेतावनी" },
  { label: "National Corridors Covered", value: "28 States", hindi: "राजमार्ग कवरेज" },
];

const TICKER_ITEMS = [
  "MH-12-AB-4471 · NH-48 Km 112 · Load Cell: 12,450 kg · TPMS: 110 PSI Nominal · Solenoid: Armed · GSM Online",
  "DL-01-CG-9932 · NE-4 Expressway · TPMS All Axles Balanced (112 PSI) · Load Cell 17,800 kg · Fuel Flow Normal",
  "GJ-05-DR-6624 · Narmada Bridge NH-48 · Load Cell Dynamic Vibration Filter Active · 15,200 kg · Solenoid Armed",
  "TN-09-BK-1180 · Krishnagiri NH-44 · 4-Sensor Load Cell Grid Active · TPMS 108 PSI · GSM Uplink Online",
  "Commercial HCVs Protected with 4-Point Telemetry: Load Cells · TPMS · GSM · Fuel Cut-Off Solenoid",
];

const FEATURES = [
  {
    icon: Scale,
    title: "Precision Load Cells",
    hindi: "लोड सेल भार मापन",
    text: "Multi-point chassis bed strain gauges detect sudden or progressive transit weight loss within 1.2 seconds.",
  },
  {
    icon: Gauge,
    title: "Axle TPMS Monitoring",
    hindi: "टायर प्रेशर संवेदक",
    text: "Continuous per-axle tire pressure (PSI) and thermal tracking ensuring load distribution and anti-tamper security.",
  },
  {
    icon: Radio,
    title: "GSM Cellular Telemetry",
    hindi: "जीएसएम संचार नेटवर्क",
    text: "Industrial GSM telemetry uplink transmitting weight & TPMS telemetry packets and receiving operator remote commands.",
  },
  {
    icon: Fuel,
    title: "Fuel Solenoid Remote Cut-Off",
    hindi: "ईंधन सोलेनोइड वाल्व",
    text: "Inline fuel pipe solenoid valve actuated via GSM to cut off diesel supply and safely stop the truck if a driver is corrupt or refusing to stop.",
  },
  {
    icon: BellRing,
    title: "Instant Theft Alerts",
    hindi: "तात्कालिक चोरी चेतावनी",
    text: "Real-time load breach alerts dispatched directly to fleet operators with exact kilograms lost and highway location.",
  },
  {
    icon: ShieldCheck,
    title: "Impermeable Security",
    hindi: "अभेद्य सुरक्षा ढांचा",
    text: "Zero false alarms on potholes and rough highway ghats with intelligent dynamic vibration filtering.",
  },
];

/** Minimal Interactive Cursor Aura */
function CursorAura() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let rafId: number;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      setPos({ x: Math.round(currentX), y: Math.round(currentY) });
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    /* Ambient background cursor spotlight */
    <div
      className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-300"
      style={{
        background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(30, 90, 168, 0.08), transparent 75%)`,
      }}
    />
  );
}

/** Clean Hero Showcase */
function HeroShowcase() {
  return (
    <div className="relative py-4 select-none">
      {/* Rotating geometric constellation in background */}
      <div className="pointer-events-none absolute -left-8 -top-8 size-40 opacity-20 animate-spin-slow chakra-motif" />

      {/* Card Container */}
      <div className="relative rounded-3xl border border-border p-2 bg-gradient-to-br from-card via-card/95 to-background shadow-2xl">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={heroTruck}
            alt="Cargo truck on Indian national highway at night with illuminated route telemetry"
            width={1280}
            height={960}
            className="w-full object-cover"
          />

          {/* Floating Highway Status Badge */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/95 p-3.5 backdrop-blur shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="size-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <p className="text-xs font-bold text-white">NH-48 Western Freight Corridor</p>
                <p className="text-[11px] text-slate-300">
                  Load Cell: 12,450 kg · TPMS: 110 PSI · Solenoid: Armed · GSM Online
                </p>
              </div>
            </div>
            <span className="rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 text-[11px] font-bold">
              सुरक्षित · SECURE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Interactive Feature Card with Mouse-Aware Border Spotlight */
function InteractiveFeatureCard({ feature }: { feature: (typeof FEATURES)[0] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0, opacity: 0 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMouseOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1,
    });
  }

  function onMouseLeave() {
    setMouseOffset((prev) => ({ ...prev, opacity: 0 }));
  }

  const Icon = feature.icon;

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative overflow-hidden rounded-2xl border border-border bg-background/60 p-6 transition-all duration-300 hover:border-accent/60 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Mouse Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: mouseOffset.opacity,
          background: `radial-gradient(280px circle at ${mouseOffset.x}px ${mouseOffset.y}px, rgba(0, 229, 255, 0.12), transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-accent transition-transform duration-300 group-hover:scale-110">
            <Icon className="size-5" />
          </span>
          <span className="text-[11px] font-semibold text-saffron bg-saffron/10 px-2 py-0.5 rounded-md border border-saffron/20">
            {feature.hindi}
          </span>
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-foreground transition-colors group-hover:text-primary">
          {feature.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.text}</p>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div className="surface-light min-h-screen relative overflow-x-hidden">
      {/* Mouse-reactive Ambient Aura */}
      <CursorAura />

      {/* Subtle Tricolor Top Bar */}
      <div className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-300">
        <div className="tricolor-line h-1 w-full" />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-1.5 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">आत्मनिर्भर भारत</span>
            <span className="hidden sm:inline text-slate-500">·</span>
            <span className="hidden sm:inline text-slate-300">
              National Highway Freight & IoT Cargo Surveillance Network
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="hidden md:inline-flex items-center gap-1.5 text-cyan-400">
              <span className="size-1.5 rounded-full bg-cyan-400" /> GSM Telemetry Connected
            </span>
            <span className="text-slate-400">Load Cell · TPMS · Solenoid Valve Grid</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo />
          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#corridors" className="transition-colors hover:text-foreground">
              Corridors
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild size="sm">
              <Link to="/auth">Login / Sign up</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section with 3D Tilt & Micro-badges */}
        <section className="relative overflow-hidden mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-saffron/40 bg-saffron/10 px-3.5 py-1 text-xs font-semibold text-saffron">
              <span className="size-2 rounded-full bg-saffron animate-pulse" />
              <span>अनुश्रवण · BHARAT FLEET TELEMETRY</span>
            </div>

            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              अभेद्य सुरक्षा — Every quintal secure on{" "}
              <span className="text-primary underline decoration-saffron decoration-4 underline-offset-8">
                Bharat&apos;s highways.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base text-muted-foreground leading-relaxed">
              <strong>ANUSHRAWAN (अनुश्रवण)</strong> combines precision chassis <strong>load cells</strong>,
              axle <strong>TPMS</strong> sensors, and real-time <strong>GSM</strong> telemetry. If a
              corrupt driver diverts or refuses to stop during cargo theft, operators remotely
              actuate an in-line <strong>fuel pipe solenoid valve</strong> to cut fuel and stop the vehicle.
            </p>

            {/* Feature Bullets */}
            <div className="mt-6 grid grid-cols-2 gap-2.5 text-xs text-foreground font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-accent" />
                <span>Load cell precision weight tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-accent" />
                <span>TPMS tire pressure & heat monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-accent" />
                <span>GSM cellular data uplink</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-accent" />
                <span>Fuel pipe solenoid remote cut-off</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <Link to="/auth">
                  Launch Console <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/dashboard">View Live Demo</Link>
              </Button>
            </div>
          </div>

          {/* 3D Interactive Hero Showcase */}
          <HeroShowcase />
        </section>

        {/* Live Highway Corridor Telemetry Marquee / Ticker */}
        <div className="border-y border-slate-800 bg-slate-950 py-3 overflow-hidden select-none">
          <div className="flex w-max animate-ticker items-center gap-8 whitespace-nowrap text-xs font-mono text-slate-300">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <span>{item}</span>
                <span className="text-slate-600">·</span>
              </span>
            ))}
          </div>
        </div>

        {/* National Stats Strip — High-contrast styling with bilingual labels */}
        <section className="border-b border-slate-800 bg-slate-950 py-10 shadow-inner">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 sm:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="border-l-2 border-cyan-400 pl-4 transition-transform duration-300 hover:translate-x-1"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                  {s.hindi}
                </div>
                <div className="mt-0.5 font-display text-2xl font-extrabold text-white sm:text-3xl tracking-tight">
                  {s.value}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-300">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section with Mouse-Aware Spotlight Glow */}
        <section id="features" className="border-b border-border bg-card py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                ADVANCED LOGISTICS INTELLIGENCE
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Engineered for India&apos;s Toughest Highway Routes
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                From high-speed expressways to rugged toll bypasses, Anushrawan eliminates cargo
                pilferage with high-precision load telemetry.
              </p>
            </div>

            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <InteractiveFeatureCard key={f.title} feature={f} />
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-5 py-20">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              WORKFLOW
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold">From Loading Bay to Consignee</h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Scale,
                step: "Step 01 · चरण ०१",
                title: "Load Cells & Axle TPMS",
                text: "Chassis load cells continuously measure bed weight while TPMS sensors monitor axle tire pressure and balance.",
              },
              {
                icon: Radio,
                step: "Step 02 · चरण ०२",
                title: "GSM Telemetry Uplink",
                text: "Industrial GSM module continuously streams sensor packets to fleet servers and listens for operator commands.",
              },
              {
                icon: Fuel,
                step: "Step 03 · चरण ०३",
                title: "Solenoid Fuel Cut-Off & Alarm",
                text: "If theft occurs or a corrupt driver refuses to stop, fleet operators remotely close the fuel solenoid valve to safely immobilize the truck.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-accent/40 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <s.icon className="size-6 text-accent" />
                  <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-saffron">
                    {s.step}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Corridors Banner — High-contrast dark card */}
        <section id="corridors" className="border-t border-border bg-card py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="rounded-3xl border border-slate-700 bg-slate-950 p-8 lg:p-12 relative overflow-hidden shadow-2xl">
              <span className="chakra-motif absolute -right-12 -bottom-12 size-48 opacity-15" />
              <div className="max-w-xl relative">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  राष्ट्रीय मालवहन नेटवर्क · NATIONAL FREIGHT NETWORK
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold text-white">
                  Protecting Goods Across Golden Quadrilateral & Freight Corridors
                </h2>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Active monitoring on NH-48 (Delhi-Mumbai-Chennai), NH-44 (Srinagar-Kanyakumari),
                  NE-4 Expressway, and Eastern & Western Dedicated Freight corridors.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
                  {[
                    "NH-48 Mumbai-Pune",
                    "NE-4 Delhi-Jaipur",
                    "NH-44 Chennai-Bengaluru",
                    "NH-19 Delhi-Kolkata",
                    "NH-27 Gujarat-Rajasthan",
                  ].map((c) => (
                    <span
                      key={c}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 transition-colors hover:border-accent hover:text-white"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer — High-contrast dark styling */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
        <div className="tricolor-line h-0.5 w-full opacity-80" />
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <div className="flex flex-wrap gap-6 text-xs text-slate-300">
            <Link to="/auth" className="hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="mailto:ops@anushrawan.in" className="hover:text-white transition-colors">
              ops@anushrawan.in
            </a>
          </div>
          <div className="text-xs text-right">
            <p className="text-white font-medium">
              © {new Date().getFullYear()} ANUSHRAWAN (अनुश्रवण) Technologies Pvt Ltd
            </p>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Pune · New Delhi · Bengaluru · India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
