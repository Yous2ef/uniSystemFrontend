import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowRight,
    BookOpen,
    Calendar,
    Clock,
    User,
    MapPin,
    Award,
    FileText,
    Bell,
    Download,
    AlertCircle,
} from "lucide-react";
import { enrollmentsService } from "@/services/api";

interface SubjectDetails {
    enrollment: {
        id: string;
        status: string;
        enrolledAt: string;
    };
    section: {
        id: string;
        code: string;
        capacity: number;
        course: {
            id: string;
            code: string;
            nameAr: string;
            nameEn: string;
            credits: number;
            description?: string;
        };
        term: {
            id: string;
            name: string;
            type: string;
            status: string;
        };
        faculty: {
            id: string;
            nameAr: string;
            nameEn: string;
            email?: string;
            officeLocation?: string;
        };
        schedules: Array<{
            id: string;
            day: number;
            startTime: string;
            endTime: string;
            room: string;
        }>;
    };
    grades?: {
        components: Array<{
            name: string;
            weight: number;
            score?: number;
            maxScore: number;
        }>;
        finalGrade?: {
            total: number;
            letterGrade: string;
            gpaPoints: number;
        };
    };
    attendance?: {
        present: number;
        absent: number;
        excused: number;
        percentage: number;
    };
}

const DAYS_MAP: Record<number, string> = {
    0: "الأحد",
    1: "الاثنين",
    2: "الثلاثاء",
    3: "الأربعاء",
    4: "الخميس",
};

