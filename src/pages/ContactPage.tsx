import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Send,
    MessageSquare,
    Clock,
    Globe,
    CheckCircle2,
} from "lucide-react";

const ContactPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: "", email: "", subject: "", message: "" });
        }, 3000);
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const contactMethods = [
        {
            icon: <Mail className="w-6 h-6" />,
            title: t("contact.methods.email.title"),
            value: "support@unisystem.edu",
            description: t("contact.methods.email.description"),
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: <Phone className="w-6 h-6" />,
            title: t("contact.methods.phone.title"),
            value: "+1 (555) 123-4567",
            description: t("contact.methods.phone.description"),
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: <MapPin className="w-6 h-6" />,
            title: t("contact.methods.location.title"),
            value: t("contact.methods.location.value"),
            description: t("contact.methods.location.description"),
            color: "from-green-500 to-emerald-500",
        },
        {
            icon: <Clock className="w-6 h-6" />,
            title: t("contact.methods.hours.title"),
            value: t("contact.methods.hours.value"),
            description: t("contact.methods.hours.description"),
            color: "from-orange-500 to-red-500",
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
                    <div className="flex items-center space-x-4 rtl:space-x-reverse mb-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white animate-fade-in-up">
                            {t("contact.header.title")}
                        </h1>
                    </div>
                    <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl animate-fade-in-up animation-delay-100">
                        {t("contact.header.subtitle")}
                    </p>
                </div>
            </div>

            {/* Contact Methods */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                        {contactMethods.map((method, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                }}
                            >
                                <div
                                    className={`w-12 h-12 bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center text-white mb-4`}
                                >
                                    {method.icon}
                                </div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">
                                    {method.title}
                                </h3>
                                <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">
                                    {method.value}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {method.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Contact Form & Info */}
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                                    {t("contact.form.title")}
                                </h2>
                                {submitted ? (
                                    <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-8 text-center">
                                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                                            {t("contact.form.successTitle")}
                                        </h3>
                                        <p className="text-green-600 dark:text-green-300">
                                            {t("contact.form.successMessage")}
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    {t("contact.form.name")}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                                    placeholder={t("contact.form.namePlaceholder")}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    {t("contact.form.email")}
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                                    placeholder={t("contact.form.emailPlaceholder")}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                {t("contact.form.subject")}
                                            </label>
                                            <select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                            >
                                                <option value="">
                                                    {t("contact.form.selectSubject")}
                                                </option>
                                                <option value="general">
                                                    {t("contact.form.subjects.general")}
                                                </option>
                                                <option value="support">
                                                    {t("contact.form.subjects.support")}
                                                </option>
                                                <option value="demo">
                                                    {t("contact.form.subjects.demo")}
                                                </option>
                                                <option value="partnership">
                                                    {t("contact.form.subjects.partnership")}
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                {t("contact.form.message")}
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows={6}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors resize-none"
                                                placeholder={t("contact.form.messagePlaceholder")}
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse group"
                                        >
                                            <span>{t("contact.form.submit")}</span>
                                            <Send className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8">
                                <Globe className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                    {t("contact.info.global.title")}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {t("contact.info.global.description")}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg">
                                <MessageSquare className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-4" />
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                    {t("contact.info.support.title")}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    {t("contact.info.support.description")}
                                </p>
                                <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>{t("contact.info.support.available")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Placeholder */}
            <section className="py-20 px-6 bg-white dark:bg-gray-800">
                <div className="container mx-auto max-w-6xl">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-3xl h-96 flex items-center justify-center">
                        <div className="text-center">
                            <MapPin className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">
                                {t("contact.map.placeholder")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
