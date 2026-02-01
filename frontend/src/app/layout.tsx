import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "@/styles/globals.css";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    weight: ["300", "400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
    title: "OnboardFlow | AI-Powered Customer Onboarding",
    description: "Premium AI-powered customer onboarding automation platform orchestrated by specialized agents.",
    keywords: ["onboarding", "automation", "AI", "workflow", "SaaS"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={`${outfit.variable} font-outfit antialiased mesh-gradient min-h-screen selection:bg-primary/30`}>
                <div className="relative z-10">
                    {children}
                </div>
            </body>
        </html>
    );
}
