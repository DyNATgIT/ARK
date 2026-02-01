"use client";

import { Plus, Search, Filter, MoreHorizontal, User, Building2, Mail, Globe, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";

const customersData = [
    { id: "1", name: "John Smith", company: "TechStart Inc", email: "john@techstart.io", status: "active", type: "Business" },
    { id: "2", name: "Sarah Johnson", company: "Global Dynamics", email: "s.johnson@gd.com", status: "onboarding", type: "Enterprise" },
    { id: "3", name: "Mike Brown", company: "Small Biz LLC", email: "mike@smallbiz.com", status: "active", type: "Business" },
    { id: "4", name: "Emily Davis", company: "Future Systems", email: "e.davis@futuresys.com", status: "churned", type: "Enterprise" },
];

export default function CustomersPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 max-w-[1600px] mx-auto"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-white mb-2 uppercase italic">
                        Customer <span className="text-primary font-light not-italic">Registry</span>
                    </h2>
                    <p className="text-slate-500 font-medium font-outfit uppercase tracking-widest text-[10px]">
                        Enterprise Entity Database | Unified Identity System
                    </p>
                </div>
                <Button className="px-8 py-6 rounded-2xl bg-white text-black font-bold shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Plus className="mr-2 h-5 w-5 stroke-[3px]" />
                    Register New Entity
                </Button>
            </div>

            <Card className="glass-premium border-white/5 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-10 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-2xl font-black text-white uppercase tracking-tighter">All Entities</CardTitle>
                            <CardDescription className="text-slate-500">Managing {customersData.length} records across 4 clusters.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                            <input
                                placeholder="Filter by Name, ID, or Cluster..."
                                className="h-14 w-full rounded-2xl glass border-white/5 bg-white/[0.03] pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-white/[0.01]">
                                    <th className="h-14 px-10 text-left align-middle font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Entity Profile</th>
                                    <th className="h-14 px-10 text-left align-middle font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Organization</th>
                                    <th className="h-14 px-10 text-left align-middle font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Communication</th>
                                    <th className="h-14 px-10 text-left align-middle font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Tier</th>
                                    <th className="h-14 px-10 text-left align-middle font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">State</th>
                                    <th className="h-14 px-10 text-right align-middle font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Operation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customersData.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="border-b border-white/5 transition-colors hover:bg-white/[0.03] group/row"
                                    >
                                        <td className="p-10 align-middle">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-primary group-hover/row:scale-110 transition-transform">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-white text-lg tracking-tight">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-10 align-middle">
                                            <div className="flex items-center space-x-2 text-slate-400">
                                                <Building2 className="w-4 h-4" />
                                                <span className="font-medium">{customer.company}</span>
                                            </div>
                                        </td>
                                        <td className="p-10 align-middle">
                                            <div className="flex items-center space-x-2 text-slate-500 group-hover/row:text-slate-300 transition-colors">
                                                <Mail className="w-4 h-4" />
                                                <span className="font-medium text-xs">{customer.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-10 align-middle">
                                            <span className="px-3 py-1 rounded-lg border border-white/5 bg-white/5 text-slate-400 font-black text-[9px] uppercase tracking-widest">
                                                {customer.type}
                                            </span>
                                        </td>
                                        <td className="p-10 align-middle">
                                            <div className="flex items-center space-x-2">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    customer.status === "active" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                                                        customer.status === "onboarding" ? "bg-primary animate-pulse shadow-[0_0_10px_rgba(110,89,255,0.5)]" : "bg-slate-700"
                                                )} />
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-tighter",
                                                    customer.status === "active" ? "text-emerald-500" :
                                                        customer.status === "onboarding" ? "text-primary" : "text-slate-500"
                                                )}>
                                                    {customer.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-10 align-middle text-right">
                                            <Button variant="ghost" size="icon" className="rounded-xl glass hover:bg-white/10 text-white group/btn">
                                                <ArrowUpRight className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}
