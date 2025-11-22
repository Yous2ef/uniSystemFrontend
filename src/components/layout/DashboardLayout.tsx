import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <Header />
            <main className="lg:ms-64 mt-16 p-4 sm:p-6 transition-all duration-300">
                <div className="max-w-full overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}
