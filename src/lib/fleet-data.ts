export type TruckStatus = "active" | "idle" | "alert";

export type Truck = {
  id: string;
  plate: string;
  driver: string;
  route: string;
  corridor: string;
  model: string;
  cargoType: string;
  cargoValueInr: number;
  fastagId: string;
  capacityKg: number;
  baseWeightKg: number;
  thresholdKg: number;
  status: TruckStatus;
};

export const TRUCKS: Truck[] = [
  {
    id: "MH-TRK-104",
    plate: "MH 12 AB 4471",
    driver: "Ramesh Yadav",
    route: "Mumbai → Pune (NH-48)",
    corridor: "Western Dedicated Highway Corridor",
    model: "Tata Prima 5530.S Heavy Hauler",
    cargoType: "Automotive Precision Parts & Alloys",
    cargoValueInr: 5400000,
    fastagId: "FASTAG-MH12-88219",
    capacityKg: 16000,
    baseWeightKg: 12450,
    thresholdKg: 11800,
    status: "active",
  },
  {
    id: "DL-TRK-221",
    plate: "DL 01 CG 9932",
    driver: "Harpreet Singh",
    route: "Delhi → Jaipur (NE-4 / NH-48)",
    corridor: "Delhi-Mumbai Expressway Freight Corridor",
    model: "BharatBenz 2823R Multi-Axle",
    cargoType: "Consumer Electronics & Hardware",
    cargoValueInr: 8800000,
    fastagId: "FASTAG-DL01-44710",
    capacityKg: 20000,
    baseWeightKg: 17800,
    thresholdKg: 16900,
    status: "active",
  },
  {
    id: "TN-TRK-078",
    plate: "TN 09 BK 1180",
    driver: "S. Karthik",
    route: "Chennai → Bengaluru (NH-44)",
    corridor: "South Deccan Logistics Arterial",
    model: "Ashok Leyland AVTR 4220 8x2",
    cargoType: "Export Textiles & Pharmaceutical Goods",
    cargoValueInr: 4200000,
    fastagId: "FASTAG-TN09-32118",
    capacityKg: 14000,
    baseWeightKg: 9800,
    thresholdKg: 9200,
    status: "idle",
  },
  {
    id: "GJ-TRK-317",
    plate: "GJ 05 DR 6624",
    driver: "Bhavesh Patel",
    route: "Surat → Ahmedabad (NH-48)",
    corridor: "Gujarat Industrial Expressway",
    model: "Eicher Pro 6028 Commercial Carrier",
    cargoType: "Chemical Ingot & Synthetic Yarn",
    cargoValueInr: 6100000,
    fastagId: "FASTAG-GJ05-99823",
    capacityKg: 18000,
    baseWeightKg: 15200,
    thresholdKg: 14400,
    status: "active",
  },
];

/** Normalised route waypoints (0-1 space) drawn on the schematic map panel. */
export const ROUTES: Record<string, { x: number; y: number; label?: string }[]> = {
  "MH-TRK-104": [
    { x: 0.08, y: 0.78, label: "Mumbai (JNPT)" },
    { x: 0.24, y: 0.66, label: "Panvel Toll" },
    { x: 0.38, y: 0.7, label: "Khalapur" },
    { x: 0.52, y: 0.52, label: "Lonavala Ghat" },
    { x: 0.68, y: 0.46, label: "Talegaon" },
    { x: 0.84, y: 0.28, label: "Pune" },
  ],
  "DL-TRK-221": [
    { x: 0.1, y: 0.2, label: "Delhi NCR" },
    { x: 0.28, y: 0.3, label: "Gurugram" },
    { x: 0.42, y: 0.44, label: "Rewari" },
    { x: 0.6, y: 0.52, label: "Behror Toll" },
    { x: 0.86, y: 0.72, label: "Jaipur" },
  ],
  "TN-TRK-078": [
    { x: 0.86, y: 0.8, label: "Chennai Port" },
    { x: 0.66, y: 0.7, label: "Kanchipuram" },
    { x: 0.48, y: 0.6, label: "Vellore" },
    { x: 0.3, y: 0.44, label: "Hosur Toll" },
    { x: 0.12, y: 0.24, label: "Bengaluru" },
  ],
  "GJ-TRK-317": [
    { x: 0.14, y: 0.82, label: "Surat" },
    { x: 0.32, y: 0.68, label: "Ankleshwar" },
    { x: 0.5, y: 0.54, label: "Bharuch" },
    { x: 0.7, y: 0.36, label: "Vadodara" },
    { x: 0.88, y: 0.18, label: "Ahmedabad" },
  ],
};

