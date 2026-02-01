"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAnalytics } from "@/lib/use-analytics";
import { KPICards } from "@/components/analytics/kpi-cards";
import { TrendsChart, SuccessRateTrend } from "@/components/analytics/trends-chart";
import { StatusBreakdown, TypeBreakdown } from "@/components/analytics/breakdown-charts";
import { StepAnalyticsTable } from "@/components/analytics/step-analytics";
import { CustomerAnalyticsTable } from "@/components/analytics/customer-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Calendar } from "lucide-react";

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(30);
  const { summary, trends, statusBreakdown, typeBreakdown, stepAnalytics, customerAnalytics, isLoading, error, refetch } = useAnalytics(days);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const pageTitle = {
    hidden: { opacity: 0, y: -20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900">
      {/* Header Section */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="sticky top-0 z-40 backdrop-blur-xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border-b border-slate-700/50 px-6 py-4"
      >
        <motion.div variants={pageTitle} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Analytics Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time insights into your customer onboarding workflows
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <Select value={days.toString()} onValueChange={(val) => setDays(parseInt(val))}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="p-6 max-w-7xl mx-auto"
      >
        {error && (
          <Card className="mb-6 bg-red-950/20 border-red-700/50">
            <CardContent className="pt-6">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards Section */}
        <KPICards summary={summary} isLoading={isLoading} />

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TrendsChart trends={trends} isLoading={isLoading} />
          <SuccessRateTrend trends={trends} isLoading={isLoading} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <StatusBreakdown statusData={statusBreakdown} isLoading={isLoading} />
          <TypeBreakdown typeData={typeBreakdown} isLoading={isLoading} />
        </div>

        {/* Step Analytics */}
        <div className="mb-6">
          <StepAnalyticsTable stepAnalytics={stepAnalytics} isLoading={isLoading} />
        </div>

        {/* Customer Analytics */}
        <div className="mb-6">
          <CustomerAnalyticsTable
            customerAnalytics={customerAnalytics}
            isLoading={isLoading}
          />
        </div>

        {/* Footer Info */}
        {summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm text-slate-500 py-6"
          >
            Data generated at {new Date(summary.generated_at).toLocaleString()}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
