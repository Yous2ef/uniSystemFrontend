import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    Users,
    BarChart3,
    Calendar,
    FileText,
    MessageSquare,
    AlertCircle,
    TrendingUp,
    Settings,
    ArrowRight,
} from "lucide-react";
import { facultyService } from "@/services/api";
import { useAuthStore } from "@/store/auth";

interface Section {
    id: string;
    code: string;
    capacity: number;
    course: {
        code: string;
        nameAr: string;
        nameEn: string;
        credits: number;
    };
    term: {
        name: string;
        status: string;
    };
    _count?: {
        enrollments: number;
    };
}

export default function MyCoursesPage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState<Section[]>([]);

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const facultyResponse = await facultyService.getAll();
            
            if (facultyResponse.success) {
                const allFaculty = facultyResponse.data?.faculty || facultyResponse.data || [];
                const currentFaculty = allFaculty.find((f: any) => f.userId === user?.id);
                
                if (currentFaculty) {
                    const sectionsResponse = await facultyService.getSections(currentFaculty.id);
                    if (sectionsResponse.success) {
                        setSections(sectionsResponse.data || []);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching sections:", error);
        } finally {
            setLoading(false);
        }
    };

    const courseFeatures = [
        {
            icon: Users,
            label: "👥 الطلاب",
            description: "قائمة، فلاتر، تفاصيل",
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            icon: BarChart3,
            label: "📊 الدرجات",
            description: "إعداد، إدخال، رفع، نشر",
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            icon: Calendar,
            label: "📅 الحضور",
            description: "تسجيل، تقارير، أعذار",
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
        {
            icon: FileText,
            label: "📚 المحتوى",
            description: "رفع محاضرات، فيديوهات، أكواد",
            color: "text-orange-600",
            bg: "bg-orange-50",
        },
        {
            icon: MessageSquare,
            label: "📢 الإعلانات",
            description: "نشر إعلانات للطلاب",
            color: "text-pink-600",
            bg: "bg-pink-50",
        },
        {
            icon: AlertCircle,
            label: "💬 التظلمات",
            description: "مراجعة التظلمات على الدرجات",
            color: "text-red-600",
            bg: "bg-red-50",
        },
        {
            icon: TrendingUp,
            label: "📈 التحليلات",
            description: "إحصائيات وتوزيع الدرجات",
            color: "text-indigo-600",
            bg: "bg-indigo-50",
        },
        {
            icon: Settings,
            label: "⚙️ الإعدادات",
            description: "سياسات المادة والمساعدين",
            color: "text-gray-600",
            bg: "bg-gray-50",
        },
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            جاري التحميل...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        📚 موادي الدراسية
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        جميع المواد التي تدرسها مع كل المميزات والأدوات
                    </p>
                </div>

                {/* Features Overview */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="text-xl">
                            🎯 المميزات المتاحة لكل مادة
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {courseFeatures.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={index}
                                        className={`${feature.bg} dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Icon className={`w-5 h-5 ${feature.color} shrink-0 mt-0.5`} />
                                            <div>
                                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                                                    {feature.label}
                                                </h3>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Courses List */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        المواد ({sections.length})
                    </h2>
                    
                    {sections.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-gray-500">
                                لا توجد مواد مسندة إليك هذا الفصل الدراسي
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {sections.map((section) => (
                                <Card
                                    key={section.id}
                                    className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-blue-500"
                                    onClick={() => navigate(`/faculty/course/${section.id}`)}
                                >
                                    <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                                    {section.course.code}
                                                </CardTitle>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {section.course.nameAr}
                                                </p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    👥 عدد الطلاب:
                                                </span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {section._count?.enrollments || 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    📖 القسم:
                                                </span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {section.code}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    📅 الفصل:
                                                </span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {section.term.name}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/faculty/course/${section.id}`);
                                            }}
                                        >
                                            فتح المادة
                                            <ArrowRight className="w-4 h-4 mr-2" />
                                        </Button>

                                        {/* Features Preview */}
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                الأدوات المتاحة:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {courseFeatures.slice(0, 4).map((feature, idx) => {
                                                    const Icon = feature.icon;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400"
                                                        >
                                                            <Icon className={`w-3 h-3 ${feature.color}`} />
                                                        </div>
                                                    );
                                                })}
                                                <span className="text-xs text-gray-500">+4 المزيد</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
