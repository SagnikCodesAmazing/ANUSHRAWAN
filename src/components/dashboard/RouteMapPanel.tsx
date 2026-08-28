import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Compass,
  Expand,
  Gauge,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  PowerOff,
  Radio,
  RotateCcw,
  ShieldCheck,
  Truck as TruckIcon,
} from "lucide-react";
import type { Truck } from "@/lib/fleet-data";
import { GEO_ROUTES, type GeoPoint } from "@/lib/fleet-data";
import { Button } from "@/components/ui/button";

interface RouteMapPanelProps {
  truck: Truck;
  progress: number;
  speed: number;
  weight: number;
  lastUpdate: string;
  alerting: boolean;
  isFuelCut?: boolean;
  fullView?: boolean;
}

type MapTheme = "streets" | "dark" | "satellite";

const TILES = {
  // Free OpenStreetMap Standard — NO watermark, NO API key required
  streets: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: "Street View",
  },
  // Esri Dark Gray Canvas — NO watermark, NO API key required
  dark: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin',
    name: "Dark Route",
  },
  // Esri World Imagery (Aerial) — NO watermark, NO API key required
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics',
    name: "Aerial Imagery",
  },
};

/** Interpolates GPS coordinates along the route based on progress [0..1] */
function interpolateGeoPosition(points: GeoPoint[], progress: number): [number, number] {
  if (!points || points.length === 0) return [19.076, 72.8777];
  if (points.length === 1) return [points[0]!.lat, points[0]!.lng];

  const distances: number[] = [0];
  let totalDist = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const d = Math.hypot(p2.lat - p1.lat, p2.lng - p1.lng);
    totalDist += d;
    distances.push(totalDist);
  }

  const targetDist = Math.max(0, Math.min(1, progress)) * totalDist;
  let segIndex = 0;
  for (let i = 0; i < distances.length - 1; i++) {
    if (targetDist >= distances[i]! && targetDist <= distances[i + 1]!) {
      segIndex = i;
      break;
    }
  }

  const p0 = points[segIndex]!;
  const p1 = points[segIndex + 1] ?? p0;
  const segStartDist = distances[segIndex]!;
  const segEndDist = distances[segIndex + 1] ?? segStartDist + 0.0001;
  const segT = (targetDist - segStartDist) / (segEndDist - segStartDist || 1);

  return [p0.lat + (p1.lat - p0.lat) * segT, p0.lng + (p1.lng - p0.lng) * segT];
}

