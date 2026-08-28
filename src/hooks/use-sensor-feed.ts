import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatClock,
  randomLocation,
  seedWeightSeries,
  type ThefaAlert,
  type TpmsData,
  type Truck,
  type WeightPoint,
} from "@/lib/fleet-data";

export type GsmTelemetry = {
  dbm: number;
  bars: number;
  latencyMs: number;
  carrier: string;
  imei: string;
  status: "connected" | "transmitting";
};

/**
 * Simulated real-time load-sensor, TPMS, GSM, and Fuel Solenoid feed.
 * Allows remote fuel cut-off to immobilize the vehicle if a driver is corrupt or refusing to stop.
 */
export function useSensorFeed(truck: Truck) {
  const [series, setSeries] = useState<WeightPoint[]>(() => seedWeightSeries(truck));
  const [speed, setSpeed] = useState(52);
  const [progress, setProgress] = useState(0.32);
  const [alerts, setAlerts] = useState<ThefaAlert[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("--:--:--");
  const [solenoidStatus, setSolenoidStatus] = useState<"OPEN" | "CLOSED">(truck.solenoidValveStatus ?? "OPEN");
  const [tpms, setTpms] = useState<TpmsData>(() => truck.tpms);
  const [gsmSignal, setGsmSignal] = useState<GsmTelemetry>({
    dbm: -68,
    bars: 4,
    latencyMs: 42,
    carrier: truck.gsmCarrier,
    imei: truck.gsmImei,
    status: "connected",
  });

  const weightRef = useRef(truck.baseWeightKg);
  const tickRef = useRef(0);
  const solenoidRef = useRef(solenoidStatus);
  solenoidRef.current = solenoidStatus;

  // 1-minute delay before simulated theft starts
  const mountTimeRef = useRef<number>(Date.now());
  const manualTheftRef = useRef<boolean>(false);
  const [theftCountdown, setTheftCountdown] = useState<number>(60);
  const [theftActive, setTheftActive] = useState<boolean>(false);

  useEffect(() => {
    const initialSeries = seedWeightSeries(truck, 24, Date.now());
    setSeries(initialSeries);
    weightRef.current = truck.baseWeightKg;
    mountTimeRef.current = Date.now();
    manualTheftRef.current = false;
    setTheftCountdown(60);
    setTheftActive(false);
    setAlerts([]);
    tickRef.current = 0;
    setProgress(0.3);
    setSolenoidStatus(truck.solenoidValveStatus ?? "OPEN");
    setTpms(truck.tpms);
    setGsmSignal({
      dbm: -68,
      bars: 4,
      latencyMs: 38 + Math.floor(Math.random() * 8),
      carrier: truck.gsmCarrier,
      imei: truck.gsmImei,
      status: "connected",
    });
    setLastUpdate(formatClock(Date.now()));
  }, [truck]);

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      const now = Date.now();
      setLastUpdate(formatClock(now));

      const isFuelCut = solenoidRef.current === "CLOSED";

      // Calculate elapsed time from mount
      const elapsedSec = (now - mountTimeRef.current) / 1000;
      const isTheftTime = manualTheftRef.current || elapsedSec >= 60;
      const remaining = Math.max(0, Math.ceil(60 - elapsedSec));

      setTheftCountdown(manualTheftRef.current ? 0 : remaining);
      setTheftActive(isTheftTime);

      // Live TPMS telemetry micro-variations
      setTpms((prev) => ({
        ...prev,
        frontLeftPsi: Math.round(truck.tpms.frontLeftPsi + (Math.random() - 0.5) * 1.5),
        frontRightPsi: Math.round(truck.tpms.frontRightPsi + (Math.random() - 0.5) * 1.5),
        rearLeftPsi: Math.round(truck.tpms.rearLeftPsi + (Math.random() - 0.5) * 1.8),
        rearRightPsi: Math.round(truck.tpms.rearRightPsi + (Math.random() - 0.5) * 1.8),
        tempC: Math.round(truck.tpms.tempC + (isFuelCut ? -0.2 : (Math.random() - 0.5) * 0.4)),
      }));

      // GSM uplink jitter
      setGsmSignal((prev) => ({
        ...prev,
        dbm: -66 - Math.floor(Math.random() * 8),
        latencyMs: 38 + Math.floor(Math.random() * 12),
        status: tick % 2 === 0 ? "transmitting" : "connected",
      }));

      // Weight behavior:
      // First 60 seconds (1 minute): Normal transit. Load cells read nominal weight with road vibration.
      // After 60 seconds: Simulated cargo theft event begins, progressively dropping weight below threshold.
      if (!isTheftTime) {
        weightRef.current = truck.baseWeightKg + (Math.random() - 0.5) * 14;
      } else {
        const targetTheftWeight = truck.thresholdKg - 580; // ~11,220 kg
        if (weightRef.current > targetTheftWeight) {
          // Progressively drop ~60-90 kg every 2-second tick
          weightRef.current = Math.max(
            targetTheftWeight,
            weightRef.current - (55 + Math.random() * 30),
          );
        } else {
          // Stay around theft weight with minor vibration
          weightRef.current = targetTheftWeight + (Math.random() - 0.5) * 10;
        }
      }

      const weight = Math.max(0, Math.round(weightRef.current));

      // Speed is zero if fuel solenoid valve is closed!
      if (isFuelCut) {
        setSpeed((s) => Math.max(0, s > 0 ? s - 18 : 0));
      } else {
        setSpeed(Math.max(0, Math.round(48 + Math.sin(tick / 6) * 14 + (Math.random() - 0.5) * 6)));
        setProgress((p) => (p >= 0.98 ? 0.02 : p + 0.003));
      }

      // Push new load-cell telemetry sample with timestamp
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
    mountTimeRef.current = Date.now();
    manualTheftRef.current = false;
    weightRef.current = truck.baseWeightKg;
    setTheftCountdown(60);
    setTheftActive(false);
    setAlerts([]);
    setSeries(seedWeightSeries(truck, 24, Date.now()));
  }, [truck]);

  const triggerTheftNow = useCallback(() => {
    manualTheftRef.current = true;
    setTheftActive(true);
    setTheftCountdown(0);
  }, []);

  /** Emergency remote fuel cut-off via Solenoid Valve in fuel pipe */
  const triggerSolenoidCutoff = useCallback(() => {
    setSolenoidStatus("CLOSED");
    setSpeed(0);
    const now = Date.now();
    const loc = randomLocation();
    setAlerts((prev) => [
      {
        id: `SOLENOID-${truck.id}-${now}`,
        truckId: truck.id,
        timestamp: now,
        dropPercent: 0,
        weightKg: weightRef.current,
        location: `${loc.name} [FUEL CUT ACTIVATED]`,
        highwayRef: "GSM Command: Solenoid Valve Closed · Vehicle Immobilized",
        acknowledged: false,
      },
      ...prev,
    ]);
  }, [truck.id]);

  /** Reopen Solenoid Valve and restore normal fuel delivery */
  const restoreFuelFlow = useCallback(() => {
    setSolenoidStatus("OPEN");
  }, []);

  const currentWeight = series[series.length - 1]?.weight ?? truck.baseWeightKg;
  const isBreached = currentWeight < truck.thresholdKg;
  const isFuelCut = solenoidStatus === "CLOSED";

  return {
    series,
    currentWeight,
    isBreached,
    speed,
    progress,
    alerts,
    lastUpdate,
    solenoidStatus,
    isFuelCut,
    tpms,
    gsmSignal,
    theftCountdown,
    theftActive,
    triggerTheftNow,
    triggerSolenoidCutoff,
    restoreFuelFlow,
    acknowledge,
    dismiss,
    resetCargo,
  };
}