export type GeoPoint = {
  lat: number;
  lng: number;
  label: string;
  isStart?: boolean;
  isEnd?: boolean;
  details?: string;
};

export const GEO_ROUTES: Record<string, GeoPoint[]> = {
  "MH-TRK-104": [
    {
      lat: 18.9499,
      lng: 72.9525,
      label: "Origin: Mumbai (JNPT Port)",
      details: "Terminal 4 · Dispatched 05:30 IST",
      isStart: true,
    },
    { lat: 18.9894, lng: 73.1175, label: "Panvel Toll Plaza", details: "FASTag Lane 04 · Cleared" },
    { lat: 18.7885, lng: 73.3082, label: "Khalapur Toll Plaza", details: "Km 32 · Speed 68 km/h" },
    {
      lat: 18.7546,
      lng: 73.4062,
      label: "Lonavala Khandala Ghat",
      details: "Elevation 622m · Grade 4%",
    },
    { lat: 18.7345, lng: 73.6766, label: "Talegaon Toll Plaza", details: "Km 84 · Normal Weight" },
    {
      lat: 18.6298,
      lng: 73.7997,
      label: "Pimpri-Chinchwad Gateway",
      details: "Industrial Arterial",
    },
    {
      lat: 18.5204,
      lng: 73.8567,
      label: "Destination: Pune Central Logistics Hub",
      details: "Chakan Depot · ETA: 13:45 IST",
      isEnd: true,
    },
  ],
  "DL-TRK-221": [
    {
      lat: 28.7495,
      lng: 77.1362,
      label: "Origin: Delhi (SGTN Terminal)",
      details: "Sanjay Gandhi Transport Nagar · Dispatched 04:15 IST",
      isStart: true,
    },
    {
      lat: 28.4068,
      lng: 76.9934,
      label: "Gurugram Kherki Daula Toll",
      details: "FASTag Express Lane",
    },
    {
      lat: 28.2055,
      lng: 76.7909,
      label: "Rewari Industrial Corridor",
      details: "Km 72 · Speed 64 km/h",
    },
    {
      lat: 27.8864,
      lng: 76.2808,
      label: "Behror Checkpoint Toll",
      details: "Haryana-Rajasthan Border",
    },
    { lat: 27.7025, lng: 76.1983, label: "Kotputli Bypass", details: "NH-48 Midpoint" },
    { lat: 27.3892, lng: 75.9603, label: "Shahpura Rest Stop", details: "Km 182 · Sensor Nominal" },
    {
      lat: 26.9657,
      lng: 75.7725,
      label: "Destination: Jaipur VKI Freight Terminal",
      details: "Vishwakarma Industrial Area · ETA: 12:30 IST",
      isEnd: true,
    },
  ],
  "TN-TRK-078": [
    {
      lat: 13.0837,
      lng: 80.298,
      label: "Origin: Chennai Port Trust",
      details: "Container Terminal 2 · Dispatched 06:00 IST",
      isStart: true,
    },
    { lat: 12.9692, lng: 79.9442, label: "Sriperumbudur Auto Hub", details: "NH-48 Auto Cluster" },
    { lat: 12.8342, lng: 79.7036, label: "Kanchipuram Bypass", details: "Km 68 · Speed 58 km/h" },
    { lat: 12.9165, lng: 79.1325, label: "Vellore Pallikonda Toll", details: "FASTag Verified" },
    {
      lat: 12.6845,
      lng: 78.6186,
      label: "Ambur Freight Corridor",
      details: "Leather Industrial Zone",
    },
    { lat: 12.5186, lng: 78.2137, label: "Krishnagiri Toll Plaza", details: "NH-44 Junction" },
    {
      lat: 12.7409,
      lng: 77.8253,
      label: "Hosur TN-KA Checkpoint",
      details: "State Border Clearance",
    },
    {
      lat: 12.9716,
      lng: 77.5946,
      label: "Destination: Bengaluru Peenya Logistics Depot",
      details: "Peenya Industrial Area · ETA: 15:00 IST",
      isEnd: true,
    },
  ],
  "GJ-TRK-317": [
    {
      lat: 21.0837,
      lng: 72.8711,
      label: "Origin: Surat (Sachin GIDC)",
      details: "Textile Complex · Dispatched 07:00 IST",
      isStart: true,
    },
    { lat: 21.4012, lng: 72.9325, label: "Kim Toll Plaza", details: "FASTag Lane 02" },
    {
      lat: 21.6264,
      lng: 73.0152,
      label: "Bharuch Narmada Cable Bridge",
      details: "Golden Bridge Crossing",
    },
    {
      lat: 22.0524,
      lng: 73.1189,
      label: "Karjan Highway Stretch",
      details: "Km 92 · Speed 72 km/h",
    },
    {
      lat: 22.3072,
      lng: 73.1812,
      label: "Vadodara NE-1 Expressway Entry",
      details: "Expressway Transit",
    },
    { lat: 22.5645, lng: 72.9289, label: "Anand Express Toll", details: "Milk City Interchange" },
    {
      lat: 22.9868,
      lng: 72.4831,
      label: "Destination: Ahmedabad Changodar Hub",
      details: "Express Highway Terminal · ETA: 11:30 IST",
      isEnd: true,
    },
  ],
};

