import { useState } from "react";
import {
  AlertOctagon,
  CheckCircle2,
  Fuel,
  PowerOff,
  Radio,
  RefreshCw,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Truck } from "@/lib/fleet-data";
import type { GsmTelemetry } from "@/hooks/use-sensor-feed";
import { toast } from "sonner";

interface SolenoidControlPanelProps {
  truck: Truck;
  solenoidStatus: "OPEN" | "CLOSED";
  isFuelCut: boolean;
  gsmSignal: GsmTelemetry;
  speed: number;
  onTriggerCutoff: () => void;
  onRestoreFlow: () => void;
}

export function SolenoidControlPanel({
  truck,
  solenoidStatus,
  isFuelCut,
  gsmSignal,
  speed,
  onTriggerCutoff,
  onRestoreFlow,
}: SolenoidControlPanelProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCommandPending, setIsCommandPending] = useState(false);

  const handleConfirmCutoff = () => {
    setIsCommandPending(true);
    setShowConfirmModal(false);

    // Simulate GSM command roundtrip latency
    setTimeout(() => {
      onTriggerCutoff();
      setIsCommandPending(false);
      toast.error(`GSM Command Executed · Solenoid Valve Closed`, {
        description: `Fuel line cut off for ${truck.id}. Vehicle immobilized to stop corrupt driver.`,
        duration: 5000,
      });
    }, 600);
  };

  const handleRestore = () => {
    setIsCommandPending(true);
    setTimeout(() => {
      onRestoreFlow();
      setIsCommandPending(false);
      toast.success(`Fuel Flow Restored · Solenoid Valve Reopened`, {
        description: `Normal diesel supply restored to engine on ${truck.id}.`,
        duration: 4000,
      });
    }, 500);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-panel transition-all ${
        isFuelCut
          ? "border-destructive/60 bg-gradient-to-br from-destructive/10 via-card to-background shadow-red-900/20"
          : "border-border bg-card"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-xl border ${
              isFuelCut
                ? "border-destructive/50 bg-destructive/20 text-destructive-foreground animate-pulse"
                : "border-accent/40 bg-accent/10 text-accent"
            }`}
          >
            <Fuel className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-foreground">
                Fuel Line Solenoid Valve
              </h3>
              <span className="rounded bg-saffron/10 border border-saffron/20 px-2 py-0.5 text-[10px] font-bold text-saffron uppercase">
                ईंधन नियंत्रण
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Remote anti-theft engine immobilizer via inline fuel pipe valve
            </p>
          </div>
        </div>

        {/* Live Valve Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
              isFuelCut
                ? "bg-destructive/20 text-destructive-foreground border border-destructive/40 animate-pulse"
                : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                isFuelCut ? "bg-destructive animate-ping" : "bg-emerald-400"
              }`}
            />
            <span>{isFuelCut ? "VALVE CLOSED · FUEL CUT OFF" : "VALVE OPEN · FLOWING"}</span>
          </div>
        </div>
      </div>

      {/* Fuel Pipe Schematic Visual */}
      <div className="mt-4 rounded-xl border border-border/60 bg-midnight/80 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Fuel Pipe Flow Graphic */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono mb-1.5">
              <span>Diesel Fuel Tank</span>
              <span className="text-foreground font-semibold">
                Solenoid Valve (Fuel Pipe)
              </span>
              <span>Common Rail Engine</span>
            </div>

            {/* Pipe Diagram */}
            <div className="relative h-6 w-full rounded-full border border-border/70 bg-slate-900 overflow-hidden flex items-center">
              {/* Animated Fuel Stream */}
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                  isFuelCut ? "w-[48%] bg-amber-500/30" : "w-full bg-emerald-500/25"
                }`}
              >
                {!isFuelCut && (
                  <div className="h-full w-full bg-[linear-gradient(90deg,transparent_0%,rgba(16,185,129,0.5)_50%,transparent_100%)] animate-pulse" />
                )}
              </div>

              {/* Solenoid Cut-off Gate in center */}
              <div className="absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                <div
                  className={`size-5 rounded-md flex items-center justify-center border transition-all ${
                    isFuelCut
                      ? "bg-destructive border-white text-white shadow-lg scale-110"
                      : "bg-emerald-600 border-white/80 text-white shadow"
                  }`}
                >
                  {isFuelCut ? (
                    <PowerOff className="size-3" />
                  ) : (
                    <CheckCircle2 className="size-3" />
                  )}
                </div>
              </div>

              {/* Blocked indicator on engine side */}
              {isFuelCut && (
                <div className="absolute right-3 text-[10px] font-bold text-destructive flex items-center gap-1">
                  <span>NO FUEL DELIVERY</span>
                </div>
              )}
            </div>
          </div>

          {/* Operational Context Chip */}
          <div className="shrink-0 text-right sm:border-l sm:border-border/60 sm:pl-4">
            <div className="text-[11px] text-muted-foreground">Current Speed</div>
            <div
              className={`font-mono text-xl font-bold ${
                isFuelCut ? "text-destructive" : "text-foreground"
              }`}
            >
              {speed} km/h
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {isFuelCut ? "Vehicle Decelerated / Halted" : "Normal Transit"}
            </div>
          </div>
        </div>

        {/* GSM Control Link Sub-strip */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Radio className="size-3.5 text-accent animate-pulse" />
            <span>
              GSM Command Channel:{" "}
              <strong className="text-foreground font-mono">GSM Telemetry</strong> (
              {gsmSignal.dbm} dBm · {gsmSignal.latencyMs}ms)
            </span>
          </div>
          <div className="text-[11px]">
            IMEI: <span className="font-mono text-slate-300">{gsmSignal.imei}</span>
          </div>
        </div>
      </div>

      {/* Case Description & Purpose Banner */}
      <div className="mt-3.5 rounded-xl border border-border/60 bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">Anti-Theft Protocol:</strong> If a driver is
          corrupt, deviating from authorized corridors, or refusing to stop during an active cargo
          theft alert, trigger the inline fuel pipe solenoid valve. The GSM module cuts off fuel
          delivery to safely stall the engine and stop the vehicle.
        </p>
      </div>

      {/* Action Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {isFuelCut ? (
            <span className="text-destructive font-semibold flex items-center gap-1.5">
              <AlertOctagon className="size-4" /> Solenoid active. Engine cannot restart until
              restored.
            </span>
          ) : (
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <Zap className="size-3.5" /> Solenoid valve armed and ready for remote cut-off.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isFuelCut ? (
            <Button
              onClick={handleRestore}
              disabled={isCommandPending}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
            >
              <RefreshCw className={`size-3.5 ${isCommandPending ? "animate-spin" : ""}`} />
              Restore Fuel Flow
            </Button>
          ) : (
            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={isCommandPending}
              size="sm"
              variant="destructive"
              className="font-bold gap-1.5 shadow-md hover:shadow-destructive/30"
            >
              <PowerOff className="size-3.5" />
              Emergency Fuel Cut-Off (Solenoid)
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Fuel Cut-Off */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-destructive/60 bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-destructive mb-3">
              <div className="grid size-10 place-items-center rounded-xl bg-destructive/20 border border-destructive/40">
                <ShieldAlert className="size-6 text-destructive" />
              </div>
              <div>
                <h4 className="font-display text-lg font-bold text-foreground">
                  Confirm Emergency Fuel Cut-Off
                </h4>
                <p className="text-xs text-muted-foreground">Truck ID: {truck.id}</p>
              </div>
            </div>

            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-foreground/90 space-y-2">
              <p className="font-semibold text-destructive">
                Are you sure you want to actuate the fuel pipe solenoid valve?
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                This will send an immediate GSM command packet to close the inline solenoid valve in
                the truck&apos;s fuel pipe. Fuel delivery to the engine will be cut, bringing the
                vehicle to a complete halt on the highway.
              </p>
              <p className="text-[11px] text-saffron font-medium">
                Use case: Corrupt driver involved in cargo theft refusing to stop or follow route.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmCutoff}
                className="font-bold text-xs gap-1.5"
              >
                <PowerOff className="size-3.5" />
                Yes, Shut Fuel Line Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
