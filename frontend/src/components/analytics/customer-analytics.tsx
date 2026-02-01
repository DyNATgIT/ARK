"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, CheckCircle, TrendingUp } from "lucide-react";
import type { CustomerAnalyticsData } from "@/lib/use-analytics";

interface CustomerAnalyticsProps {
  customerAnalytics: CustomerAnalyticsData | null;
  isLoading: boolean;
}

export function CustomerAnalyticsTable({ customerAnalytics, isLoading }: CustomerAnalyticsProps) {
  const customers = customerAnalytics?.customers || [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.7 }}
    >
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Top Customers by Workflows</CardTitle>
          <CardDescription>
            Customers with the highest onboarding activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          ) : customers.length > 0 ? (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-slate-400 border-b border-slate-700">
                <div className="col-span-4">Company</div>
                <div className="col-span-2 text-right">Workflows</div>
                <div className="col-span-2 text-right">Completed</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-right">Avg Time</div>
              </div>

              {/* Rows */}
              {customers.map((customer, index) => (
                <motion.div
                  key={customer.customer_id}
                  variants={item}
                  className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700/50 transition-colors border border-slate-700"
                >
                  <div className="col-span-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-100 truncate">
                        {customer.company_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{customer.customer_id}</p>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-end">
                    <span className="text-sm font-semibold text-slate-200">
                      {customer.workflow_count}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-emerald-400">
                      {customer.completed_count}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-400">
                        {customer.completion_rate.toFixed(1)}%
                      </p>
                      <div className="w-12 h-1 bg-slate-600 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                          style={{ width: `${Math.min(customer.completion_rate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-end">
                    <span className="text-sm font-semibold text-slate-300">
                      {customer.avg_completion_minutes.toFixed(0)}m
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400">
              No customer data available
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
