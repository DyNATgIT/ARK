import Link from "next/link";
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
} from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">OnboardFlow</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="text-slate-300 hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                        <Bot className="w-4 h-4 mr-2" />
                        Powered by AI Agents
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Customer Onboarding
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                            Orchestrated by AI
                        </span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10">
                        Transform your customer onboarding from days to minutes. Our AI agents
                        handle contracts, verification, provisioning, and training—all
                        automatically orchestrated.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/dashboard/onboarding/new"
                            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-xl shadow-blue-500/30"
                        >
                            Start Onboarding
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                        <Link
                            href="/docs"
                            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-slate-800 text-white font-semibold text-lg hover:bg-slate-700 transition-colors border border-slate-700"
                        >
                            View Documentation
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-700/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: "30min", label: "Avg. Onboarding Time", icon: Clock },
                            { value: "95%", label: "Automation Rate", icon: Bot },
                            { value: "99.9%", label: "Compliance Rate", icon: Shield },
                            { value: "10x", label: "Faster Than Manual", icon: Zap },
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                                <div className="text-4xl font-bold text-white mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Specialized AI Agents
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Each agent is a domain expert, working together to deliver seamless
                            onboarding.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: FileText,
                                title: "Legal Agent",
                                description:
                                    "Generates contracts, validates compliance, triggers e-signatures automatically.",
                                color: "from-purple-500 to-violet-600",
                            },
                            {
                                icon: Shield,
                                title: "Identity Agent",
                                description:
                                    "KYC/KYB verification, fraud detection, and sanctions screening in seconds.",
                                color: "from-emerald-500 to-teal-600",
                            },
                            {
                                icon: Users,
                                title: "CRM Agent",
                                description:
                                    "Creates customer records, updates pipelines, syncs across your systems.",
                                color: "from-blue-500 to-cyan-600",
                            },
                            {
                                icon: Zap,
                                title: "IT Provisioning",
                                description:
                                    "Provisions accounts, assigns access rights, configures SSO automatically.",
                                color: "from-orange-500 to-amber-600",
                            },
                            {
                                icon: BarChart3,
                                title: "Training Agent",
                                description:
                                    "Enrolls in LMS, assigns curriculum, tracks completion progress.",
                                color: "from-pink-500 to-rose-600",
                            },
                            {
                                icon: CheckCircle2,
                                title: "Supervisor Agent",
                                description:
                                    "Orchestrates all agents, handles escalations, ensures quality.",
                                color: "from-indigo-500 to-blue-600",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="group relative p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all hover:shadow-xl"
                            >
                                <div
                                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                >
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Ready to Transform Your Onboarding?
                        </h2>
                        <p className="text-xl text-slate-300 mb-8">
                            Join leading companies who have reduced onboarding time by 90%
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center px-8 py-4 rounded-xl bg-white text-slate-900 font-semibold text-lg hover:bg-slate-100 transition-colors"
                        >
                            Get Started Now
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-700/50">
                <div className="max-w-7xl mx-auto text-center text-slate-400">
                    <p>© 2024 OnboardFlow. Customer Onboarding Orchestrator.</p>
                </div>
            </footer>
        </div>
    );
}
