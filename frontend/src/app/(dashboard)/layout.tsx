import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            <div className="lg:pl-72">
                <Header />
                <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
