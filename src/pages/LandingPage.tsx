import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
    GraduationCap,
    BookOpen,
    Users,
    Calendar,
    Award,
    TrendingUp,
    CheckCircle,
    ArrowRight,
    Mail,
    Headphones,
} from "lucide-react";
import PublicNav from "@/components/layout/PublicNav";
import "../animations.css";

export default function LandingPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
            <PublicNav />

            {/* Hero Section */}
            <section id="home" className="pt-32 pb-20 px-6 overflow-hidden">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center space-y-8 relative">
                        {/* Floating decorative elements */}
                        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 dark:opacity-10 animate-blob"></div>
                        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-400 dark:bg-blue-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-cyan-300 dark:bg-cyan-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>

                        <div className="relative z-10">
                            <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in-up">
                                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-300 bg-clip-text text-transparent inline-block animate-gradient">
                                    {t("landing.hero.title")}
                                </span>
                                <br />
                                <span className="text-gray-800 dark:text-gray-100">
                                    {t("landing.hero.subtitle")}
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
                                {t("landing.hero.description")}
                            </p>
                            <div className="flex justify-center items-center gap-4 pt-4 animate-fade-in-up animation-delay-400">
                                <Button
                                    onClick={() => navigate("/login")}
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                                    {t("landing.hero.getStarted")}
                                    <ArrowRight className="ms-2 w-5 h-5" />
                                </Button>
                                <Button
                                    onClick={() => navigate("/about")}
                                    size="lg"
                                    variant="outline"
                                    className="border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-400 hover:text-white dark:hover:text-gray-900 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                                    {t("landing.hero.learnMore")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section
                id="features"
                className="py-20 px-6 bg-white/50 dark:bg-gray-800/70 transition-colors duration-300">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-4xl font-bold text-center mb-4 text-gray-800 dark:text-white">
                        {t("landing.features.title")}
                    </h2>
                    <p className="text-center text-gray-600 dark:text-gray-200 mb-16 text-lg">
                        {t("landing.features.subtitle")}
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature Cards */}
                        <div className="animate-fade-in-up animation-delay-100">
                            <FeatureCard
                                icon={<Users className="w-10 h-10" />}
                                title={t(
                                    "landing.features.cards.studentManagement.title"
                                )}
                                description={t(
                                    "landing.features.cards.studentManagement.description"
                                )}
                                gradient="from-blue-500 to-cyan-500"
                            />
                        </div>
                        <div className="animate-fade-in-up animation-delay-200">
                            <FeatureCard
                                icon={<BookOpen className="w-10 h-10" />}
                                title={t(
                                    "landing.features.cards.courseAdmin.title"
                                )}
                                description={t(
                                    "landing.features.cards.courseAdmin.description"
                                )}
                                gradient="from-blue-500 to-cyan-500"
                            />
                        </div>
                        <div className="animate-fade-in-up animation-delay-300">
                            <FeatureCard
                                icon={<Calendar className="w-10 h-10" />}
                                title={t(
                                    "landing.features.cards.scheduleManagement.title"
                                )}
                                description={t(
                                    "landing.features.cards.scheduleManagement.description"
                                )}
                                gradient="from-green-500 to-emerald-500"
                            />
                        </div>
                        <div className="animate-fade-in-up animation-delay-400">
                            <FeatureCard
                                icon={<Award className="w-10 h-10" />}
                                title={t(
                                    "landing.features.cards.gradesAssessment.title"
                                )}
                                description={t(
                                    "landing.features.cards.gradesAssessment.description"
                                )}
                                gradient="from-orange-500 to-red-500"
                            />
                        </div>
                        <div className="animate-fade-in-up animation-delay-500">
                            <FeatureCard
                                icon={<TrendingUp className="w-10 h-10" />}
                                title={t(
                                    "landing.features.cards.analytics.title"
                                )}
                                description={t(
                                    "landing.features.cards.analytics.description"
                                )}
                                gradient="from-indigo-500 to-blue-500"
                            />
                        </div>
                        <div className="animate-fade-in-up animation-delay-600">
                            <FeatureCard
                                icon={<CheckCircle className="w-10 h-10" />}
                                title={t(
                                    "landing.features.cards.attendance.title"
                                )}
                                description={t(
                                    "landing.features.cards.attendance.description"
                                )}
                                gradient="from-teal-500 to-cyan-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                                {t("landing.benefits.title")}{" "}
                                <span className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                                    {t("landing.benefits.titleHighlight")}
                                </span>
                            </h2>
                            <div className="space-y-6">
                                <BenefitItem
                                    title={t("landing.benefits.students.title")}
                                    description={t(
                                        "landing.benefits.students.description"
                                    )}
                                />
                                <BenefitItem
                                    title={t("landing.benefits.faculty.title")}
                                    description={t(
                                        "landing.benefits.faculty.description"
                                    )}
                                />
                                <BenefitItem
                                    title={t(
                                        "landing.benefits.administrators.title"
                                    )}
                                    description={t(
                                        "landing.benefits.administrators.description"
                                    )}
                                />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-8 shadow-xl">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 space-y-4">
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                                            {t(
                                                "landing.benefits.platformTitle"
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t(
                                                "landing.benefits.platformSubtitle"
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {t("landing.benefits.platformDescription")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700">
                <div className="container mx-auto max-w-4xl text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        {t("landing.cta.title")}
                    </h2>
                    <p className="text-xl text-blue-100 dark:text-blue-200">
                        {t("landing.cta.subtitle")}
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-12 gap-8 mb-12">
                        {/* Logo and Description */}
                        <div className="md:col-span-5">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-xl">
                                    <GraduationCap className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    {t("landing.appName")}
                                </span>
                            </div>
                            <p className="text-gray-400 leading-relaxed text-base mb-6 max-w-sm">
                                {t("landing.footer.description")}
                            </p>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>{t("landing.footer.systemActive")}</span>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="md:col-span-3">
                            <h3 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">
                                Navigate
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="#features"
                                        className="text-gray-400 hover:text-blue-400 transition-all duration-300 flex items-center group text-sm">
                                        <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#benefits"
                                        className="text-gray-400 hover:text-blue-400 transition-all duration-300 flex items-center group text-sm">
                                        <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                                        Benefits
                                    </a>
                                </li>
                                <li>
                                    <button
                                        onClick={() => navigate("/login")}
                                        className="text-gray-400 hover:text-blue-400 transition-all duration-300 flex items-center group text-sm">
                                        <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                                        Portal Access
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="md:col-span-4">
                            <h3 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">
                                Get in Touch
                            </h3>
                            <div className="space-y-4">
                                <a
                                    href="mailto:info@unisystem.edu"
                                    className="flex items-center group cursor-pointer">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center  group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all border border-blue-500/30">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="mx-2">
                                        <p className="text-gray-500 text-xs mb-0.5 uppercase tracking-wide">
                                            General Inquiries
                                        </p>
                                        <p className="text-gray-300 text-sm font-medium group-hover:text-blue-400 transition-colors">
                                            info@unisystem.edu
                                        </p>
                                    </div>
                                </a>
                                <a
                                    href="mailto:support@unisystem.edu"
                                    className="flex items-center group cursor-pointer">
                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-cyan-600/30 transition-all border border-cyan-500/30">
                                        <Headphones className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div className="mx-2">
                                        <p className="text-gray-500 text-xs mb-0.5 uppercase tracking-wide ">
                                            Technical Support
                                        </p>
                                        <p className="text-gray-300 text-sm font-medium group-hover:text-cyan-400 transition-colors">
                                            support@unisystem.edu
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-700/50 pt-8 mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-500 text-sm">
                                © 2025{" "}
                                <span className="text-gray-400 font-semibold">
                                    {t("landing.appName")}
                                </span>
                                . All rights reserved.
                            </p>
                            <div className="flex items-center gap-6">
                                <a
                                    href="#"
                                    className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
                                    Privacy Policy
                                </a>
                                <a
                                    href="#"
                                    className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
                                    Terms of Service
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
    gradient,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
}) {
    return (
        <div className="bg-white dark:bg-gray-700/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-600 group hover:scale-105 hover:-translate-y-2 backdrop-blur-sm">
            <div
                className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
                {description}
            </p>
        </div>
    );
}

function BenefitItem({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start space-x-4 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shrink-0 mt-1">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-1">
                    {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                    {description}
                </p>
            </div>
        </div>
    );
}
