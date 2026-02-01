"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronLeft,
    Activity,
    Zap,
    ArrowLeft,
    FileText,
    UserCheck,
    Database,
    Monitor,
    Bell,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function WorkflowDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [workflow, setWorkflow] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWorkflow = async () => {
            try {
                const response = await axios.get(`/api/v1/onboarding/${id}`);
                if (response.data?.data) {
                    setWorkflow(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch workflow details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkflow();
        const interval = setInterval(fetchWorkflow, 5000);
        return () => clearInterval(interval);
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <div className="relative">
                    <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary/10 border-t-primary" />
                    <div className="absolute inset-0 h-20 w-20 animate-pulse rounded-full bg-primary/20 blur-2xl" />
                </div>
            </div>
        );
    }

    if (!workflow) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-6">
                <div className="p-4 rounded-3xl bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <h2 className="text-3xl font-black text-white">Logic Protocol Not Found</h2>
                <Button onClick={() => router.push("/dashboard/onboarding")} className="rounded-2xl bg-white text-black font-bold px-8 py-6">Re-link Dashboard</Button>
            </div>
        );
    }

    // Map dynamic steps to phases
    const defaultPhases = [
        { id: "intake", title: "Customer Intake", icon: FileText, desc: "Data ingestion and mapping." },
        { id: "identity_verification", title: "Identity Warden", icon: UserCheck, desc: "Biometric and KYC vetting." },
        { id: "legal_documents", title: "Legal Counsel", icon: FileText, desc: "Synthesis and compliance." },
        { id: "crm_setup", title: "CRM Orchestration", icon: Database, desc: "Enterprise entity sync." },
        { id: "provisioning", title: "IT Environment", icon: Monitor, desc: "Stack access control." },
        { id: "notification", title: "Protocol Exit", icon: Bell, desc: "Completion broadcast." }
    ];

    const phases = defaultPhases.map(p => {
        const step = (workflow.steps || []).find((s: any) => s.step_name === p.id);
        return {
            ...p,
            status: step ? step.status : "pending"
        };
    });

    const logs = (workflow.steps || [])
        .filter((s: any) => s.status === "completed" || s.status === "running")
        .map((s: any) => ({
            t: new Date(s.completed_at || s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            a: s.step_name.split('_')[0].toUpperCase(),
            m: s.status === "completed" ? `Successfully executed ${s.step_name} protocol.` : `Active execution in progress...`,
            s: s.status === "completed" ? "success" : "neutral"
        })).reverse();

    const currentStepIndex = phases.findIndex(p => p.status === "in_progress" || p.status === "running") + 1 || (workflow.completed_steps || 0) + 1;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 max-w-7xl mx-auto"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-start space-x-6">
                    <Link href="/dashboard/onboarding">
                        <Button variant="ghost" className="rounded-2xl glass hover:bg-white/10 p-3 h-14 w-14 group">
                            <ArrowLeft className="h-6 w-6 text-white group-hover:-translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <h2 className="text-5xl font-black tracking-tight text-white uppercase leading-none">
                                {workflow.customer_name || "Protocol Active"}
                            </h2>
                            <Badge className="bg-primary/20 text-primary border-primary/20 px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest animate-pulse">
                                {workflow.status === 'completed' ? 'Protocol Finalized' : `Executing Phase ${currentStepIndex}`}
                            </Badge>
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                            System ID: <span className="text-white/40 font-mono">{id}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                            {workflow.status.replace('_', ' ')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" className="rounded-2xl glass hover:bg-white/5 font-bold h-14 px-8 text-white">Manual Pause</Button>
                    <Button className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold h-14 px-8 shadow-2xl shadow-primary/20">Authorize Override</Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Protocol Timeline */}
                <Card className="lg:col-span-2 glass-premium border-white/5 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-10 border-b border-white/5 bg-white/[0.02]">
                        <CardTitle className="text-2xl font-black text-white uppercase tracking-tighter">Workflow Runtime</CardTitle>
                        <CardDescription className="text-slate-500 font-medium tracking-tight">Real-time status of the automated agent sequence.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="space-y-0 relative">
                            {phases.map((phase, index) => {
                                const Icon = phase.icon;
                                const isLast = index === phases.length - 1;

                                return (
                                    <div key={phase.id} className="flex group">
                                        <div className="flex flex-col items-center mr-8">
                                            <div className={cn(
                                                "relative flex h-14 w-14 items-center justify-center rounded-[1.25rem] border-2 transition-all duration-500 z-10",
                                                phase.status === "completed" ? "bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" :
                                                    phase.status === "in_progress" ? "bg-primary border-primary text-white shadow-[0_0_30px_rgba(110,89,255,0.4)] scale-110" :
                                                        "bg-white/[0.02] border-white/5 text-slate-700"
                                            )}>
                                                {phase.status === "completed" ? <CheckCircle2 className="h-8 w-8 stroke-[3px]" /> : <Icon className="h-6 w-6 stroke-[2px]" />}
                                                {phase.status === "in_progress" && (
                                                    <div className="absolute inset-[-4px] rounded-[1.5rem] border-2 border-primary/30 animate-ping" />
                                                )}
                                            </div>
                                            {!isLast && (
                                                <div className={cn(
                                                    "w-1 h-14 my-2 transition-all duration-700 rounded-full",
                                                    phase.status === "completed" ? "bg-gradient-to-b from-emerald-500 to-primary" : "bg-white/5"
                                                )} />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-14 pt-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className={cn(
                                                    "font-black text-xl tracking-tight uppercase transition-colors",
                                                    phase.status === "pending" ? "text-slate-700" : "text-white"
                                                )}>
                                                    {phase.title}
                                                </h4>
                                                {phase.status === "in_progress" && (
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Current Vector</span>
                                                )}
                                            </div>
                                            <p className="text-slate-500 font-medium leading-relaxed italic">
                                                {phase.status === "completed" ? "Protocol synthesis finalized." :
                                                    phase.status === "in_progress" ? "Active agent executing sequence." :
                                                        "Awaiting preceding logic vector."}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Lateral Intel Feed */}
                <div className="space-y-10">
                    <Card className="glass-premium border-white/5 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02] flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-lg font-black text-white uppercase tracking-tighter">Agent Telemetry</CardTitle>
                                <CardDescription className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Stream</CardDescription>
                            </div>
                            <Activity className="w-5 h-5 text-primary animate-pulse" />
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {logs.length > 0 ? logs.map((log: any, i: number) => (
                                    <div key={i} className="group relative flex flex-col space-y-2 border-l-2 border-white/5 pl-6 py-1">
                                        <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-[10px] text-primary uppercase tracking-widest">{log.a}</span>
                                            <span className="text-[10px] font-mono text-slate-700">{log.t}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium tracking-tight leading-relaxed">{log.m}</p>
                                    </div>
                                )) : (
                                    <div className="text-center py-10">
                                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No telemetry captured</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] bg-gradient-to-br from-primary to-accent p-1 shadow-[0_20px_60px_-15px_rgba(110,89,255,0.4)]">
                        <div className="bg-neutral-950 rounded-[2.3rem] p-8 h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <Zap className="w-5 h-5 text-primary fill-primary" />
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none pt-1">AI Synthesis</h3>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium mb-6">
                                {workflow.status === 'completed'
                                    ? "Orchestration sequence finalized. All agents report successful synchronization. System transition to production status recommended."
                                    : "Autonomous agents are currently synthesizing jurisdictional requirements and security protocols. Self-correction logic active."}
                            </p>
                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Auto-Correction Active</span>
                                <ExternalLink className="w-3 h-3 text-primary cursor-pointer hover:scale-110 transition-transform" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}
