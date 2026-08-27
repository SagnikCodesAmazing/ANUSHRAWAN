import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  BellRing,
  ChevronDown,
  Gauge,
  History,
  LayoutDashboard,
  MapPinned,
  Radio,
  Settings,
  ShieldCheck,
  Truck as TruckIcon,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { HistoricalTrends } from "@/components/dashboard/HistoricalTrends";
import { RouteMapPanel } from "@/components/dashboard/RouteMapPanel";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { WeightMonitorCard } from "@/components/dashboard/WeightMonitorCard";
import { useSensorFeed } from "@/hooks/use-sensor-feed";
import { getTruck, TRUCKS } from "@/lib/fleet-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "ANUSHRAWAN — Fleet Dashboard & Live Cargo Telemetry" },
      {
        name: "description",
        content:
          "Monitor live truck routes, cargo weight against theft thresholds, active alerts and 24-hour trends across Bharat's highway freight network.",
      },
      { property: "og:title", content: "ANUSHRAWAN Fleet Dashboard" },
      {
        property: "og:description",
        content:
          "Live map, weight sensor graphs, theft alerts and fleet stats across Indian corridors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tracking", label: "Live Tracking", icon: MapPinned },
  { key: "alerts", label: "Alerts", icon: BellRing },
  { key: "history", label: "History", icon: History },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

type NavKey = (typeof NAV)[number]["key"];

