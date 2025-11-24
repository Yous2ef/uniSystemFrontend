import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    Users,
    AlertCircle,
    FileText,
    Calendar,
    CheckCircle,
    ArrowLeft,
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
    schedules: {
        day: number;
        startTime: string;
        endTime: string;
        room?: string;
    }[];
    _count?: {
        enrollments: number;
    };
}

interface PendingTask {
    id: string;
    type: "urgent" | "week" | "completed";
    title: string;
    deadline?: string;
    sectionId?: string;
}

export default function FacultyDashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState<Section[]>([]);
    const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
    const [facultyData, setFacultyData] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            console.log("📊 Fetching faculty dashboard data...");

            // Get faculty profile by user ID
            const facultyResponse = await facultyService.getAll();
            console.log("Faculty response:", facultyResponse);

            if (facultyResponse.success) {
                const allFaculty = facultyResponse.data?.faculty || facultyResponse.data || [];
                const currentFaculty = allFaculty.find((f: any) => f.userId === user?.id);
                
                if (currentFaculty) {
                    setFacultyData(currentFaculty);
                    console.log("✅ Faculty data:", currentFaculty);

                    // Get sections for this faculty
                    const sectionsResponse = await facultyService.getSections(currentFaculty.id);
                    console.log("Sections response:", sectionsResponse);

                    if (sectionsResponse.success) {
                        const facultySections = sectionsResponse.data?.sections || sectionsResponse.data || [];
                        setSections(facultySections);
                        console.log("✅ Sections loaded:", facultySections.length);

                        // Generate pending tasks based on sections
                        generatePendingTasks(facultySections);
                    }
                } else {
                    console.warn("⚠️ No faculty record found for this user");
                }
            }
        } catch (error) {
            console.error("❌ Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const generatePendingTasks = (facultySections: Section[]) => {
        const tasks: PendingTask[] = [];
        
        // Add sample tasks (in real app, fetch from backend)
        facultySections.forEach((section) => {
            tasks.push({
                id: `attendance-${section.id}`,
                type: "week",
                title: `تسجيل حضور محاضرة ${section.course.nameAr}`,
                sectionId: section.id,
            });
        });

        setPendingTasks(tasks);
    };

    const getDayName = (day: number) => {
        const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
        return days[day] || "";
    };

    const getNextLecture = (schedules: any[]) => {
        if (!schedules || schedules.length === 0) return "لا يوجد جدول";
        
        const today = new Date().getDay();
        const nextSchedule = schedules.find(s => s.day >= today) || schedules[0];
        
        return `${getDayName(nextSchedule.day)} ${nextSchedule.startTime}`;
    };

    const navigateToCourse = (sectionId: string) => {
        navigate(`/faculty/course/${sectionId}`);
    };

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
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-lg p-6 text-white">
                    <h1 className="text-3xl font-bold">
                        👋 أهلاً {facultyData?.nameAr || "دكتور"}
                    </h1>
                    <p className="mt-2 text-blue-100 text-lg">
                        المواد اللي بتدرسها هذا الترم
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        عدد المواد
                                    </p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {sections.length}
                                    </p>
                                </div>
                                <BookOpen className="w-12 h-12 text-blue-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        إجمالي الطلاب
                                    </p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {sections.reduce((sum, s) => sum + (s._count?.enrollments || 0), 0)}
                                    </p>
                                </div>
                                <Users className="w-12 h-12 text-green-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        المهام المعلقة
                                    </p>
                                    <p className="text-3xl font-bold text-orange-600">
                                        {pendingTasks.length}
                                    </p>
                                </div>
                                <AlertCircle className="w-12 h-12 text-orange-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Courses Cards */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        📚 موادك ({sections.length})
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sections.length === 0 ? (
                            <Card className="col-span-full">
                                <CardContent className="p-6 text-center text-gray-500">
                                    لا توجد مواد مسندة إليك هذا الفصل الدراسي
                                </CardContent>
                            </Card>
                        ) : (
                            sections.map((section) => (
                                <Card
                                    key={section.id}
                                    className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500"
                                    onClick={() => navigateToCourse(section.id)}
                                >
                                    <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                        <CardTitle className="flex items-center justify-between">
                                            <div>
                                                <div className="text-lg font-bold">
                                                    {section.course.code}
                                                </div>
                                                <div className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                                                    {section.course.nameAr}
                                                </div>
                                            </div>
                                            <BookOpen className="w-6 h-6 text-blue-500" />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                👥 الطلاب:
                                            </span>
                                            <span className="font-semibold">
                                                {section._count?.enrollments || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                📖 القسم:
                                            </span>
                                            <span className="font-semibold">
                                                {section.code}
                                            </span>
                                        </div>
                                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                <span>اضغط لعرض 8 أدوات الإدارة</span>
                                                <ArrowLeft className="w-4 h-4 animate-pulse" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Pending Tasks */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            المهام المعلقة
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Urgent Tasks */}
                        <div>
                            <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                عاجل:
                            </h3>
                            <div className="space-y-2 mr-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    لا توجد مهام عاجلة حالياً
                                </p>
                            </div>
                        </div>

                        {/* This Week Tasks */}
                        <div>
                            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                هذا الأسبوع:
                            </h3>
                            <div className="space-y-2 mr-6">
                                {pendingTasks
                                    .filter((t) => t.type === "week")
                                    .slice(0, 3)
                                    .map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="text-gray-600 dark:text-gray-400">
                                                ├─ {task.title}
                                            </span>
                                            {task.sectionId && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        navigateToCourse(task.sectionId!)
                                                    }
                                                >
                                                    فتح
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                {pendingTasks.filter((t) => t.type === "week")
                                    .length === 0 && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        لا توجد مهام هذا الأسبوع
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Completed Tasks */}
                        <div>
                            <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                مكتمل:
                            </h3>
                            <div className="space-y-2 mr-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    ✅ جميع المهام السابقة مكتملة
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