export function RouteMapPanel({
  truck,
  progress,
  speed,
  weight,
  lastUpdate,
  alerting,
  isFuelCut = false,
  fullView = false,
}: RouteMapPanelProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapTheme, setMapTheme] = useState<MapTheme>("streets");
  const [isMapReady, setIsMapReady] = useState(false);

  // References to Leaflet objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const truckMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routePolylineRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routeCasingRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const waypointMarkersRef = useRef<any[]>([]);

  const geoWaypoints: GeoPoint[] = useMemo(() => {
    return (
      GEO_ROUTES[truck.id] ?? [
        { lat: 18.9499, lng: 72.9525, label: "Origin: Mumbai (JNPT Port)", isStart: true },
        { lat: 18.5204, lng: 73.8567, label: "Destination: Pune Hub", isEnd: true },
      ]
    );
  }, [truck.id]);

  const startPoint = geoWaypoints[0]!;
  const endPoint = geoWaypoints[geoWaypoints.length - 1]!;

  const currentCoords = useMemo(() => {
    return interpolateGeoPosition(geoWaypoints, progress);
  }, [geoWaypoints, progress]);

  // Initialize or re-create Leaflet map on client only (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // If map already exists, remove it cleanly before reinitializing
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center between start and end
      const centerLat = (startPoint.lat + endPoint.lat) / 2;
      const centerLng = (startPoint.lng + endPoint.lng) / 2;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 9,
        zoomControl: false,
        attributionControl: true,
      });

      mapInstanceRef.current = map;

      // Add zoom control to top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Tile Layer
      const tileConfig = TILES[mapTheme];
      const tileLayer = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        maxZoom: 19,
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Coordinates array for polyline
      const latLngs = geoWaypoints.map((p) => [p.lat, p.lng] as [number, number]);

      // 1. Highlighted Highway Route Polyline
      // Outer casing line (Google Maps route glow/shadow)
      const casingLine = L.polyline(latLngs, {
        color: mapTheme === "dark" ? "#00E5FF" : "#1A365D",
        weight: 8,
        opacity: mapTheme === "dark" ? 0.35 : 0.25,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
      routeCasingRef.current = casingLine;

      // Foreground crisp route line
      const routeLine = L.polyline(latLngs, {
        color: alerting ? "#FFB300" : "#1E5AA8",
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
      routePolylineRef.current = routeLine;

      // 2. Starting Point Marker (A - Green Pin)
      const startIcon = L.divIcon({
        className: "custom-map-marker",
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -38],
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <div style="background-color:#16A34A; color:#ffffff; font-weight:800; font-size:12px; padding:3px 8px; border-radius:9999px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.4); border:2px solid #ffffff; display:flex; align-items:center; gap:4px; white-space:nowrap;">
              <span style="background:#ffffff; color:#16A34A; border-radius:9999px; width:16px; height:16px; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:900;">A</span>
              <span>START</span>
            </div>
            <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:7px solid #16A34A; margin-top:-1px;"></div>
          </div>
        `,
      });

      const startMarker = L.marker([startPoint.lat, startPoint.lng], { icon: startIcon }).addTo(
        map,
      );
      startMarker.bindPopup(`
        <div style="font-family:inherit; padding:4px;">
          <strong style="color:#16A34A; font-size:13px;">[Origin] ${startPoint.label}</strong>
          <p style="font-size:11px; color:#475569; margin:4px 0 0 0;">${startPoint.details ?? "Route Origin"}</p>
          <div style="margin-top:6px; font-size:10px; color:#0F172A; font-weight:600;">GSM Telemetry Verified · Loaded Weight: ${truck.baseWeightKg.toLocaleString("en-IN")} kg</div>
        </div>
      `);

      // 3. Ending Point Marker (B - Red Pin)
      const endIcon = L.divIcon({
        className: "custom-map-marker",
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -38],
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <div style="background-color:#DC2626; color:#ffffff; font-weight:800; font-size:12px; padding:3px 8px; border-radius:9999px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.4); border:2px solid #ffffff; display:flex; align-items:center; gap:4px; white-space:nowrap;">
              <span style="background:#ffffff; color:#DC2626; border-radius:9999px; width:16px; height:16px; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:900;">B</span>
              <span>END</span>
            </div>
            <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:7px solid #DC2626; margin-top:-1px;"></div>
          </div>
        `,
      });

      const endMarker = L.marker([endPoint.lat, endPoint.lng], { icon: endIcon }).addTo(map);
      endMarker.bindPopup(`
        <div style="font-family:inherit; padding:4px;">
          <strong style="color:#DC2626; font-size:13px;">[Destination] ${endPoint.label}</strong>
          <p style="font-size:11px; color:#475569; margin:4px 0 0 0;">${endPoint.details ?? "Route Destination"}</p>
          <div style="margin-top:6px; font-size:10px; color:#0F172A; font-weight:600;">Consignment Consignee Depot</div>
        </div>
      `);

      // 4. Intermediate Milestone Markers
      const intermediateMarkers = geoWaypoints.slice(1, -1).map((wp) => {
        const waypointIcon = L.divIcon({
          className: "custom-waypoint-marker",
          iconSize: [12, 12],
          iconAnchor: [6, 6],
          html: `
              <div style="width:12px; height:12px; background-color:#FFB300; border:2px solid #FFFFFF; border-radius:9999px; box-shadow:0 2px 4px rgba(0,0,0,0.4);"></div>
            `,
        });

        const m = L.marker([wp.lat, wp.lng], { icon: waypointIcon }).addTo(map);
        m.bindTooltip(`<strong>${wp.label}</strong><br/>${wp.details ?? "Highway Milestone"}`, {
          direction: "top",
          offset: [0, -6],
        });
        return m;
      });

      waypointMarkersRef.current = [startMarker, endMarker, ...intermediateMarkers];

      // 5. Live Moving Truck Marker
      const truckPos = interpolateGeoPosition(geoWaypoints, progress);
      const truckIcon = L.divIcon({
        className: "custom-truck-marker",
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        html: `
          <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:44px; height:44px; border-radius:9999px; background-color:${
              alerting ? "rgba(255, 179, 0, 0.4)" : "rgba(0, 229, 255, 0.35)"
            }; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position:relative; background-color:${
              alerting ? "#FFB300" : "#0D1B2A"
            }; color:${
              alerting ? "#000000" : "#00E5FF"
            }; width:32px; height:32px; border-radius:10px; border:2px solid #ffffff; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 15px -3px rgba(0,0,0,0.6);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                <path d="M15 18H9"/>
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                <circle cx="17" cy="18" r="2"/>
                <circle cx="7" cy="18" r="2"/>
              </svg>
            </div>
          </div>
        `,
      });

      const truckMarker = L.marker(truckPos, { icon: truckIcon, zIndexOffset: 1000 }).addTo(map);
      truckMarker.bindTooltip(
        `<strong>${truck.plate} (${truck.id})</strong><br/>Speed: ${speed} km/h · Load: ${weight.toLocaleString("en-IN")} kg`,
        { permanent: false, direction: "top", offset: [0, -16] },
      );
      truckMarkerRef.current = truckMarker;

      // Fit map to show the entire highlighted route
      map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

      setIsMapReady(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    truck.id,
    startPoint.lat,
    startPoint.lng,
    endPoint.lat,
    endPoint.lng,
    geoWaypoints,
    truck.baseWeightKg,
  ]);

  // Update map tile theme dynamically without re-initializing the whole map
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileConfig = TILES[mapTheme];
    tileLayerRef.current.setUrl(tileConfig.url);

    // Also adjust casing line styling according to theme
    if (routeCasingRef.current) {
      routeCasingRef.current.setStyle({
        color: mapTheme === "dark" ? "#00E5FF" : "#1A365D",
        opacity: mapTheme === "dark" ? 0.35 : 0.25,
      });
    }
  }, [mapTheme]);

  // Smoothly update moving truck position on progress/speed/alert change
  useEffect(() => {
    if (!truckMarkerRef.current) return;
    truckMarkerRef.current.setLatLng(currentCoords);

    truckMarkerRef.current.setTooltipContent(
      `<strong>${truck.plate} (${truck.id})</strong><br/>Speed: ${speed} km/h · Load: ${weight.toLocaleString("en-IN")} kg · Progress: ${Math.round(progress * 100)}%`,
    );
  }, [currentCoords, truck.plate, truck.id, speed, weight, progress]);

  // Handler to recenter route bounds
  const handleRecenter = () => {
    if (mapInstanceRef.current && routePolylineRef.current) {
      mapInstanceRef.current.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });
    }
  };

  // Re-fit and invalidate map sizing when toggling to/from fullView
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        if (routePolylineRef.current) {
          mapInstanceRef.current.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [fullView]);

  return (
    <div className="relative isolate z-0 flex flex-col rounded-2xl border border-border bg-card p-5 shadow-panel">
      {/* Top telemetry header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold text-foreground">{truck.route}</h3>
            <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs font-mono text-muted-foreground">
              {truck.plate}
            </span>
            <span className="rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
              GSM Telemetry
            </span>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-accent font-medium">
              <Radio className="size-3 animate-pulse" /> GSM Telemetry Uplink
            </span>
            <span>·</span>
            <span>{truck.corridor}</span>
            <span>·</span>
            <span>{truck.model}</span>
          </p>
        </div>

        {/* Speed, Progress & Re-center */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-midnight px-3 py-1.5 text-xs">
            <Gauge className="size-3.5 text-accent" />
            <div>
              <span className="text-muted-foreground">Speed </span>
              <strong className="font-mono text-foreground">{speed} km/h</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-midnight px-3 py-1.5 text-xs">
            <Navigation className="size-3.5 text-primary" />
            <div>
              <span className="text-muted-foreground">Progress </span>
              <strong className="font-mono text-foreground">{Math.round(progress * 100)}%</strong>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRecenter}
            className="h-8 gap-1.5 text-xs hover:bg-accent/10 hover:text-accent hover:border-accent/40"
            title="Recenter route on map"
          >
            <RotateCcw className="size-3.5" />
            Recenter
          </Button>
        </div>
      </div>

      {/* Map Viewport — Scoped with isolate and z-0 so it never renders over sticky headers */}
      <div
        className={`relative isolate z-0 mt-4 w-full overflow-hidden rounded-xl border border-border shadow-inner transition-all duration-300 ${
          fullView ? "h-[calc(100vh-210px)] min-h-[620px]" : "h-[380px]"
        }`}
      >
        {/* Layer style switcher overlay (Street View vs Dark Route vs Satellite) */}
        <div className="absolute top-3 left-3 z-20 flex items-center rounded-xl border border-slate-700/80 bg-slate-950/90 p-1 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={() => setMapTheme("streets")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              mapTheme === "streets"
                ? "bg-primary text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="size-3" />
            Street View
          </button>
          <button
            type="button"
            onClick={() => setMapTheme("dark")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              mapTheme === "dark"
                ? "bg-primary text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="size-3" />
            Dark Route
          </button>
          <button
            type="button"
            onClick={() => setMapTheme("satellite")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              mapTheme === "satellite"
                ? "bg-primary text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="size-3" />
            Aerial
          </button>
        </div>

        {/* Immobilization Warning Ribbon */}
        {isFuelCut && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-xl border border-destructive bg-destructive/90 px-4 py-2 text-xs font-bold text-white shadow-xl backdrop-blur animate-pulse">
            <PowerOff className="size-4" />
            <span>VEHICLE IMMOBILIZED · FUEL PIPE SOLENOID VALVE CLOSED</span>
          </div>
        )}

        {/* Highway Corridor Tag Overlay */}
        <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/90 px-3 py-1.5 text-xs text-slate-200 shadow-lg backdrop-blur">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Live Highway Feed:</span>
          <span>{startPoint.label.replace("Origin: ", "")}</span>
          <span className="text-slate-500">→</span>
          <span className="text-white font-medium">
            {endPoint.label.replace("Destination: ", "")}
          </span>
        </div>

        {/* Fallback skeleton while Leaflet initializes */}
        {!isMapReady && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-midnight text-muted-foreground">
            <Radio className="size-8 text-accent animate-pulse mb-2" />
            <p className="text-sm font-medium text-foreground">
              Loading Highway Corridor & GSM Telemetry...
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Plotting Indian highway corridor waypoints
            </p>
          </div>
        )}

        {/* Leaflet map container div */}
        <div ref={mapContainerRef} className="h-full w-full bg-slate-900" />
      </div>

      {/* Route Waypoint Legend Strip */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-t border-border/50 pt-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="flex size-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
              A
            </span>
            <span className="text-foreground font-medium">{startPoint.label}</span>
          </div>

          <span className="text-slate-500">→</span>

          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-400 border border-white" />
            <span>{geoWaypoints.length - 2} Toll & Ghat Waypoints</span>
          </div>

          <span className="text-slate-500">→</span>

          <div className="flex items-center gap-1.5">
            <span className="flex size-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
              B
            </span>
            <span className="text-foreground font-medium">{endPoint.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-saffron">
            <span className="size-1.5 rounded-full bg-saffron" />
            Highlighted Highway Corridor
          </span>
          <span className="text-muted-foreground">Last ping: {lastUpdate}</span>
        </div>
      </div>
    </div>
  );
}