export default function SubjectDetailsPage() {
    const { subjectId } = useParams<{ subjectId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [subject, setSubject] = useState<SubjectDetails | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        if (subjectId) {
            fetchSubjectDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subjectId]);

    const fetchSubjectDetails = async () => {
        try {
            setLoading(true);
            console.log("📚 Fetching subject details for section:", subjectId);

            // Get enrollments filtered by this section
            const response = await enrollmentsService.getMyEnrollments({
                sectionId: subjectId,
                status: "ENROLLED",
            });

            console.log("📦 Subject response:", response);

            if (response.success) {
                const data = Array.isArray(response.data) ? response.data : [];
                if (data.length > 0) {
                    const enrollment = data[0];
                    setSubject({
                        enrollment: {
                            id: enrollment.id,
                            status: enrollment.status,
                            enrolledAt: enrollment.enrolledAt,
                        },
                        section: enrollment.section,
                        // TODO: Fetch grades and attendance when endpoints are ready
                    });
                }
            }
        } catch (error) {
            console.error("❌ Error fetching subject details:", error);
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
                            جاري تحميل تفاصيل المادة...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!subject) {
        return (
            <DashboardLayout>
                <Card>
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            لم يتم العثور على المادة
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            المادة المطلوبة غير موجودة أو غير مسجلة
                        </p>
                        <Button onClick={() => navigate("/student/subjects")}>
                            العودة للمواد
                        </Button>
                    </CardContent>
                </Card>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/student/subjects")}
                        className="mb-4 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        العودة للمواد
                    </Button>

                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {subject.section.course.nameAr}
                                </h1>
                                <Badge variant="secondary" className="text-lg">
                                    {subject.section.course.code}
                                </Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                {subject.section.course.nameEn}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                <span>شعبة {subject.section.code}</span>
                                <span>•</span>
                                <span>{subject.section.term.name}</span>
                                <span>•</span>
                                <span>
                                    {subject.section.course.credits} ساعة معتمدة
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full">
                    <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                        <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                        <TabsTrigger value="schedule">الجدول</TabsTrigger>
                        <TabsTrigger value="grades">الدرجات</TabsTrigger>
                        <TabsTrigger value="materials">المواد</TabsTrigger>
                        <TabsTrigger value="announcements">
                            الإعلانات
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Course Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="w-5 h-5" />
                                        معلومات المادة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            كود المادة:
                                        </span>
                                        <span className="font-medium">
                                            {subject.section.course.code}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            الساعات المعتمدة:
                                        </span>
                                        <span className="font-medium">
                                            {subject.section.course.credits}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            الشعبة:
                                        </span>
                                        <span className="font-medium">
                                            {subject.section.code}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            الفصل الدراسي:
                                        </span>
                                        <span className="font-medium">
                                            {subject.section.term.name}
                                        </span>
                                    </div>
                                    {subject.section.course.description && (
                                        <div className="pt-3 border-t dark:border-gray-700">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {
                                                    subject.section.course
                                                        .description
                                                }
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Instructor Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        معلومات المدرس
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            الاسم:
                                        </span>
                                        <span className="font-medium">
                                            {subject.section.faculty.nameAr}
                                        </span>
                                    </div>
                                    {subject.section.faculty.email && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                البريد الإلكتروني:
                                            </span>
                                            <a
                                                href={`mailto:${subject.section.faculty.email}`}
                                                className="font-medium text-blue-600 hover:underline">
                                                {subject.section.faculty.email}
                                            </a>
                                        </div>
                                    )}
                                    {subject.section.faculty.officeLocation && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                المكتب:
                                            </span>
                                            <span className="font-medium">
                                                {
                                                    subject.section.faculty
                                                        .officeLocation
                                                }
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            {subject.grades?.finalGrade && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="w-5 h-5" />
                                            الدرجة النهائية
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                    {
                                                        subject.grades
                                                            .finalGrade
                                                            .letterGrade
                                                    }
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {subject.grades.finalGrade.total.toFixed(
                                                        2
                                                    )}
                                                    %
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-semibold">
                                                    {subject.grades.finalGrade.gpaPoints.toFixed(
                                                        2
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    GPA Points
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Attendance */}
                            {subject.attendance && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            الحضور
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center mb-4">
                                            <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                                                {subject.attendance.percentage}%
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                نسبة الحضور
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                            <div>
                                                <div className="font-semibold text-green-600">
                                                    {subject.attendance.present}
                                                </div>
                                                <div className="text-gray-500">
                                                    حاضر
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-red-600">
                                                    {subject.attendance.absent}
                                                </div>
                                                <div className="text-gray-500">
                                                    غائب
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-yellow-600">
                                                    {subject.attendance.excused}
                                                </div>
                                                <div className="text-gray-500">
                                                    بعذر
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Schedule Tab */}
                    <TabsContent value="schedule" className="space-y-4 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    مواعيد المحاضرات
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {subject.section.schedules.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">
                                        لا يوجد جدول محدد لهذه المادة
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {subject.section.schedules.map(
                                            (schedule) => (
                                                <div
                                                    key={schedule.id}
                                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-center min-w-20">
                                                            <div className="font-semibold text-lg">
                                                                {
                                                                    DAYS_MAP[
                                                                        schedule
                                                                            .day
                                                                    ]
                                                                }
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">
                                                                {
                                                                    schedule.startTime
                                                                }{" "}
                                                                -{" "}
                                                                {
                                                                    schedule.endTime
                                                                }
                                                            </div>
                                                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                                                <MapPin className="w-4 h-4" />
                                                                {schedule.room ||
                                                                    "غير محدد"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Exam Schedule - Placeholder for future */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    مواعيد الامتحانات
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-gray-500 py-8">
                                    سيتم إضافة مواعيد الامتحانات قريباً
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Grades Tab */}
                    <TabsContent value="grades" className="space-y-4 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5" />
                                    تفاصيل الدرجات
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!subject.grades?.components ||
                                subject.grades.components.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">
                                        لم يتم نشر الدرجات بعد
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {subject.grades.components.map(
                                            (component, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="font-medium">
                                                            {component.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            الوزن:{" "}
                                                            {component.weight}%
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {component.score !==
                                                        undefined ? (
                                                            <>
                                                                <div className="text-2xl font-bold">
                                                                    {
                                                                        component.score
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    من{" "}
                                                                    {
                                                                        component.maxScore
                                                                    }
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-sm text-gray-400">
                                                                قيد التقييم
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Materials Tab */}
                    <TabsContent value="materials" className="space-y-4 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Download className="w-5 h-5" />
                                    المواد الدراسية
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-gray-500 py-8">
                                    لا توجد مواد دراسية متاحة حالياً
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Announcements Tab */}
                    <TabsContent
                        value="announcements"
                        className="space-y-4 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    الإعلانات
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-gray-500 py-8">
                                    لا توجد إعلانات حالياً
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
