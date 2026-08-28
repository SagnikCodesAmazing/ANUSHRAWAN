import { Disc, Gauge, ShieldCheck, Thermometer } from "lucide-react";
import type { TpmsData, Truck } from "@/lib/fleet-data";

interface TpmsMonitorCardProps {
  truck: Truck;
  tpms: TpmsData;
}

export function TpmsMonitorCard({ truck, tpms }: TpmsMonitorCardProps) {
  const tires = [
    {
      id: "FL",
      name: "Front Axle (Left)",
      psi: tpms.frontLeftPsi,
      temp: tpms.tempC,
      nominal: 110,
      position: "col-start-1 row-start-1",
    },
    {
      id: "FR",
      name: "Front Axle (Right)",
      psi: tpms.frontRightPsi,
      temp: tpms.tempC,
      nominal: 110,
      position: "col-start-2 row-start-1",
    },
    {
      id: "RL",
      name: "Rear Dual Axle (Left)",
      psi: tpms.rearLeftPsi,
      temp: tpms.tempC + 2,
      nominal: 112,
      position: "col-start-1 row-start-2",
    },
    {
      id: "RR",
      name: "Rear Dual Axle (Right)",
      psi: tpms.rearRightPsi,
      temp: tpms.tempC + 2,
      nominal: 112,
      position: "col-start-2 row-start-2",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-panel">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
            <Gauge className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-foreground">
                TPMS · Tire Pressure Monitoring System
              </h3>
              <span className="rounded bg-saffron/10 border border-saffron/20 px-2 py-0.5 text-[10px] font-bold text-saffron uppercase">
                टायर प्रेशर निगरानी
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live per-axle tire pressure and temperature telemetry for {truck.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            All 4 Axle Sensors Nominal
          </span>
        </div>
      </div>

      {/* Axle Grid Display */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tires.map((t) => {
          const variance = Math.abs(t.psi - t.nominal);
          const isHealthy = variance <= 4;

          return (
            <div
              key={t.id}
              className="relative overflow-hidden rounded-xl border border-border/70 bg-midnight/70 p-4 transition-all hover:border-accent/40"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Disc className="size-3.5 text-accent" />
                  {t.id} · {t.name}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    isHealthy
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber/20 text-amber"
                  }`}
                >
                  {isHealthy ? "OPTIMAL" : "CHECK"}
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="font-display text-2xl font-extrabold text-foreground">
                  {t.psi} <span className="text-xs font-normal text-muted-foreground">PSI</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Thermometer className="size-3 text-saffron" />
                  <span>{t.temp}°C</span>
                </div>
              </div>

              {/* Pressure Bar */}
              <div className="mt-2.5">
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${Math.min(100, (t.psi / 130) * 100)}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>Baseline: {t.nominal} PSI</span>
                  <span>Max: 130 PSI</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TPMS Context Note */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 bg-midnight/40 px-3.5 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-accent" />
          <span>
            <strong>Load Distribution Integrity:</strong> TPMS feeds work in tandem with bed load
            cells to detect axle shifts, unauthorized payload offloading, or tire tampering.
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Uplink: GSM Telemetry Gateway (433MHz Wireless TPMS)
        </span>
      </div>
    </div>
  );
}
