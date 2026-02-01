import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusColor } from "@/lib/utils";

export default function OnboardingPage() {
    const [onboardingData, setOnboardingData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOnboardings = async () => {
            try {
                const response = await axios.get("/api/v1/onboarding");
                if (response.data?.items) {
                    setOnboardingData(response.data.items);
                }
            } catch (error) {
                console.error("Failed to fetch onboardings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOnboardings();
        // Poll for updates every 10 seconds
        const interval = setInterval(fetchOnboardings, 10000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Onboarding Workflows
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Manage and monitor active customer onboarding processes.
                    </p>
                </div>
                <Link href="/dashboard/onboarding/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Onboarding
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-slate-200 dark:border-slate-800">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b [&_tr]:border-slate-200 dark:[&_tr]:border-slate-800">
                                    <tr className="border-b transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50 data-[state=selected]:bg-slate-50 dark:data-[state=selected]:bg-slate-800">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                                            Customer
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                                            Type
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                                            Status
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                                            Progress
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                                            Current Step
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                                            Started
                                        </th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-slate-500 dark:text-slate-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {onboardingData.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                                        >
                                            <td className="p-4 align-middle font-medium">
                                                {item.customer_name || "Unknown Customer"}
                                            </td>
                                            <td className="p-4 align-middle capitalize">{item.workflow_type.replace("_", " ")}</td>
                                            <td className="p-4 align-middle">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                                        item.status
                                                    )}`}
                                                >
                                                    {item.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="w-full max-w-[100px]">
                                                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                        <div
                                                            className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
                                                            style={{ width: `${item.progress_percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="mt-1 text-xs text-slate-500">
                                                        {item.progress_percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">{item.current_step || "N/A"}</td>
                                            <td className="p-4 align-middle text-slate-500">
                                                {item.started_at ? new Date(item.started_at).toLocaleString() : "Not started"}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/dashboard/onboarding/${item.id}`}>
                                                        View
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
