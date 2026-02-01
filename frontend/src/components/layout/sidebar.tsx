"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Bot,
    FileText,
    Home,
    Layers,
    Link2,
    Settings,
    Users,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Onboarding", href: "/dashboard/onboarding", icon: Zap },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Workflows", href: "/dashboard/workflows", icon: Layers },
    { name: "Agents", href: "/dashboard/agents", icon: Bot },
    { name: "Documents", href: "/dashboard/documents", icon: FileText },
    { name: "Integrations", href: "/dashboard/integrations", icon: Link2 },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

const secondaryNavigation = [
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 lg:flex flex-col">
            <div className="flex h-full flex-col gap-y-5 overflow-y-auto bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 px-6 pb-4">
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center">
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                            OnboardFlow
                        </span>
                    </Link>
                </div>

                {/* Main Navigation */}
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="-mx-2 space-y-1">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href ||
                                        (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "group flex gap-x-3 rounded-lg p-2 text-sm font-medium transition-all",
                                                    isActive
                                                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                )}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        "h-5 w-5 shrink-0 transition-colors",
                                                        isActive
                                                            ? "text-blue-600 dark:text-blue-400"
                                                            : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                                    )}
                                                />
                                                {item.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>

                        {/* Secondary Navigation */}
                        <li className="mt-auto">
                            <ul role="list" className="-mx-2 space-y-1">
                                {secondaryNavigation.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="group flex gap-x-3 rounded-lg p-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                        >
                                            <item.icon className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
}
