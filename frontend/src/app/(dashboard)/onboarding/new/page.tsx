"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ChevronRight, ChevronLeft, Building2, Users, Settings2, Rocket, CheckCircle2, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

const steps = [
    {
        id: "profile",
        title: "Entity Profile",
        description: "Core business registry data",
        icon: Building2,
    },
    {
        id: "stakeholders",
        title: "Stakeholders",
        description: "Authorized signers & controllers",
        icon: Users,
    },
    {
        id: "services",
        title: "Protocol Logic",
        description: "Onboarding depth & vectors",
        icon: Settings2,
    },
    {
        id: "review",
        title: "Final Synthesis",
        description: "Orchestration pre-flight",
        icon: Rocket,
    },
];

export default function NewOnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        companyName: "",
        taxId: "",
        contactName: "",
        email: "",
        tier: "standard" as "standard" | "enterprise",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateFormData = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev: any) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateStep = () => {
        const newErrors: Record<string, string> = {};
        if (currentStep === 0) {
            if (!formData.companyName) newErrors.companyName = "Entity name required";
            if (!formData.taxId) newErrors.taxId = "Tax identifier required";
        } else if (currentStep === 1) {
            if (!formData.contactName) newErrors.contactName = "Full name required";
            if (!formData.email) {
                newErrors.email = "Email vector required";
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Invalid email protocol";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep() && currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await axios.post("/api/v1/onboarding/wizard", {
                company_name: formData.companyName,
                tax_id: formData.taxId,
                contact_name: formData.contactName,
                email: formData.email,
                workflow_type: formData.tier === "enterprise" ? "enterprise_onboarding" : "standard_onboarding",
                priority: "normal",
                context: {
                    intake_source: "web_wizard"
                }
            });

            if (response.data?.data?.id) {
                router.push(`/dashboard/onboarding/${response.data.data.id}`);
            } else {
                router.push("/dashboard/onboarding");
            }
        } catch (error) {
            console.error("Failed to start onboarding:", error);
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-5xl space-y-12 pb-20"
        >
            <div className="flex flex-col space-y-4 text-center">
                <div className="inline-flex self-center items-center px-4 py-2 rounded-2xl glass-premium border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                    <Sparkles className="w-3 h-3 mr-2" />
                    Protocol Initialization Sequence
                </div>
                <h2 className="text-6xl font-black tracking-tighter text-white uppercase italic">
                    Launch <span className="text-primary not-italic">Onboarding</span>
                </h2>
                <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                    Input entity parameters to initialize the autonomous orchestration pipeline.
                </p>
            </div>

            {/* Premium Stepper */}
            <div className="relative flex justify-between max-w-3xl mx-auto px-8">
                <div className="absolute top-7 left-0 h-[2px] w-full bg-white/5" />
                <div
                    className="absolute top-7 left-0 h-[2px] bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <motion.div
                                animate={isActive ? { scale: 1.2, boxShadow: "0 0 20px rgba(110,89,255,0.4)" } : { scale: 1 }}
                                className={cn(
                                    "flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all duration-500",
                                    isActive
                                        ? "border-primary bg-background text-primary"
                                        : isCompleted
                                            ? "border-primary bg-primary text-white"
                                            : "border-white/5 bg-background text-slate-700 shadow-none"
                                )}
                            >
                                {isCompleted ? <CheckCircle2 className="h-7 w-7 stroke-[3px]" /> : <Icon className="h-6 w-6 stroke-[2px]" />}
                            </motion.div>
                            <div className="mt-4 hidden md:block">
                                <p
                                    className={cn(
                                        "text-[10px] font-black uppercase tracking-widest text-center",
                                        isActive ? "text-primary" : "text-slate-600"
                                    )}
                                >
                                    {step.title}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Form Content */}
            <Card className="glass-premium border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                <CardHeader className="p-12 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            {(() => { const StepIcon = steps[currentStep].icon; return <StepIcon className="w-6 h-6 text-primary" />; })()}
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-black text-white uppercase tracking-tighter italic">
                                {steps[currentStep].title}
                            </CardTitle>
                            <CardDescription className="text-slate-500 font-medium">{steps[currentStep].description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-12 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            {currentStep === 0 && (
                                <div className="grid gap-8">
                                    <div className="grid gap-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">Entity Primary Name</label>
                                        <input
                                            className={cn(
                                                "flex h-16 w-full rounded-2xl glass border-white/5 bg-white/[0.03] px-6 text-lg font-bold text-white outline-none transition-all focus:border-primary/50 focus:bg-white/[0.05]",
                                                errors.companyName && "border-destructive/50"
                                            )}
                                            placeholder="e.g. Nexus Protocol"
                                            value={formData.companyName}
                                            onChange={(e) => updateFormData("companyName", e.target.value)}
                                        />
                                        {errors.companyName && <p className="text-[10px] font-bold text-destructive uppercase ml-1 italic">{errors.companyName}</p>}
                                    </div>
                                    <div className="grid gap-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">Global Tax Identifier</label>
                                        <input
                                            className={cn(
                                                "flex h-16 w-full rounded-2xl glass border-white/5 bg-white/[0.03] px-6 text-lg font-bold text-white outline-none transition-all focus:border-primary/50 focus:bg-white/[0.05]",
                                                errors.taxId && "border-destructive/50"
                                            )}
                                            placeholder="e.g. REG-77651-TX"
                                            value={formData.taxId}
                                            onChange={(e) => updateFormData("taxId", e.target.value)}
                                        />
                                        {errors.taxId && <p className="text-[10px] font-bold text-destructive uppercase ml-1 italic">{errors.taxId}</p>}
                                    </div>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div className="grid gap-8">
                                    <div className="grid gap-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">Controller Full Name</label>
                                        <input
                                            className={cn(
                                                "flex h-16 w-full rounded-2xl glass border-white/5 bg-white/[0.03] px-6 text-lg font-bold text-white outline-none transition-all focus:border-primary/50 focus:bg-white/[0.05]",
                                                errors.contactName && "border-destructive/50"
                                            )}
                                            placeholder="e.g. Julian Vane"
                                            value={formData.contactName}
                                            onChange={(e) => updateFormData("contactName", e.target.value)}
                                        />
                                        {errors.contactName && <p className="text-[10px] font-bold text-destructive uppercase ml-1 italic">{errors.contactName}</p>}
                                    </div>
                                    <div className="grid gap-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">Secure Email Vector</label>
                                        <input
                                            className={cn(
                                                "flex h-16 w-full rounded-2xl glass border-white/5 bg-white/[0.03] px-6 text-lg font-bold text-white outline-none transition-all focus:border-primary/50 focus:bg-white/[0.05]",
                                                errors.email && "border-destructive/50"
                                            )}
                                            placeholder="e.g. j.vane@nexus.io"
                                            value={formData.email}
                                            onChange={(e) => updateFormData("email", e.target.value)}
                                        />
                                        {errors.email && <p className="text-[10px] font-bold text-destructive uppercase ml-1 italic">{errors.email}</p>}
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="grid gap-6">
                                    {[
                                        { id: "standard", label: "Standard Induction", sub: "Automated KYC & Legal Synthesis", icon: ShieldCheck },
                                        { id: "enterprise", label: "High-Priority Vector", sub: "Full Cluster Sync & Manual Overrides", icon: Zap },
                                    ].map((tier) => (
                                        <motion.div
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            key={tier.id}
                                            onClick={() => updateFormData("tier", tier.id)}
                                            className={cn(
                                                "flex items-center space-x-6 rounded-[2rem] border-2 p-8 cursor-pointer transition-all duration-300",
                                                formData.tier === tier.id
                                                    ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(110,89,255,0.15)]"
                                                    : "border-white/5 hover:bg-white/[0.02]"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex h-16 w-16 items-center justify-center rounded-2xl",
                                                formData.tier === tier.id ? "bg-primary text-white" : "bg-white/[0.03] text-slate-600"
                                            )}>
                                                <tier.icon className="h-8 w-8 stroke-[2px]" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xl font-black text-white uppercase tracking-tight italic">{tier.label}</p>
                                                <p className="text-slate-500 font-medium italic">{tier.sub}</p>
                                            </div>
                                            {formData.tier === tier.id && (
                                                <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_10px_rgba(110,89,255,1)]" />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-8">
                                    <div className="rounded-[2.5rem] glass-premium bg-white/[0.02] p-10 border border-white/5">
                                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8">System Pre-flight Summary</h4>
                                        <div className="grid gap-6">
                                            {[
                                                { k: "Entity", v: formData.companyName },
                                                { k: "Controller", v: formData.contactName },
                                                { k: "Vector", v: formData.email },
                                                { k: "Priority", v: formData.tier, cap: true as const },
                                            ].map((item: any, idx) => (
                                                <div key={idx} className="flex justify-between items-end border-b border-white/[0.03] pb-4">
                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{item.k}</span>
                                                    <span className={cn("text-xl font-bold text-white tracking-tight leading-none", item.cap && "capitalize")}>{item.v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-center text-xs font-medium text-slate-600 italic">
                                        Deployment will initialize 8 specialized AI agents across the global cluster.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
                <CardFooter className="p-12 border-t border-white/5 bg-white/[0.02] flex justify-between">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={currentStep === 0 || isSubmitting}
                        className="rounded-2xl glass hover:bg-white/10 h-16 px-10 text-white font-bold group"
                    >
                        <ChevronLeft className="mr-3 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        Sequence Retract
                    </Button>
                    {currentStep === steps.length - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="rounded-2xl bg-primary hover:bg-primary/90 hover:scale-[1.02] transition-all h-16 px-10 text-white font-black uppercase tracking-widest italic shadow-2xl shadow-primary/30"
                        >
                            {isSubmitting ? "Orchestrating..." : "Execute Deployment"}
                            {!isSubmitting && <Rocket className="ml-3 h-5 w-5 fill-white" />}
                        </Button>
                    ) : (
                        <Button
                            onClick={nextStep}
                            className="rounded-2xl bg-white text-black hover:bg-slate-200 hover:scale-[1.02] transition-all h-16 px-10 font-bold"
                        >
                            Next Sequence
                            <ChevronRight className="ml-3 h-5 w-5" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
}
