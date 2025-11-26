import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    Target,
    Users,
    Award,
    Zap,
    Shield,
    Globe,
    TrendingUp,
    BookOpen,
    Heart,
} from "lucide-react";

const AboutPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const values = [
        {
            icon: <Shield className="w-8 h-8" />,
            title: t("about.values.excellence.title"),
            description: t("about.values.excellence.description"),
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: t("about.values.innovation.title"),
            description: t("about.values.innovation.description"),
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: t("about.values.collaboration.title"),
            description: t("about.values.collaboration.description"),
            color: "from-green-500 to-emerald-500",
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: t("about.values.accessibility.title"),
            description: t("about.values.accessibility.description"),
            color: "from-orange-500 to-red-500",
        },
    ];

    const stats = [
        {
            icon: <Users className="w-6 h-6" />,
            number: "10,000+",
            label: t("about.stats.users"),
        },
        {
            icon: <BookOpen className="w-6 h-6" />,
            number: "500+",
            label: t("about.stats.courses"),
        },
        {
            icon: <Award className="w-6 h-6" />,
            number: "15+",
            label: t("about.stats.departments"),
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            number: "99.9%",
            label: t("about.stats.uptime"),
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center space-x-2 rtl:space-x-reverse text-white mb-8 hover:opacity-80 transition-opacity"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>{t("common.back")}</span>
                    </button>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
                        {t("about.header.title")}
                    </h1>
                    <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl animate-fade-in-up animation-delay-100">
                        {t("about.header.subtitle")}
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-fade-in-up">
                            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                    {t("about.mission.title")}
                                </h2>
                            </div>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                {t("about.mission.description")}
                            </p>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t("about.mission.details")}
                            </p>
                        </div>
                        <div className="animate-fade-in-up animation-delay-200">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                                {t("about.highlights.efficiency.title")}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {t("about.highlights.efficiency.description")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                                {t("about.highlights.userCentric.title")}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {t("about.highlights.userCentric.description")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                                {t("about.highlights.security.title")}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {t("about.highlights.security.description")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 px-6 bg-white dark:bg-gray-800">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                            {t("about.values.title")}
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            {t("about.values.subtitle")}
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                }}
                            >
                                <div
                                    className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="text-center animate-fade-in-up"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                }}
                            >
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    {stat.icon}
                                </div>
                                <div className="text-4xl font-bold text-white mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-blue-100 dark:text-blue-200">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl text-center">
                    <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                        {t("about.team.title")}
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
                        {t("about.team.description")}
                    </p>
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-12">
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            {t("about.team.details")}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
