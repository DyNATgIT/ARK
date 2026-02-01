"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
    CheckCircle2,
    Circle,
    Clock,
    AlertCircle,
    Play,
    Pause,
    ChevronLeft,
    MoreVertical,
    Activity,
    MessageSquare,
    Zap,
    ArrowLeft, // Retained as it's used in the JSX
    FileText, // Retained as it's used in the phases array
    UserCheck, // Retained as it's used in the phases array
    Database, // Retained as it's used in the phases array
    Monitor, // Retained as it's used in the phases array
    Bell // Retained as it's used in the phases array
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
        const interval = setInterval(fetchWorkflow, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (!workflow) {
        return (
            <div className="flex h-96 flex-col items-center justify-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h2 className="text-xl font-semibold">Workflow not found</h2>
                <Button onClick={() => router.push("/onboarding")}>Back to List</Button>
            </div>
        );
    }

    // Mock data for phases and logs, will be replaced by workflow.phases and workflow.logs
    // if the fetched workflow object contains them.
    const phases = workflow.phases || [
        { id: "intake", title: "Customer Intake", icon: FileText, status: "completed" },
        { id: "identity", title: "Identity Verification", icon: UserCheck, status: "completed" },
        { id: "legal", title: "Legal Documents", icon: FileText, status: "in_progress" },
        { id: "crm", title: "CRM Setup", icon: Database, status: "pending" },
        { id: "provisioning", title: "IT Provisioning", icon: Monitor, status: "pending" },
        { id: "notification", title: "Final Notifications", icon: Bell, status: "pending" },
    ];

    const logs = workflow.logs || [
        { time: "10:00 AM", agent: "System", message: "Workflow started for TechStart Inc" },
        { time: "10:05 AM", agent: "Identity Agent", message: "KYC verification initiated" },
        { time: "10:07 AM", agent: "Identity Agent", message: "KYC verified successfully. Confidence: 0.98" },
        { time: "10:10 AM", agent: "Legal Agent", message: "Service agreement generated from template" },
        { time: "10:11 AM", agent: "Legal Agent", message: "E-signature request sent to john@techstart.com" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/onboarding">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            Onboarding: TechStart Inc
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                In Progress
                            </Badge>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            Workflow ID: {id} • Started 2 hours ago
                        </p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline">Pause Workflow</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">Approve Next Step</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Timeline / Progress */}
                <Card className="md:col-span-2 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Workflow Timeline</CardTitle>
                        <CardDescription>Track the automated agent sequence</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-0 relative">
                            {phases.map((phase, index) => {
                                const Icon = phase.icon;
                                const isLast = index === phases.length - 1;

                                return (
                                    <div key={phase.id} className="flex group">
                                        <div className="flex flex-col items-center mr-4">
                                            <div className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-full border-2 z-10",
                                                phase.status === "completed" ? "bg-green-500 border-green-500 text-white" :
                                                    phase.status === "in_progress" ? "bg-white border-blue-500 text-blue-500 animate-pulse dark:bg-slate-900" :
                                                        "bg-white border-slate-200 text-slate-300 dark:bg-slate-900 dark:border-slate-800"
                                            )}>
                                                {phase.status === "completed" ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
                                            </div>
                                            {!isLast && (
                                                <div className={cn(
                                                    "w-0.5 h-12",
                                                    phase.status === "completed" ? "bg-green-500" : "bg-slate-200 dark:bg-slate-800"
                                                )} />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-10">
                                            <div className="flex items-center justify-between">
                                                <h4 className={cn(
                                                    "font-semibold text-lg",
                                                    phase.status === "pending" ? "text-slate-400" : "text-slate-900 dark:text-white"
                                                )}>
                                                    {phase.title}
                                                </h4>
                                                {phase.status === "in_progress" && (
                                                    <span className="text-xs font-medium text-blue-500 uppercase tracking-wider">Active</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {phase.status === "completed" ? "Task executed successfully" :
                                                    phase.status === "in_progress" ? "Agent is currently processing this stage" :
                                                        "Awaiting previous steps"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Agent Activity Feed */}
                <div className="space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Agent Logs</CardTitle>
                            <CardDescription>Live telemetry from active agents</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex space-x-3 text-sm border-l-2 border-slate-100 dark:border-slate-800 pl-4 py-1">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-slate-900 dark:text-white">{log.agent}</span>
                                                <span className="text-xs text-slate-400">{log.time}</span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400">{log.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 text-white border-none shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg">AI Insight</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-400 leading-relaxed italic">
                                "The Legal Agent has detected that the customer's jurisdiction requires a specific amendment to the Data Processing Addendum. I've automatically added this to the generated contract."
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-blue-400 font-medium pb-2 border-b border-slate-800">
                                <AlertCircle className="h-3 w-3" />
                                <span>No action required from user</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
