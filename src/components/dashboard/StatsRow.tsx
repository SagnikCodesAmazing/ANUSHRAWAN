import { AlertTriangle, CheckCircle2, IndianRupee, Scale, Truck } from "lucide-react";

interface StatsRowProps {
  activeTrucks: number;
  alertsToday: number;
  avgWeight: number;
  distanceKm: number;
}

export function StatsRow({ activeTrucks, alertsToday, avgWeight, distanceKm }: StatsRowProps) {
  // Convert avg weight into quintals (1 quintal = 100 kg)
  const quintals = (avgWeight / 100).toFixed(1);

  const cards = [
    {
      title: "Active Fleet",
      hindi: "सक्रिय वाहन",
      value: `${activeTrucks} HCVs`,
      sub: "Tata, BharatBenz & Leyland",
      icon: Truck,
      color: "text-accent",
      border: "border-border/70",
      bg: "bg-card",
    },
    {
      title: "Theft Alerts Today",
      hindi: "चोरी चेतावनी",
      value: alertsToday.toString(),
      sub: alertsToday === 0 ? "All corridors secured" : "Breach detected in transit",
      icon: alertsToday > 0 ? AlertTriangle : CheckCircle2,
      color: alertsToday > 0 ? "text-amber" : "text-emerald-400",
      border: alertsToday > 0 ? "border-amber/40" : "border-border/70",
      bg: alertsToday > 0 ? "bg-amber/5" : "bg-card",
      highlight: alertsToday > 0,
    },
    {
      title: "Avg Load Weight",
      hindi: "औसत भार",
      value: `${avgWeight.toLocaleString("en-IN")} kg`,
      sub: `${quintals} quintals (क्विंटल)`,
      icon: Scale,
      color: "text-accent",
      border: "border-border/70",
      bg: "bg-card",
    },
    {
      title: "Cargo Secured",
      hindi: "सुरक्षित माल",
      value: "₹2.45 Cr",
      sub: `${distanceKm.toLocaleString("en-IN")} km highway transit`,
      icon: IndianRupee,
      color: "text-saffron",
      border: "border-border/70",
      bg: "bg-card",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className={`relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-4 shadow-sm transition-all hover:border-accent/40`}
          >
            {c.highlight && (
              <div className="absolute right-0 top-0 h-16 w-16 bg-amber/10 blur-xl pointer-events-none" />
            )}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {c.title}
              </span>
              <span className={`rounded-xl p-2 bg-muted/50 ${c.color}`}>
                <Icon className="size-4" />
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between gap-2">
              <div className="font-display text-2xl font-bold tracking-tight text-foreground">
                {c.value}
              </div>
              <span className="rounded-md bg-saffron/10 border border-saffron/20 px-2 py-0.5 text-[10px] font-semibold text-saffron">
                {c.hindi}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground truncate">{c.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
