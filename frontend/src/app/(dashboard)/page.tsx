"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
    BarChart3,
    CheckCircle2,
    Clock,
    Users,
    Zap,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface OnboardingStats {
    total_workflows: number;
    active_workflows: number;
    completed_today: number;
    avg_completion_time_minutes: number;
    success_rate: number;
    pending_approvals: number;
}

interface WorkflowItem {
    id: string;
    customer_name: string;
    status: string;
    progress_percentage: number;
    created_at: string;
    workflow_type: string;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<OnboardingStats | null>(null);
    const [recentWorkflows, setRecentWorkflows] = useState<WorkflowItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, workflowsRes] = await Promise.all([
                    axios.get("/api/v1/onboarding/stats"),
                    axios.get("/api/v1/onboarding?page_size=5")
                ]);
                setStats(statsRes.data);
                setRecentWorkflows(workflowsRes.data.items);
            } catch (error) {
                console.error("Dashboard data sync failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const statCards = [
        {
            title: "Global Active",
            value: stats?.active_workflows ?? "0",
            desc: "Current live orchestrations",
            icon: Zap,
            color: "text-primary",
            trend: "+12.5%",
            up: true,
        },
        {
            title: "Success Velocity",
            value: `${stats?.success_rate.toFixed(1) ?? "0"}%`,
            desc: "Logical accuracy rating",
            icon: CheckCircle2,
            color: "text-emerald-500",
            trend: "+0.4%",
            up: true,
        },
        {
            title: "Protocol Latency",
            value: `${stats?.avg_completion_time_minutes ?? "0"}m`,
            desc: "Average sync duration",
            icon: Clock,
            color: "text-amber-500",
            trend: "-2m",
            up: false,
        },
        {
            title: "Pending Sync",
            value: stats?.pending_approvals ?? "0",
            desc: "Awaiting human-in-loop",
            icon: Activity,
            color: "text-rose-500",
            trend: "Critical",
            up: false,
        },
    ];

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">
                        Command <span className="text-primary not-italic">Center</span>
                    </h2>
                    <p className="text-slate-500 font-medium tracking-tight mt-2">
                        Real-time orchestration overview across the global agent cluster.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" className="rounded-2xl glass hover:bg-white/5 font-bold h-14 px-6 text-white border-white/5">
                        <Search className="w-5 h-5 mr-3 text-slate-500" />
                        Global Seek
                    </Button>
                    <Link href="/dashboard/onboarding/new">
                        <Button className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold h-14 px-8 shadow-2xl shadow-primary/20">
                            Initialize Protocol
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stat Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index}
                    >
                        <Card className="glass-premium border-white/5 rounded-[2rem] overflow-hidden group hover:bg-white/[0.04] transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-xl bg-white/[0.03] ${stat.color}`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black text-white tracking-tighter mb-1">
                                    {stat.value}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                                        stat.up ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                    )}>
                                        {stat.up ? <ArrowUpRight className="inline w-3 h-3 mr-0.5" /> : <ArrowDownRight className="inline w-3 h-3 mr-0.5" />}
                                        {stat.trend}
                                    </span>
                                    <p className="text-[10px] text-slate-700 font-bold uppercase tracking-tight">
                                        {stat.desc}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Feed */}
                <Card className="col-span-4 glass-premium border-white/5 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-10 border-b border-white/5 bg-white/[0.02] flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-white uppercase tracking-tighter italic">Recent Orchestrations</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">Capture of the last 5 state transitions.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="glass rounded-xl h-10 w-10">
                            <Filter className="w-4 h-4 text-slate-400" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="space-y-8">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center animate-pulse">
                                        <div className="h-12 w-12 rounded-2xl bg-white/5" />
                                        <div className="ml-6 flex-1 space-y-2">
                                            <div className="h-4 w-1/3 bg-white/5 rounded" />
                                            <div className="h-3 w-1/4 bg-white/5 rounded" />
                                        </div>
                                    </div>
                                ))
                            ) : recentWorkflows.length > 0 ? (
                                recentWorkflows.map((workflow) => (
                                    <Link key={workflow.id} href={`/dashboard/onboarding/${workflow.id}`}>
                                        <div className="flex items-center group cursor-pointer hover:bg-white/[0.02] p-4 -m-4 rounded-3xl transition-all mb-4 last:mb-0">
                                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/5 shadow-inner">
                                                <span className="text-lg font-black text-primary italic">
                                                    {(workflow.customer_name || "??")[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-6 space-y-1 flex-1">
                                                <p className="text-lg font-black text-white tracking-tight leading-none group-hover:text-primary transition-colors">
                                                    {workflow.customer_name || "Logical Entity"}
                                                </p>
                                                <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                                                    {workflow.workflow_type.replace('_', ' ')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className={cn(
                                                    "px-4 py-1.5 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] mb-2 inline-block",
                                                    workflow.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" :
                                                        workflow.status === 'failed' ? "bg-rose-500/10 text-rose-500" :
                                                            "bg-primary/10 text-primary animate-pulse"
                                                )}>
                                                    {workflow.status.replace('_', ' ')}
                                                </div>
                                                <p className="text-[10px] font-mono text-slate-700">
                                                    {new Date(workflow.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-slate-700 font-black uppercase tracking-widest text-sm">No active vectors found</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* System Stats */}
                <div className="col-span-3 space-y-8">
                    <Card className="glass-premium border-white/5 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-lg font-black text-white uppercase tracking-tighter italic text-center">Protocol Integrity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {[
                                    { name: "Logic Gateway", status: "Operational", color: "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" },
                                    { name: "Orchestration Cluster", status: "Operational", color: "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" },
                                    { name: "DB Synthesis Layer", status: "Operational", color: "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" },
                                    { name: "Memory Cache", status: "Operational", color: "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" },
                                    { name: "Autonomous Workers", status: "Nominal", color: "bg-primary shadow-[0_0_15px_rgba(110,89,255,0.4)]" },
                                ].map((service, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-2.5 h-2.5 rounded-full ${service.color} animate-pulse`} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pt-0.5">{service.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-white uppercase tracking-tighter bg-white/10 px-3 py-1 rounded-lg">
                                            {service.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Link href="/dashboard/onboarding/new" className="block">
                        <div className="rounded-[2.5rem] bg-gradient-to-br from-primary to-accent p-1 group hover:scale-[1.02] transition-all cursor-pointer shadow-[0_10px_40px_-10px_rgba(110,89,255,0.4)]">
                            <div className="bg-neutral-950 rounded-[2.3rem] p-8 h-full flex flex-col items-center justify-center text-center">
                                <div className="p-4 rounded-2xl bg-white/5 mb-4 group-hover:bg-primary/20 transition-colors">
                                    <Bot className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 italic">Launch Agent Orchestrator</h3>
                                <p className="text-xs text-slate-500 font-medium tracking-tight">Begin high-speed induction sequence for a new entity.</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Helper function for class names
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