function Dashboard() {
  const [truckId, setTruckId] = useState(TRUCKS[0]!.id);
  const [section, setSection] = useState<NavKey>("dashboard");
  const [range, setRange] = useState("last-24h");
  const truck = getTruck(truckId);
  const feed = useSensorFeed(truck);
  const seenAlerts = useRef(0);

  useEffect(() => {
    if (feed.alerts.length > seenAlerts.current) {
      const latest = feed.alerts[0]!;
      toast.error(`Theft Alert · ${latest.truckId}`, {
        description: `Cargo dropped ${latest.dropPercent}% at ${latest.location}`,
        duration: 3500,
      });
    }
    seenAlerts.current = feed.alerts.length;
  }, [feed.alerts]);

  const status = feed.isBreached ? "Alert" : truck.status === "idle" ? "Idle" : "Active";
  const activeTrucks = TRUCKS.filter((t) => t.status === "active").length;
  const avgWeight = Math.round(TRUCKS.reduce((s, t) => s + t.baseWeightKg, 0) / TRUCKS.length);

  const showMap = section === "dashboard" || section === "tracking";
  const showWeight = section === "dashboard" || section === "tracking";
  const showAlerts = section === "dashboard" || section === "alerts";
  const showHistory = section === "dashboard" || section === "history";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 z-50 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <div className="mb-6 px-1">
          <Link to="/" className="block">
            <Logo />
          </Link>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-sidebar-border bg-midnight/90 px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm">
            <span className="size-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-semibold text-accent">NavIC L5/S</span>
            <span className="text-border">·</span>
            <span>Sat-Feed Active</span>
          </div>
        </div>

        <nav className="space-y-1">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setSection(n.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                section === n.key
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              }`}
            >
              <n.icon className="size-4" />
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <div className="rounded-xl border border-sidebar-border bg-midnight/60 p-3 text-xs text-muted-foreground">
            <p className="flex items-center gap-2 text-saffron font-semibold">
              <ShieldCheck className="size-3.5" /> AIS-140 Certified
            </p>
            <p className="mt-1 text-[11px] leading-relaxed">
              MoRTH certified load sensor telemetry for Bharat commercial carriers.
            </p>
          </div>
          <div className="tricolor-line h-0.5 w-full rounded-full opacity-60" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        {/* Clean top bar with z-40 so map scrolls underneath */}
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:px-6 shadow-sm">
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            <div className="lg:hidden">
              <Logo compact />
            </div>

            <Select value={truckId} onValueChange={setTruckId}>
              <SelectTrigger className="w-[235px] font-mono text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRUCKS.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-xs font-mono">
                    {t.id} · {t.plate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                status === "Alert"
                  ? "pulse-alert bg-amber/15 text-amber border border-amber/30"
                  : status === "Idle"
                    ? "bg-muted text-muted-foreground border border-border"
                    : "bg-accent/10 text-accent border border-accent/20"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  status === "Alert"
                    ? "bg-amber animate-ping"
                    : status === "Idle"
                      ? "bg-muted-foreground"
                      : "bg-accent"
                }`}
              />
              {status === "Alert" ? "Theft Alert" : status === "Idle" ? "Idle" : "Active"}
            </span>

            <span className="hidden xl:inline-flex items-center gap-2 rounded-lg border border-border/60 bg-midnight/60 px-3 py-1 text-xs text-muted-foreground">
              <span>
                Driver: <strong className="text-foreground">{truck.driver}</strong>
              </span>
              <span className="text-border">·</span>
              <span className="text-slate-400">{truck.corridor}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border bg-midnight px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              FASTag: {truck.fastagId}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                <UserRound className="size-3.5 text-accent" />
                <span className="hidden sm:inline">Fleet Ops</span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSection("settings")}>
                  Vehicle Settings
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/auth">Sign out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="space-y-5 p-4 lg:p-6">
          {section !== "settings" ? (
            <>
              <StatsRow
                activeTrucks={activeTrucks}
                alertsToday={feed.alerts.length}
                avgWeight={avgWeight}
                distanceKm={1284}
              />

              <div className="grid gap-5 xl:grid-cols-3">
                {showMap && (
                  <div className="xl:col-span-2">
                    <RouteMapPanel
                      truck={truck}
                      progress={feed.progress}
                      speed={feed.speed}
                      weight={feed.currentWeight}
                      lastUpdate={feed.lastUpdate}
                      alerting={feed.isBreached}
                    />
                  </div>
                )}
                {showAlerts && (
                  <div className={showMap ? "" : "xl:col-span-3"}>
                    <AlertsPanel
                      alerts={feed.alerts}
                      onAcknowledge={feed.acknowledge}
                      onDismiss={feed.dismiss}
                    />
                  </div>
                )}
              </div>

              {showWeight && (
                <WeightMonitorCard
                  truck={truck}
                  series={feed.series}
                  currentWeight={feed.currentWeight}
                  breached={feed.isBreached}
                  onReset={feed.resetCargo}
                />
              )}

              {showHistory && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-bold">Historical Trends</h2>
                      <p className="text-xs text-muted-foreground">
                        Hourly load sensor telemetry and highway incident breakdown
                      </p>
                    </div>
                    <Select value={range} onValueChange={setRange}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last-24h">Last 24 hours</SelectItem>
                        <SelectItem value="last-7d">Last 7 days</SelectItem>
                        <SelectItem value="last-30d">Last 30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <HistoricalTrends truck={truck} range={range} />
                </>
              )}
            </>
          ) : (
            <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-panel">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="font-display text-xl font-bold">
                    Vehicle Telemetry Configuration
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Calibrated sensor parameters and corridor manifest for {truck.id}.
                  </p>
                </div>
                <span className="rounded-lg bg-primary/20 px-3 py-1 text-xs font-semibold text-accent">
                  VAHAN Linked
                </span>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                {[
                  ["Vehicle Registration", `${truck.plate} (RTO Registered)`],
                  ["Truck Make & Model", truck.model],
                  ["FASTag ID", truck.fastagId],
                  ["Highway Corridor", `${truck.route} · ${truck.corridor}`],
                  ["Consignment Cargo", truck.cargoType],
                  [
                    "E-Way Bill Declared Value",
                    `₹${(truck.cargoValueInr / 100000).toFixed(1)} Lakhs`,
                  ],
                  [
                    "Gross Vehicle Capacity",
                    `${truck.capacityKg.toLocaleString("en-IN")} kg (${(truck.capacityKg / 1000).toFixed(1)} Tonnes)`,
                  ],
                  ["Loaded Baseline Weight", `${truck.baseWeightKg.toLocaleString("en-IN")} kg`],
                  [
                    "Theft Threshold",
                    `${truck.thresholdKg.toLocaleString("en-IN")} kg (Alert triggers below this)`,
                  ],
                  ["Driver Profile", truck.driver],
                  ["Emergency Highway Helpline", "NHAI Highway Patrol (1033) · Police (112)"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border/60 pb-2.5">
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="text-xs font-semibold text-foreground text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-sidebar-border bg-sidebar lg:hidden">
        {NAV.map((n) => (
          <button
            key={n.key}
            onClick={() => setSection(n.key)}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] ${
              section === n.key ? "text-accent font-semibold" : "text-muted-foreground"
            }`}
          >
            <n.icon className="size-4" />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
