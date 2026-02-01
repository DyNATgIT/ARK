"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { WorkflowStatusData, WorkflowTypeData } from "@/lib/use-analytics";

interface StatusBreakdownProps {
  statusData: WorkflowStatusData | null;
  isLoading: boolean;
}

export function StatusBreakdown({ statusData, isLoading }: StatusBreakdownProps) {
  const data = statusData?.breakdown || [];
  
  const COLORS = {
    completed: "#10b981",
    failed: "#ef4444",
    in_progress: "#3b82f6",
    pending_approval: "#f59e0b",
    blocked: "#8b5cf6",
  };

  const getColor = (status: string) => {
    return COLORS[status as keyof typeof COLORS] || "#94a3b8";
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-slate-300 capitalize">
            {payload[0].payload.status}
          </p>
          <p className="text-sm text-slate-400">Count: {payload[0].value}</p>
          <p className="text-sm text-slate-400">
            {payload[0].payload.percentage}%
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
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Workflow Status Distribution</CardTitle>
          <CardDescription>
            Breakdown of workflows by current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 bg-slate-700 rounded animate-pulse" />
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
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

interface TypeBreakdownProps {
  typeData: WorkflowTypeData | null;
  isLoading: boolean;
}

export function TypeBreakdown({ typeData, isLoading }: TypeBreakdownProps) {
  const data = typeData?.breakdown || [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-slate-300">
            {payload[0].payload.workflow_type}
          </p>
          <p className="text-sm text-slate-400">Count: {payload[0].value}</p>
          <p className="text-sm text-slate-400">
            Avg Duration: {payload[0].payload.avg_duration_minutes}m
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
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Workflow Types Breakdown</CardTitle>
          <CardDescription>
            Distribution of workflows by type and average duration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 bg-slate-700 rounded animate-pulse" />
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="workflow_type"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                  tick={{ fill: "#94a3b8" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                  tick={{ fill: "#94a3b8" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3b82f6" name="Count" radius={[8, 8, 0, 0]} />
              </BarChart>
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
