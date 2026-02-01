"use client";

import {
    BarChart3,
    CheckCircle2,
    Clock,
    Users,
    Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Dashboard
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Overview of your customer onboarding pipeline.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        title: "Total Active",
                        value: "12",
                        description: "+2 from last week",
                        icon: Zap,
                        color: "text-blue-500",
                    },
                    {
                        title: "Completed Today",
                        value: "4",
                        description: "+14% from average",
                        icon: CheckCircle2,
                        color: "text-emerald-500",
                    },
                    {
                        title: "Avg. Time",
                        value: "25m",
                        description: "-2m from last week",
                        icon: Clock,
                        color: "text-orange-500",
                    },
                    {
                        title: "Total Customers",
                        value: "1,234",
                        description: "+24 new this month",
                        icon: Users,
                        color: "text-purple-500",
                    },
                ].map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Workflows</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                            AC
                                        </span>
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            Acme Corp Onboarding
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            acme@example.com
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-emerald-600 dark:text-emerald-400 text-sm">
                                        Completed
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: "API Gateway", status: "Operational", color: "bg-emerald-500" },
                                { name: "Orchestrator Engine", status: "Operational", color: "bg-emerald-500" },
                                { name: "Database Cluster", status: "Operational", color: "bg-emerald-500" },
                                { name: "Redis Cache", status: "Operational", color: "bg-emerald-500" },
                                { name: "Agent Workers", status: "Degraded", color: "bg-yellow-500" },
                            ].map((service, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${service.color}`} />
                                        <span className="text-sm font-medium">{service.name}</span>
                                    </div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {service.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
