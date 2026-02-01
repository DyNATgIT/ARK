"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Plus, Search, Filter, MoreHorizontal, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusColor } from "@/lib/utils";
import { motion } from "framer-motion";

export default function OnboardingPage() {
    const [onboardingData, setOnboardingData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOnboardings = async () => {
            try {
                const response = await axios.get("/api/v1/onboarding");
                if (response.data?.items) {
                    setOnboardingData(response.data.items);
                }
            } catch (error) {
                console.error("Failed to fetch onboardings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOnboardings();
        const interval = setInterval(fetchOnboardings, 10000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                    <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-primary/10 blur-xl" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 max-w-[1600px] mx-auto"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-white mb-2 uppercase">
                        Onboarding <span className="text-primary font-light">Workflows</span>
                    </h2>
                    <p className="text-slate-500 font-medium">
                        Autonomous orchestration pipeline for customer success.
                    </p>
                </div>
                <Link href="/dashboard/onboarding/new">
                    <Button className="px-8 py-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Plus className="mr-2 h-5 w-5 stroke-[3px]" />
                        Launch New Pipeline
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="glass-premium border-white/5 overflow-hidden rounded-[2rem]">
                    <CardHeader className="px-8 pt-8 pb-0 flex flex-row items-center justify-between border-b border-white/5 bg-white/5">
                        <div className="pb-6">
                            <CardTitle className="text-xl font-bold text-white tracking-tight">Active Pipelines</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2 pb-6">
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5">
                                <Search className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5">
                                <Filter className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-white/[0.02]">
                                        <th className="h-14 px-8 text-left align-middle font-semibold text-slate-500 uppercase tracking-widest text-[0.65rem]">Customer</th>
                                        <th className="h-14 px-8 text-left align-middle font-semibold text-slate-500 uppercase tracking-widest text-[0.65rem]">Logic Type</th>
                                        <th className="h-14 px-8 text-left align-middle font-semibold text-slate-500 uppercase tracking-widest text-[0.65rem]">State</th>
                                        <th className="h-14 px-8 text-left align-middle font-semibold text-slate-500 uppercase tracking-widest text-[0.65rem]">Flow Map</th>
                                        <th className="h-14 px-8 text-left align-middle font-semibold text-slate-500 uppercase tracking-widest text-[0.65rem]">Entry Pt</th>
                                        <th className="h-14 px-8 text-right align-middle font-semibold text-slate-500 uppercase tracking-widest text-[0.65rem]">Control</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {onboardingData.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-white/5 transition-colors hover:bg-white/[0.03] group"
                                        >
                                            <td className="p-8 align-middle">
                                                <div className="font-bold text-white group-hover:text-primary transition-colors">{item.customer_name || "Nexus Corp"}</div>
                                            </td>
                                            <td className="p-8 align-middle">
                                                <span className="text-slate-400 font-medium capitalize">{item.workflow_type.replace("_", " ")}</span>
                                            </td>
                                            <td className="p-8 align-middle">
                                                <span
                                                    className={`inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-tighter ${getStatusColor(
                                                        item.status
                                                    )}`}
                                                >
                                                    {item.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="p-8 align-middle">
                                                <div className="w-40">
                                                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${item.progress_percentage}%` }}
                                                            className="h-full bg-gradient-to-r from-primary to-accent"
                                                        />
                                                    </div>
                                                    <span className="mt-2 block text-[10px] font-black text-slate-500 uppercase">
                                                        {item.progress_percentage}% Coverage
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-8 align-middle">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-xs text-slate-400 font-medium">{item.current_step || "Init Logic"}</span>
                                                </div>
                                            </td>
                                            <td className="p-8 align-middle text-right">
                                                <Link href={`/dashboard/onboarding/${item.id}`}>
                                                    <Button variant="ghost" size="sm" className="rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white font-bold group/btn">
                                                        View Protocol
                                                        <ArrowUpRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}
