"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ChevronRight, ChevronLeft, Building2, Users, Settings2, Rocket, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
    {
        id: "profile",
        title: "Company Profile",
        description: "General business information",
        icon: Building2,
    },
    {
        id: "stakeholders",
        title: "Stakeholders",
        description: "Primary contact & signers",
        icon: Users,
    },
    {
        id: "services",
        title: "Service Selection",
        description: "Onboarding tier & extras",
        icon: Settings2,
    },
    {
        id: "review",
        title: "Review & Deploy",
        description: "Final validation",
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
            if (!formData.companyName) newErrors.companyName = "Company name is required";
            if (!formData.taxId) newErrors.taxId = "Tax ID is required";
        } else if (currentStep === 1) {
            if (!formData.contactName) newErrors.contactName = "Contact name is required";
            if (!formData.email) {
                newErrors.email = "Email is required";
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Invalid email format";
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
            // Handle error (e.g., show toast)
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Create New Onboarding
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Follow the steps below to initialize a new customer onboarding workflow.
                </p>
            </div>

            {/* Stepper */}
            <div className="relative flex justify-between">
                <div className="absolute top-5 left-0 h-0.5 w-full bg-slate-100 dark:bg-slate-800" />
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                                    isActive
                                        ? "border-blue-500 bg-white text-blue-500 dark:bg-slate-900"
                                        : isCompleted
                                            ? "border-blue-500 bg-blue-500 text-white"
                                            : "border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900"
                                )}
                            >
                                {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
                            </div>
                            <div className="mt-2 hidden text-center md:block">
                                <p
                                    className={cn(
                                        "text-xs font-medium",
                                        isActive ? "text-blue-500" : "text-slate-500 dark:text-slate-400"
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
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle>{steps[currentStep].title}</CardTitle>
                    <CardDescription>{steps[currentStep].description}</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[300px] space-y-4">
                    {currentStep === 0 && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none">
                                    Company Name
                                </label>
                                <input
                                    className={cn(
                                        "flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
                                        errors.companyName ? "border-red-500" : "border-slate-200 dark:border-slate-800"
                                    )}
                                    placeholder="e.g. Acme Corp"
                                    value={formData.companyName}
                                    onChange={(e) => updateFormData("companyName", e.target.value)}
                                />
                                {errors.companyName && <p className="text-xs text-red-500">{errors.companyName}</p>}
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none">
                                    Tax ID / Registration Number
                                </label>
                                <input
                                    className={cn(
                                        "flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
                                        errors.taxId ? "border-red-500" : "border-slate-200 dark:border-slate-800"
                                    )}
                                    placeholder="e.g. 12-3456789"
                                    value={formData.taxId}
                                    onChange={(e) => updateFormData("taxId", e.target.value)}
                                />
                                {errors.taxId && <p className="text-xs text-red-500">{errors.taxId}</p>}
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none">
                                    Primary Contact Name
                                </label>
                                <input
                                    className={cn(
                                        "flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
                                        errors.contactName ? "border-red-500" : "border-slate-200 dark:border-slate-800"
                                    )}
                                    placeholder="e.g. John Doe"
                                    value={formData.contactName}
                                    onChange={(e) => updateFormData("contactName", e.target.value)}
                                />
                                {errors.contactName && <p className="text-xs text-red-500">{errors.contactName}</p>}
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none">
                                    Email Address
                                </label>
                                <input
                                    className={cn(
                                        "flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
                                        errors.email ? "border-red-500" : "border-slate-200 dark:border-slate-800"
                                    )}
                                    placeholder="e.g. john@acme.com"
                                    value={formData.email}
                                    onChange={(e) => updateFormData("email", e.target.value)}
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="grid gap-6 py-4">
                            <div
                                onClick={() => updateFormData("tier", "standard")}
                                className={cn(
                                    "flex items-center space-x-4 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer",
                                    formData.tier === "standard"
                                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                                        : "border-slate-200 dark:border-slate-800"
                                )}
                            >
                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full",
                                    formData.tier === "standard" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                )}>
                                    <Settings2 className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">Standard Onboarding</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                                        Automated KYC, Contract Gen & IT Setup
                                    </p>
                                </div>
                            </div>
                            <div
                                onClick={() => updateFormData("tier", "enterprise")}
                                className={cn(
                                    "flex items-center space-x-4 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer",
                                    formData.tier === "enterprise"
                                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                                        : "border-slate-200 dark:border-slate-800"
                                )}
                            >
                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full",
                                    formData.tier === "enterprise" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                )}>
                                    <Rocket className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">Enterprise Onboarding</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                                        Custom workflows, manual overrides & advanced audit trails
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6 py-4">
                            <div className="rounded-lg bg-slate-50 p-6 dark:bg-slate-800/50">
                                <h4 className="mb-4 font-semibold">Onboarding Summary</h4>
                                <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="flex justify-between border-b border-slate-200 py-2 dark:border-slate-800">
                                        <span>Company</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{formData.companyName}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 py-2 dark:border-slate-800">
                                        <span>Contact</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{formData.contactName}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 py-2 dark:border-slate-800">
                                        <span>Email</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{formData.email}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span>Tier</span>
                                        <span className="font-medium text-slate-900 dark:text-white capitalize">{formData.tier}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                                Clicking "Deploy Workflow" will trigger the AI Orchestrator to start the induction process.
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <Button variant="ghost" onClick={prevStep} disabled={currentStep === 0 || isSubmitting}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    {currentStep === steps.length - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            {isSubmitting ? "Deploying..." : "Deploy Workflow"}
                            {!isSubmitting && <Rocket className="ml-2 h-4 w-4" />}
                        </Button>
                    ) : (
                        <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                            Next Step
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

