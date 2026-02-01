"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    ArrowRight,
    BarChart3,
    Bot,
    CheckCircle2,
    Clock,
    FileText,
    Shield,
    Users,
    Zap,
    ChevronRight,
    Sparkles,
} from "lucide-react";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut" as const,
        },
    },
};

export default function HomePage() {
    return (
        <div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/30">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animation-delay-2000 animate-pulse" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                                <Zap className="w-6 h-6 text-white fill-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white">OnboardFlow</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
                            <Link href="#agents" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Agents</Link>
                            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sign In</Link>
                            <Link
                                href="/dashboard"
                                className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-slate-200 transition-all shadow-xl"
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-44 pb-32 px-4 sm:px-6 lg:px-8 z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-7xl mx-auto"
                >
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-left">
                            <motion.div
                                variants={itemVariants}
                                className="inline-flex items-center px-4 py-2 rounded-full glass border-white/10 text-primary text-sm font-semibold mb-8"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Next-Gen Orchestration
                            </motion.div>
                            <motion.h1
                                variants={itemVariants}
                                className="text-6xl md:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tighter"
                            >
                                Onboarding <br />
                                <span className="text-gradient">Accelerated.</span>
                            </motion.h1>
                            <motion.p
                                variants={itemVariants}
                                className="text-xl text-slate-400 max-w-xl mb-12 leading-relaxed font-light"
                            >
                                Transform your customer lifecycle from weeks to seconds.
                                Specialized AI agents fully autonomous and perfectly orchestrated.
                            </motion.p>
                            <motion.div
                                variants={itemVariants}
                                className="flex flex-wrap gap-6"
                            >
                                <Link
                                    href="/dashboard/onboarding/new"
                                    className="group relative inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(110,89,255,0.4)] transition-all overflow-hidden"
                                >
                                    <span className="relative z-10">Start Onboarding</span>
                                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <Link
                                    href="/docs"
                                    className="inline-flex items-center justify-center px-8 py-4 rounded-2xl glass-premium text-white font-semibold text-lg hover:bg-white/10 transition-all"
                                >
                                    System Architecture
                                </Link>
                            </motion.div>
                        </div>

                        {/* Interactive Hero Image/Asset */}
                        <motion.div
                            variants={itemVariants}
                            className="relative lg:block hidden"
                        >
                            <div className="relative z-10 glass-premium rounded-[2.5rem] overflow-hidden p-2 group">
                                <Image
                                    src="/hero-bg.png"
                                    alt="Hero Visualization"
                                    width={800}
                                    height={600}
                                    className="rounded-[2rem] w-full h-auto brightness-90 group-hover:brightness-100 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                            </div>
                            {/* Floating decorative cards */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-12 -right-8 glass p-6 rounded-3xl shadow-2xl z-20 hidden xl:block"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-emerald-500/20 rounded-2xl">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white uppercase tracking-wider">Identity Verified</div>
                                        <div className="text-xs text-slate-400">99.8% Confidence Score</div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Trusted Stats */}
            <section className="py-24 border-y border-white/5 bg-slate-900/20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {[
                            { value: "30s", label: "Agent Response", icon: Bot },
                            { value: "98%", label: "Accuracy", icon: Shield },
                            { value: "24/7", label: "Availability", icon: Clock },
                            { value: "10x", label: "Speed boost", icon: Zap },
                        ].map((stat, index) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                key={index}
                                className="flex flex-col items-center group"
                            >
                                <div className="p-4 rounded-2xl glass mb-6 group-hover:bg-primary/10 transition-colors">
                                    <stat.icon className="w-8 h-8 text-primary" />
                                </div>
                                <div className="text-5xl font-black text-white mb-2 tracking-tighter">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-semibold uppercase tracking-widest text-slate-500">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Agents Section */}
            <section id="agents" className="py-32 px-4 bg-background relative">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20">
                        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                            The Agent <span className="text-primary">Ecosystem.</span>
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl font-light">
                            Specialized intelligence handles every stage of the onboarding tunnel.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: FileText,
                                title: "Legal Counsel",
                                description: "Autonomous contract synthesis and compliance monitoring.",
                                color: "var(--primary)",
                            },
                            {
                                icon: Shield,
                                title: "Identity Warden",
                                description: "Next-gen biometric and fraud detection protocol.",
                                color: "rgb(16 185 129)",
                            },
                            {
                                icon: Users,
                                title: "CRM Sync",
                                description: "Real-time enterprise data orchestration and mapping.",
                                color: "rgb(59 130 246)",
                            },
                            {
                                icon: Zap,
                                title: "Provisioning",
                                description: "Instant access control and environment setup.",
                                color: "rgb(245 158 11)",
                            },
                            {
                                icon: BarChart3,
                                title: "Learning Engine",
                                description: "Adaptive curriculum delivery and engagement tracking.",
                                color: "rgb(236 72 153)",
                            },
                            {
                                icon: Bot,
                                title: "Orchestrator",
                                description: "Global state management and logical routing.",
                                color: "rgb(139 92 246)",
                            },
                        ].map((agent, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="group p-8 rounded-[2.5rem] glass-premium hover:bg-white/5 transition-all border-white/5"
                            >
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner"
                                    style={{ backgroundColor: `${agent.color}20`, border: `1px solid ${agent.color}40` }}
                                >
                                    <agent.icon className="w-8 h-8" style={{ color: agent.color }} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                                    {agent.title}
                                </h3>
                                <p className="text-slate-400 leading-relaxed font-light">{agent.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-4 border-t border-white/5 bg-slate-900/40">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center space-x-3">
                        <Zap className="w-6 h-6 text-primary fill-primary" />
                        <span className="text-xl font-black text-white tracking-tighter uppercase">OnboardFlow</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                        © 2026 OnboardFlow Intelligence Corporation. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
