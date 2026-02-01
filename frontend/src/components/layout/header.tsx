"use client";

import { Bell, Menu, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg px-4 sm:gap-x-6 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
                type="button"
                className="lg:hidden -m-2.5 p-2.5 text-slate-700 dark:text-slate-300"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 lg:hidden" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                {/* Search */}
                <div className="relative flex flex-1 items-center max-w-md">
                    <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                    <input
                        type="search"
                        placeholder="Search customers, workflows..."
                        className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white dark:placeholder:text-slate-400"
                    />
                </div>

                {/* Right side */}
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    {/* Notifications */}
                    <button
                        type="button"
                        className="relative -m-2.5 p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                    </button>

                    {/* Separator */}
                    <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200 dark:lg:bg-slate-700" />

                    {/* Profile */}
                    <div className="flex items-center gap-x-3">
                        <div className="hidden lg:block text-right">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                John Doe
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Admin
                            </p>
                        </div>
                        <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                        >
                            <User className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
