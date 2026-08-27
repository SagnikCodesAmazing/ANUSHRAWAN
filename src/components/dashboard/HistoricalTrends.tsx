import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Truck } from "@/lib/fleet-data";
import { seedDailyTrend, WEEKLY_ALERTS } from "@/lib/fleet-data";

interface HistoricalTrendsProps {
  truck: Truck;
  range: string;
}

export function HistoricalTrends({ truck, range }: HistoricalTrendsProps) {
  const dailyData = useMemo(() => seedDailyTrend(truck), [truck]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* 24h Load Stability Trend */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-panel">
        <div className="border-b border-border pb-3">
          <h3 className="font-display text-base font-semibold text-foreground">
            Load Stability Over Time (
            {range === "last-24h" ? "24h" : range === "last-7d" ? "7 Days" : "30 Days"})
          </h3>
          <p className="text-xs text-muted-foreground">
            Hourly sensor readings vs calibrated theft threshold for {truck.id}
          </p>
        </div>

        <div className="mt-4 h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E5AA8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1E5AA8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                stroke="#727a8c"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                stroke="#727a8c"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}t`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0D1B2A",
                  borderColor: "rgba(255,255,255,0.15)",
                  borderRadius: "0.5rem",
                  color: "#F1F3F5",
                  fontSize: "12px",
                }}
                formatter={(v: number) => [`${v.toLocaleString("en-IN")} kg`, "Weight"]}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#1E5AA8"
                strokeWidth={2}
                fill="url(#trendGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fleet Alert History */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-panel">
        <div className="border-b border-border pb-3">
          <h3 className="font-display text-base font-semibold text-foreground">
            Weekly Fleet Theft Incident Breakdown
          </h3>
          <p className="text-xs text-muted-foreground">
            Reported cargo drop triggers versus resolved incidents
          </p>
        </div>

        <div className="mt-4 h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEKLY_ALERTS} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="#727a8c"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                stroke="#727a8c"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0D1B2A",
                  borderColor: "rgba(255,255,255,0.15)",
                  borderRadius: "0.5rem",
                  color: "#F1F3F5",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Bar
                dataKey="alerts"
                name="Incidents Triggered"
                fill="#FFB300"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="resolved"
                name="Resolved / Acknowledged"
                fill="#00E5FF"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
