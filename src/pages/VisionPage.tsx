import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    Rocket,
    Brain,
    Sparkles,
    Globe2,
    Lightbulb,
    TrendingUp,
    Users2,
    BookOpen,
    Calendar,
} from "lucide-react";

const VisionPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const pillars = [
        {
            icon: <Brain className="w-10 h-10" />,
            title: t("vision.pillars.innovation.title"),
            description: t("vision.pillars.innovation.description"),
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: <Users2 className="w-10 h-10" />,
            title: t("vision.pillars.empowerment.title"),
            description: t("vision.pillars.empowerment.description"),
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: <Globe2 className="w-10 h-10" />,
            title: t("vision.pillars.accessibility.title"),
            description: t("vision.pillars.accessibility.description"),
            color: "from-green-500 to-emerald-500",
        },
        {
            icon: <TrendingUp className="w-10 h-10" />,
            title: t("vision.pillars.growth.title"),
            description: t("vision.pillars.growth.description"),
            color: "from-orange-500 to-red-500",
        },
    ];

    const roadmap = [
        {
            year: "2024",
            title: t("vision.roadmap.2024.title"),
            items: [
                t("vision.roadmap.2024.item1"),
                t("vision.roadmap.2024.item2"),
                t("vision.roadmap.2024.item3"),
            ],
        },
        {
            year: "2025",
            title: t("vision.roadmap.2025.title"),
            items: [
                t("vision.roadmap.2025.item1"),
                t("vision.roadmap.2025.item2"),
                t("vision.roadmap.2025.item3"),
            ],
        },
        {
            year: "2026",
            title: t("vision.roadmap.2026.title"),
            items: [
                t("vision.roadmap.2026.item1"),
                t("vision.roadmap.2026.item2"),
                t("vision.roadmap.2026.item3"),
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-800 dark:to-blue-800 py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center space-x-2 rtl:space-x-reverse text-white mb-8 hover:opacity-80 transition-opacity"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>{t("common.back")}</span>
                    </button>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse mb-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Rocket className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white animate-fade-in-up">
                            {t("vision.header.title")}
                        </h1>
                    </div>
                    <p className="text-xl text-purple-100 dark:text-purple-200 max-w-3xl animate-fade-in-up animation-delay-100">
                        {t("vision.header.subtitle")}
                    </p>
                </div>
            </div>

            {/* Vision Statement */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl animate-fade-in-up">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                            {t("vision.statement.title")}
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                            {t("vision.statement.description")}
                        </p>
                        <div className="grid md:grid-cols-3 gap-6 mt-12">
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
                                <Lightbulb className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                    {t("vision.goals.smart.title")}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {t("vision.goals.smart.description")}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
                                <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                    {t("vision.goals.seamless.title")}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {t("vision.goals.seamless.description")}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
                                <Globe2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                    {t("vision.goals.scalable.title")}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {t("vision.goals.scalable.description")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="py-20 px-6 bg-white dark:bg-gray-800">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                            {t("vision.pillars.title")}
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            {t("vision.pillars.subtitle")}
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {pillars.map((pillar, index) => (
                            <div
                                key={index}
                                className="group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                }}
                            >
                                <div
                                    className={`w-20 h-20 bg-gradient-to-br ${pillar.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                                >
                                    {pillar.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                                    {pillar.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {pillar.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Roadmap */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse mb-4">
                            <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                                {t("vision.roadmap.title")}
                            </h2>
                        </div>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            {t("vision.roadmap.subtitle")}
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {roadmap.map((phase, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl animate-fade-in-up"
                                style={{
                                    animationDelay: `${index * 150}ms`,
                                }}
                            >
                                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                                        {phase.year}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                        {phase.title}
                                    </h3>
                                </div>
                                <ul className="space-y-3">
                                    {phase.items.map((item, idx) => (
                                        <li
                                            key={idx}
                                            className="flex items-start space-x-3 rtl:space-x-reverse"
                                        >
                                            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                                            </div>
                                            <span className="text-gray-600 dark:text-gray-300">
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Future Impact */}
            <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-800 dark:to-blue-800">
                <div className="container mx-auto max-w-4xl text-center text-white">
                    <h2 className="text-4xl font-bold mb-6">
                        {t("vision.impact.title")}
                    </h2>
                    <p className="text-xl text-purple-100 dark:text-purple-200 leading-relaxed">
                        {t("vision.impact.description")}
                    </p>
                </div>
            </section>
        </div>
    );
};

export default VisionPage;
