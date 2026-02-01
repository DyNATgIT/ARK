"use client";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const customersData = [
    {
        id: "1",
        name: "John Smith",
        company: "TechStart Inc",
        email: "john@techstart.io",
        status: "active",
        type: "Business",
    },
    {
        id: "2",
        name: "Sarah Johnson",
        company: "Global Dynamics",
        email: "s.johnson@gd.com",
        status: "onboarding",
        type: "Enterprise",
    },
    {
        id: "3",
        name: "Mike Brown",
        company: "Small Biz LLC",
        email: "mike@smallbiz.com",
        status: "active",
        type: "Business",
    },
    {
        id: "4",
        name: "Emily Davis",
        company: "Future Systems",
        email: "e.davis@futuresys.com",
        status: "churned",
        type: "Enterprise",
    },
];

export default function CustomersPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Customers
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        View and manage your customer directory.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Customer
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Customers</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                placeholder="Search customers..."
                                className="h-9 w-full rounded-md border border-slate-200 bg-transparent pl-8 text-sm outline-none placeholder:text-slate-500 focus:border-blue-500 dark:border-slate-800"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-slate-200 dark:border-slate-800">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b [&_tr]:border-slate-200 dark:[&_tr]:border-slate-800">
                                    <tr className="border-b transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-left">
                                        <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                                            Name
                                        </th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                                            Company
                                        </th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                                            Email
                                        </th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                                            Type
                                        </th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                                            Status
                                        </th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {customersData.map((customer) => (
                                        <tr
                                            key={customer.id}
                                            className="border-b transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                                        >
                                            <td className="p-4 align-middle font-medium">
                                                {customer.name}
                                            </td>
                                            <td className="p-4 align-middle">{customer.company}</td>
                                            <td className="p-4 align-middle text-slate-500">
                                                {customer.email}
                                            </td>
                                            <td className="p-4 align-middle">{customer.type}</td>
                                            <td className="p-4 align-middle">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${customer.status === "active"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                            : customer.status === "onboarding"
                                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                                                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
                                                        }`}
                                                >
                                                    {customer.status}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Button variant="ghost" size="sm">
                                                    Edit
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
