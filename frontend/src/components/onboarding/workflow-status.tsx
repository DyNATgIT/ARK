"use client";

import {
    CheckCircle2,
    Circle,
    Clock,
    XCircle,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStatusProps {
    status: string;
    className?: string;
    showLabel?: boolean;
}

export function WorkflowStatus({
    status,
    className,
    showLabel = true
}: WorkflowStatusProps) {
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return {
                    icon: CheckCircle2,
                    color: "text-emerald-500",
                    bg: "bg-emerald-50 dark:bg-emerald-900/10",
                    border: "border-emerald-200 dark:border-emerald-800",
                    label: "Completed"
                };
            case "in_progress":
                return {
                    icon: Clock,
                    color: "text-blue-500",
                    bg: "bg-blue-50 dark:bg-blue-900/10",
                    border: "border-blue-200 dark:border-blue-800",
                    label: "In Progress"
                };
            case "failed":
                return {
                    icon: XCircle,
                    color: "text-red-500",
                    bg: "bg-red-50 dark:bg-red-900/10",
                    border: "border-red-200 dark:border-red-800",
                    label: "Failed"
                };
            case "awaiting_approval":
                return {
                    icon: AlertCircle,
                    color: "text-orange-500",
                    bg: "bg-orange-50 dark:bg-orange-900/10",
                    border: "border-orange-200 dark:border-orange-800",
                    label: "Needs Approval"
                };
            default:
                return {
                    icon: Circle,
                    color: "text-slate-400",
                    bg: "bg-slate-50 dark:bg-slate-900/10",
                    border: "border-slate-200 dark:border-slate-800",
                    label: "Pending"
                };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 border",
            config.bg,
            config.border,
            className
        )}>
            <Icon className={cn("w-3.5 h-3.5", config.color)} />
            {showLabel && (
                <span className={cn("text-xs font-medium", config.color)}>
                    {config.label}
                </span>
            )}
        </div>
    );
}
