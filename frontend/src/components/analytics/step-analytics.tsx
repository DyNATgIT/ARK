"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, AlertCircle, Clock } from "lucide-react";
import type { StepAnalyticsData } from "@/lib/use-analytics";

interface StepAnalyticsProps {
  stepAnalytics: StepAnalyticsData | null;
  isLoading: boolean;
}

export function StepAnalyticsTable({ stepAnalytics, isLoading }: StepAnalyticsProps) {
  const steps = stepAnalytics?.steps || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.6 }}
    >
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Workflow Step Performance</CardTitle>
          <CardDescription>
            Detailed metrics for each workflow step
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          ) : steps.length > 0 ? (
            <div className="space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {step.success_rate >= 95 ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : step.success_rate >= 80 ? (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-100 truncate">
                          {step.step_name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {step.total_executions} executions
                        </p>
                      </div>

                      <div className="flex gap-6 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-emerald-400">
                            {step.successful_executions}
                          </div>
                          <div className="text-xs text-slate-400">Successful</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold text-red-400">
                            {step.failed_executions}
                          </div>
                          <div className="text-xs text-slate-400">Failed</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold text-blue-400">
                            {step.success_rate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-slate-400">Success Rate</div>
                        </div>

                        <div className="text-right min-w-max">
                          <div className="flex items-center gap-1 text-sm font-semibold text-slate-300">
                            <Clock className="w-3 h-3" />
                            {step.avg_duration_minutes.toFixed(1)}m
                          </div>
                          <div className="text-xs text-slate-400">Avg Duration</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${step.success_rate}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400">
              No step data available
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
