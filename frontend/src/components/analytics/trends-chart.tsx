"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { TrendData } from "@/lib/use-analytics";

interface TrendsChartProps {
  trends: TrendData | null;
  isLoading: boolean;
}

export function TrendsChart({ trends, isLoading }: TrendsChartProps) {
  const data = trends?.trends || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-slate-300">{payload[0].payload.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Workflow Trends</CardTitle>
          <CardDescription>
            Daily workflow metrics over the last {trends?.period_days} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 bg-slate-700 rounded animate-pulse" />
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                  tick={{ fill: "#94a3b8" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total_workflows"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Total Workflows"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                  name="Completed"
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorFailed)"
                  name="Failed"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-400">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface SuccessRateTrendProps {
  trends: TrendData | null;
  isLoading: boolean;
}

export function SuccessRateTrend({ trends, isLoading }: SuccessRateTrendProps) {
  const data = trends?.trends || [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-slate-300">{payload[0].payload.date}</p>
          <p style={{ color: payload[0].color }} className="text-sm font-semibold">
            Success Rate: {payload[0].value}%
          </p>
          <p style={{ color: payload[1].color }} className="text-sm">
            Failure Rate: {payload[1].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Success vs Failure Rates</CardTitle>
          <CardDescription>
            Success and failure rate trends over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 bg-slate-700 rounded animate-pulse" />
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                  tick={{ fill: "#94a3b8" }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="success_rate"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Success Rate (%)"
                />
                <Line
                  type="monotone"
                  dataKey="failure_rate"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Failure Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-400">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
