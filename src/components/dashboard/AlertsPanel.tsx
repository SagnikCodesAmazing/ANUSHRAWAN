import { AlertTriangle, Bell, Check, MapPin, Radio, ShieldAlert, Trash2 } from "lucide-react";
import type { ThefaAlert } from "@/lib/fleet-data";
import { formatClock } from "@/lib/fleet-data";
import { Button } from "@/components/ui/button";

interface AlertsPanelProps {
  alerts: ThefaAlert[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function AlertsPanel({ alerts, onAcknowledge, onDismiss }: AlertsPanelProps) {
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-panel">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber/15 text-amber">
            <Bell className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-bold text-foreground">Theft Alerts</h3>
              <span className="rounded bg-saffron/10 border border-saffron/20 px-1.5 py-0.5 text-[10px] font-semibold text-saffron">
                चोरी चेतावनी
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Real-time load breach on highways
            </p>
          </div>
        </div>

        {unacknowledgedCount > 0 ? (
          <span className="flex items-center gap-1.5 rounded-full bg-amber/20 px-2.5 py-1 text-xs font-semibold text-amber">
            <span className="size-2 rounded-full bg-amber animate-ping" />
            {unacknowledgedCount} New
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            Clear
          </span>
        )}
      </div>

      <div className="mt-4 flex-1 overflow-y-auto space-y-3 max-h-[380px] pr-1">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="rounded-full bg-muted/60 p-3 text-muted-foreground mb-3">
              <Check className="size-6 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-foreground">No active cargo theft alerts</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
              All fleet strain gauges report normal weights across national highway corridors.
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`group relative rounded-xl border p-3.5 transition-all ${
                alert.acknowledged
                  ? "border-border/60 bg-muted/30 opacity-75"
                  : "border-amber/40 bg-amber/5 hover:border-amber/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                      alert.dropPercent > 10
                        ? "bg-destructive/20 text-destructive-foreground border border-destructive/30"
                        : "bg-amber/20 text-amber"
                    }`}
                  >
                    <AlertTriangle className="size-3" />-{alert.dropPercent}% Cargo
                  </span>
                  <span className="text-xs font-semibold text-foreground">{alert.truckId}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {formatClock(alert.timestamp)} IST
                </span>
              </div>

              <div className="mt-2.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0 text-accent mt-0.5" />
                <div>
                  <span className="text-foreground font-medium block">{alert.location}</span>
                  <span className="text-[11px] text-saffron block mt-0.5">
                    {alert.highwayRef || "NHAI Corridor Telemetry"}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                <span className="text-muted-foreground">
                  Weight:{" "}
                  <strong className="text-foreground">
                    {alert.weightKg.toLocaleString("en-IN")} kg
                  </strong>{" "}
                  <span className="text-[11px]">({(alert.weightKg / 100).toFixed(1)} Qtl)</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {!alert.acknowledged ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
                      onClick={() => onAcknowledge(alert.id)}
                    >
                      <Check className="mr-1 size-3" />
                      Acknowledge
                    </Button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-medium">Acknowledged</span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDismiss(alert.id)}
                    title="Dismiss alert"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
