"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { AnalyticsSummary } from "@/lib/use-analytics";

interface KPICardsProps {
  summary: AnalyticsSummary | null;
  isLoading: boolean;
}

export function KPICards({ summary, isLoading }: KPICardsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const kpiData = [
    {
      title: "Total Workflows",
      value: summary?.total_workflows ?? 0,
      icon: Zap,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Success Rate",
      value: `${summary?.success_rate?.toFixed(1) ?? 0}%`,
      icon: CheckCircle2,
      color: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600",
      trend: "+2.3%",
      trendUp: true,
    },
    {
      title: "Failure Rate",
      value: `${summary?.failure_rate?.toFixed(1) ?? 0}%`,
      icon: AlertCircle,
      color: "from-red-500 to-red-600",
      textColor: "text-red-600",
      trend: "-1.2%",
      trendUp: false,
    },
    {
      title: "Avg Duration",
      value: `${summary?.avg_completion_minutes?.toFixed(0) ?? 0}m`,
      icon: Clock,
      color: "from-amber-500 to-amber-600",
      textColor: "text-amber-600",
      trend: "-5m",
      trendUp: false,
    },
    {
      title: "In Progress",
      value: summary?.in_progress_workflows ?? 0,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      trend: "+3",
      trendUp: true,
    },
    {
      title: "Customers",
      value: summary?.total_customers_onboarded ?? 0,
      icon: Users,
      color: "from-pink-500 to-pink-600",
      textColor: "text-pink-600",
      trend: "+8",
      trendUp: true,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
    >
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        const isLoading_ = isLoading;

        return (
          <motion.div key={index} variants={item}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-5`} />
              <CardHeader className="pb-2 relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    {kpi.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.color} bg-opacity-20`}>
                    <Icon className={`w-4 h-4 ${kpi.textColor}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                {isLoading_ ? (
                  <div className="h-8 bg-slate-700 rounded animate-pulse" />
                ) : (
                  <>
                    <div className={`text-2xl font-bold ${kpi.textColor}`}>
                      {kpi.value}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {kpi.trendUp ? (
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-blue-500" />
                      )}
                      <span className="text-xs text-slate-400">
                        {kpi.trend} from last period
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
