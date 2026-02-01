import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="lg:pl-72 relative">
                <Header />
                <main className="py-10 px-6 sm:px-10 lg:px-12 relative z-10">{children}</main>
                {/* Dashboard ambient glow */}
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            </div>
        </div>
    );
}
