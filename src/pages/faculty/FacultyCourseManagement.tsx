import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    BarChart3,
    Calendar,
    FileText,
    MessageSquare,
    AlertCircle,
    TrendingUp,
    Settings,
} from "lucide-react";
import { sectionsService } from "@/services/api";
import StudentsTab from "@/components/faculty/StudentsTab";
import GradesTab from "@/components/faculty/GradesTab";
import AttendanceTab from "@/components/faculty/AttendanceTab";
import MaterialsTab from "@/components/faculty/MaterialsTab";
import AnnouncementsTab from "@/components/faculty/AnnouncementsTab";
import AppealsTab from "@/components/faculty/AppealsTab";
import AnalyticsTab from "@/components/faculty/AnalyticsTab";
import SettingsTab from "@/components/faculty/SettingsTab";

export default function FacultyCourseManagement() {
    const { sectionId } = useParams<{ sectionId: string }>();
    const [loading, setLoading] = useState(true);
    const [section, setSection] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("students");

    console.log("🔍 FacultyCourseManagement loaded with sectionId:", sectionId);

    useEffect(() => {
        if (sectionId) {
            fetchSectionData();
        }
    }, [sectionId]);

    const fetchSectionData = async () => {
        try {
            setLoading(true);
            console.log("📚 Fetching section data for:", sectionId);

            const data = await sectionsService.getById(sectionId!);
            console.log("Section response:", data);

            if (data) {
                setSection(data);
                console.log("✅ Section data set successfully");
            } else {
                console.error("❌ No section data returned");
            }
        } catch (error) {
            console.error("❌ Error fetching section:", error);
        } finally {
            setLoading(false);
        }
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

    if (!section) {
        return (
            <DashboardLayout>
                <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                        المادة غير موجودة
                    </CardContent>
                </Card>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Course Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        📖 {section.course?.code} - {section.course?.nameAr}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        القسم {section.code} - {section.term?.name}
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        إجمالي الطلاب
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {section._count?.enrollments || 0}
                                    </p>
                                </div>
                                <Users className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        متوسط الدرجات
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        --
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        نسبة الحضور
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        --
                                    </p>
                                </div>
                                <Calendar className="w-8 h-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        المواد المرفوعة
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {section._count?.materials || 0}
                                    </p>
                                </div>
                                <FileText className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Card>
                    <CardHeader>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2">
                                <TabsTrigger value="students" className="gap-2">
                                    <Users className="w-4 h-4" />
                                    <span className="hidden sm:inline">الطلاب</span>
                                </TabsTrigger>
                                <TabsTrigger value="grades" className="gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    <span className="hidden sm:inline">الدرجات</span>
                                </TabsTrigger>
                                <TabsTrigger value="attendance" className="gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span className="hidden sm:inline">الحضور</span>
                                </TabsTrigger>
                                <TabsTrigger value="materials" className="gap-2">
                                    <FileText className="w-4 h-4" />
                                    <span className="hidden sm:inline">المحتوى</span>
                                </TabsTrigger>
                                <TabsTrigger value="announcements" className="gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="hidden sm:inline">الإعلانات</span>
                                </TabsTrigger>
                                <TabsTrigger value="appeals" className="gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="hidden sm:inline">التظلمات</span>
                                </TabsTrigger>
                                <TabsTrigger value="analytics" className="gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="hidden sm:inline">التحليلات</span>
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="gap-2">
                                    <Settings className="w-4 h-4" />
                                    <span className="hidden sm:inline">الإعدادات</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab}>
                            <TabsContent value="students">
                                <StudentsTab sectionId={sectionId!} />
                            </TabsContent>
                            <TabsContent value="grades">
                                <GradesTab sectionId={sectionId!} />
                            </TabsContent>
                            <TabsContent value="attendance">
                                <AttendanceTab sectionId={sectionId!} />
                            </TabsContent>
                            <TabsContent value="materials">
                                <MaterialsTab sectionId={sectionId!} />
                            </TabsContent>
                            <TabsContent value="announcements">
                                <AnnouncementsTab sectionId={sectionId!} />
                            </TabsContent>
                            <TabsContent value="appeals">
                                <AppealsTab sectionId={sectionId!} />
                            </TabsContent>
                            <TabsContent value="analytics">
                                <AnalyticsTab sectionId={sectionId!} />
                            </TabsContent>
                            <TabsContent value="settings">
                                <SettingsTab sectionId={sectionId!} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
