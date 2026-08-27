import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatClock,
  randomLocation,
  seedWeightSeries,
  type ThefaAlert,
  type Truck,
  type WeightPoint,
} from "@/lib/fleet-data";

/**
 * Simulated real-time load-sensor feed spanning a 12-minute timeline window
 * with a 10+ minute progressive weight-loss trajectory for active alerts.
 */
export function useSensorFeed(truck: Truck) {
  const [series, setSeries] = useState<WeightPoint[]>(() => seedWeightSeries(truck));
  const [speed, setSpeed] = useState(52);
  const [progress, setProgress] = useState(0.32);
  const [alerts, setAlerts] = useState<ThefaAlert[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("--:--:--");
  const weightRef = useRef(truck.baseWeightKg);
  const tickRef = useRef(0);

  useEffect(() => {
    const initialSeries = seedWeightSeries(truck, 24, Date.now());
    setSeries(initialSeries);
    const initialWeight = initialSeries[initialSeries.length - 1]?.weight ?? truck.baseWeightKg;
    weightRef.current = initialWeight;
    tickRef.current = 0;
    setProgress(0.3);
    setLastUpdate(formatClock(Date.now()));
  }, [truck]);

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      const now = Date.now();
      setLastUpdate(formatClock(now));

      // Progressive weight variance over transit
      if (weightRef.current < truck.thresholdKg) {
        // Active breach state: slight continuous natural loss/stability over 10+ mins
        weightRef.current += (Math.random() - 0.5) * 10 - 2;
      } else {
        weightRef.current += (Math.random() - 0.5) * 16;
        if (weightRef.current > truck.baseWeightKg + 50) weightRef.current -= 25;
      }

      const weight = Math.max(0, Math.round(weightRef.current));
      setSpeed(Math.max(0, Math.round(48 + Math.sin(tick / 6) * 14 + (Math.random() - 0.5) * 6)));
      setProgress((p) => (p >= 0.98 ? 0.02 : p + 0.003));

      // Push new telemetry sample with timestamp
      setSeries((prev) => {
        const d = new Date(now);
        const timeStr = d.toLocaleTimeString("en-IN", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        return [
          ...prev.slice(1),
          { t: (prev[prev.length - 1]?.t ?? 0) + 1, time: timeStr, weight },
        ];
      });

      if (weight < truck.thresholdKg) {
        setAlerts((prev) => {
          const recent = prev[0];
          if (recent && now - recent.timestamp < 15000) return prev;
          const drop = ((truck.baseWeightKg - weight) / truck.baseWeightKg) * 100;
          const loc = randomLocation();
          return [
            {
              id: `${truck.id}-${now}`,
              truckId: truck.id,
              timestamp: now,
              dropPercent: Number(drop.toFixed(1)),
              weightKg: weight,
              location: loc.name,
              highwayRef: loc.ref,
              acknowledged: false,
            },
            ...prev,
          ].slice(0, 12);
        });
      }
    }, 2000);

    return () => clearInterval(id);
  }, [truck]);

  const acknowledge = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  }, []);

  const dismiss = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const resetCargo = useCallback(() => {
    weightRef.current = truck.baseWeightKg;
    setSeries(seedWeightSeries(truck, 24, Date.now()));
  }, [truck]);

  const currentWeight = series[series.length - 1]?.weight ?? truck.baseWeightKg;
  const isBreached = currentWeight < truck.thresholdKg;

  return {
    series,
    currentWeight,
    isBreached,
    speed,
    progress,
    alerts,
    lastUpdate,
    acknowledge,
    dismiss,
    resetCargo,
  };
}
