import { AlertOctagon, CheckCircle, Radio, RotateCcw, Scale, ShieldCheck } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Truck, WeightPoint } from "@/lib/fleet-data";
import { Button } from "@/components/ui/button";

interface WeightMonitorCardProps {
  truck: Truck;
  series: WeightPoint[];
  currentWeight: number;
  breached: boolean;
  onReset: () => void;
  theftCountdown?: number;
  onTriggerTheft?: () => void;
}

export function WeightMonitorCard({
  truck,
  series,
  currentWeight,
  breached,
  onReset,
  theftCountdown,
  onTriggerTheft,
}: WeightMonitorCardProps) {
  // Focus the chart domain tightly around active cargo weight range, threshold, and baseline
  // so the data curve and gradient area richly fill the vertical height of the chart
  const allWeights = series.length ? series.map((s) => s.weight) : [currentWeight];
  const lowestObserved = Math.min(...allWeights, currentWeight);
  const highestObserved = Math.max(...allWeights, currentWeight);

  const minBound = Math.min(lowestObserved, truck.thresholdKg) - 350;
  const maxBound = Math.max(highestObserved, truck.baseWeightKg) + 350;

  const yDomainMin = Math.floor(minBound / 250) * 250;
  const yDomainMax = Math.ceil(maxBound / 250) * 250;

  const dropKg = truck.baseWeightKg - currentWeight;
  const dropPercent = Math.max(0, (dropKg / truck.baseWeightKg) * 100);
  const quintals = (currentWeight / 100).toFixed(1);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-panel">
      {/* Header & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-foreground">
              Load Cell · Cargo Weight Monitor
            </h3>
            <span className="rounded bg-saffron/10 border border-saffron/20 px-1.5 py-0.5 text-[10px] font-semibold text-saffron">
              भार संवेदक
            </span>
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                breached
                  ? "bg-destructive/20 text-destructive-foreground border border-destructive/40"
                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {breached ? (
                <>
                  <AlertOctagon className="size-3" />
                  Theft Alert
                </>
              ) : (
                <>
                  <CheckCircle className="size-3" />
                  Cargo Normal
                </>
              )}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
            <span>{truck.model}</span>
            <span>·</span>
            <span className="text-saffron font-medium">{truck.cargoType}</span>
            <span>·</span>
            <span className="text-accent font-medium">
              ₹{(truck.cargoValueInr / 100000).toFixed(1)} Lakh E-Way Bill
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-border bg-midnight px-3.5 py-2">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">
              Current Weight
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`font-display text-xl font-bold ${
                  breached ? "text-amber" : "text-accent"
                }`}
              >
                {currentWeight.toLocaleString("en-IN")} kg
              </span>
              <span className="text-xs font-medium text-muted-foreground">({quintals} Qtl)</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-midnight px-3.5 py-2">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">
              Theft Threshold
            </span>
            <span className="font-display text-xl font-bold text-muted-foreground">
              {truck.thresholdKg.toLocaleString("en-IN")} kg
            </span>
          </div>

          {theftCountdown !== undefined && theftCountdown > 0 && !breached && onTriggerTheft && (
            <Button
              variant="outline"
              size="sm"
              onClick={onTriggerTheft}
              className="h-10 border-amber/40 bg-amber/10 text-amber hover:bg-amber/20 hover:text-amber text-xs font-semibold gap-1.5"
              title="Skip 1-minute countdown and start simulated theft immediately"
            >
              <AlertOctagon className="size-3.5" />
              Simulate Theft Now ({theftCountdown}s)
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-10 hover:bg-accent/10 hover:text-accent hover:border-accent/40"
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Reset Baseline
          </Button>
        </div>
      </div>

      {/* Vibration filter status indicator */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground bg-midnight/50 px-3 py-1.5 rounded-lg border border-border/50">
        <span className="flex items-center gap-1.5 text-accent font-medium">
          <span className="size-2 rounded-full bg-accent animate-pulse" />
          Load Cell Dynamic Vibration Filter Active
        </span>
        <span className="text-muted-foreground">
          {theftCountdown !== undefined && theftCountdown > 0 && !breached ? (
            <span>
              Transit State: <strong className="text-emerald-400">Normal Secure Cargo</strong> · Simulated Highway Theft starts in{" "}
              <strong className="text-amber font-mono font-bold">{theftCountdown}s</strong>
            </span>
          ) : (
            <span>
              Load Cells: <strong className="text-foreground">4-Point Chassis Sensors</strong> · Telemetry Window:{" "}
              <strong className="text-foreground font-mono">12 Minutes</strong> (Loss Duration:{" "}
              <strong className="text-amber font-mono">10+ mins</strong>)
            </span>
          )}
        </span>
      </div>

      {/* Warning banner if breached */}
      {breached && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-amber/50 bg-amber/10 px-4 py-3 text-sm text-amber">
          <div className="flex items-center gap-2">
            <AlertOctagon className="size-5 shrink-0" />
            <span>
              <strong>Cargo Drop Detected:</strong> {dropKg.toLocaleString("en-IN")} kg lost over
              10+ mins duration ({dropPercent.toFixed(1)}% below baseline). Progressive unauthorized
              unloading on highway!
            </span>
          </div>
          <Button size="sm" variant="secondary" onClick={onReset} className="ml-3 shrink-0">
            Recalibrate
          </Button>
        </div>
      )}

      {/* Recharts Area Chart — Richly filled gradient and focused load range */}
      <div className="mt-5 h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 20, right: 25, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="weightNormalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.65} />
                <stop offset="50%" stopColor="#00E5FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00E5FF" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="weightBreachGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFB300" stopOpacity={0.7} />
                <stop offset="50%" stopColor="#FFB300" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#FFB300" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />

            <XAxis
              dataKey="time"
              stroke="#727a8c"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              interval={3}
              tickFormatter={(v: string) => (v.length >= 5 ? v.slice(0, 5) : v)}
            />

            <YAxis
              domain={[yDomainMin, yDomainMax]}
              tickCount={6}
              stroke="#727a8c"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}t`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0D1B2A",
                borderColor: "rgba(255,255,255,0.15)",
                borderRadius: "0.75rem",
                color: "#F1F3F5",
                fontSize: "12px",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
              }}
              formatter={(val: number) => [
                `${val.toLocaleString("en-IN")} kg (${(val / 100).toFixed(1)} Qtl)`,
                "Load Weight",
              ]}
              labelFormatter={(label: string) => `Timestamp: ${label} IST`}
            />

            {/* Threshold line */}
            <ReferenceLine
              y={truck.thresholdKg}
              stroke="#FFB300"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Alert Threshold (${truck.thresholdKg.toLocaleString("en-IN")} kg)`,
                fill: "#FFB300",
                fontSize: 11,
                position: "insideBottomRight",
              }}
            />

            {/* Baseline line */}
            <ReferenceLine
              y={truck.baseWeightKg}
              stroke="#38bdf8"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: `Baseline (${truck.baseWeightKg.toLocaleString("en-IN")} kg)`,
                fill: "#38bdf8",
                fontSize: 11,
                position: "insideTopRight",
              }}
            />

            <Area
              type="monotone"
              dataKey="weight"
              stroke={breached ? "#FFB300" : "#00E5FF"}
              strokeWidth={3}
              fill={breached ? "url(#weightBreachGrad)" : "url(#weightNormalGrad)"}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