export type WeightPoint = { t: number; time: string; weight: number };

export type ThefaAlert = {
  id: string;
  truckId: string;
  timestamp: number;
  dropPercent: number;
  weightKg: number;
  location: string;
  highwayRef: string;
  acknowledged: boolean;
};

const LOCATIONS = [
  { name: "NH-48, Km 112 near Khalapur Toll Plaza", ref: "NHAI Western Corridor · Maharashtra" },
  { name: "NH-44, Km 78 near Krishnagiri Checkpost", ref: "NHAI South Spine · Tamil Nadu" },
  {
    name: "NE-4 Expressway, Km 204 near Dausa Inter-change",
    ref: "Delhi-Mumbai Expressway · Rajasthan",
  },
  { name: "NH-48, Km 46 Kim Industrial Junction", ref: "Golden Quadrilateral · Gujarat" },
  { name: "NH-19, Km 289 near Kanpur Bypass Toll", ref: "Eastern Dedicated Freight Corridor · UP" },
];

export function getTruck(id: string): Truck {
  return TRUCKS.find((t) => t.id === id) ?? TRUCKS[0]!;
}

export function randomLocation() {
  return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]!;
}

export function formatClock(ts: number) {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Deterministic pseudo-random so SSR and client agree on seeded history. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function seedWeightSeries(truck: Truck, points = 24, baseTimestamp?: number): WeightPoint[] {
  const rand = seeded(truck.baseWeightKg);
  // Default to a deterministic base time for SSR if not supplied
  const now = baseTimestamp ?? (typeof window !== "undefined" ? Date.now() : 1772186400000);
  const stepMs = 30 * 1000; // 30 seconds per step => 24 points = 12 minutes total duration

  // Simulate realistic 10+ minute progressive loss profile for alert-state trucks
  const isTheftTruck = truck.id === "MH-TRK-104";

  return Array.from({ length: points }, (_, i) => {
    const pointTs = now - (points - 1 - i) * stepMs;
    const d = new Date(pointTs);
    const timeStr = d.toLocaleTimeString("en-IN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    let weight = truck.baseWeightKg + (rand() - 0.5) * 30;

    // Weight loss happens progressively over at least 10 minutes!
    // Points 0..3 (first 2 minutes) are nominal.
    // Points 4..23 (20 steps * 30s = 10 full minutes) show progressive, steady loss!
    if (isTheftTruck && i >= 4) {
      const step = i - 4; // 0 to 19 (20 steps over 10 minutes)
      const fraction = (step + 1) / 20; // 0.05 to 1.0
      const totalLoss = truck.baseWeightKg - truck.thresholdKg + 550; // drops well below threshold
      const progressiveLoss = totalLoss * Math.pow(fraction, 0.95);
      weight = Math.round(truck.baseWeightKg - progressiveLoss + (rand() - 0.5) * 35);
    }

    return {
      t: i,
      time: timeStr,
      weight: Math.max(0, Math.round(weight)),
    };
  });
}

export function seedDailyTrend(truck: Truck) {
  const rand = seeded(truck.capacityKg);
  return Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, "0")}:00 IST`,
    weight: Math.round(truck.baseWeightKg - (h > 14 ? (h - 14) * 55 : 0) + (rand() - 0.5) * 120),
    threshold: truck.thresholdKg,
  }));
}

export const WEEKLY_ALERTS = [
  { day: "Mon", alerts: 2, resolved: 2 },
  { day: "Tue", alerts: 4, resolved: 3 },
  { day: "Wed", alerts: 1, resolved: 1 },
  { day: "Thu", alerts: 6, resolved: 4 },
  { day: "Fri", alerts: 3, resolved: 3 },
  { day: "Sat", alerts: 5, resolved: 2 },
  { day: "Sun", alerts: 2, resolved: 2 },
];
