import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    GraduationCap,
    BookOpen,
    Award,
    TrendingUp,
    Settings,
    Trash2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { studentsService, enrollmentsService } from "@/services/api";
import AdminStudentManagementModal from "@/components/modals/AdminStudentManagementModal";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts";

interface StudentDetails {
    id: string;
    studentCode: string;
    nameEn: string;
    nameAr: string;
    email: string;
    phone?: string;
    nationalId?: string;
    dateOfBirth?: string;
    gender?: string;
    admissionDate: string;
    status: string;
    batch: {
        id: string;
        name: string;
        year: number;
        curriculum: {
            id: string;
            name: string;
            totalCredits: number;
        };
    };
    department?: {
        id: string;
        code: string;
        nameEn: string;
        nameAr: string;
    };
    academicStanding?: {
        cgpa: number;
        totalCredits: number;
        standing: string;
    };
}

interface Enrollment {
    id: string;
    status: string;
    enrolledAt: string;
    section: {
        id: string;
        code: string;
        course: {
            nameAr: string;
            nameEn: string;
            credits: number;
        };
        term: {
            name: string;
            type: string;
        };
    };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function StudentDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<StudentDetails | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [managementModalOpen, setManagementModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchStudentDetails();
            fetchEnrollments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchStudentDetails = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const response = await studentsService.getById(id);
            if (response.success) {
                setStudent(response.data);
            }
        } catch (error) {
            console.error("Error fetching student details:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrollments = async () => {
        if (!id) return;

        try {
            const response = await enrollmentsService.getAll({ studentId: id });
            if (response.success) {
                setEnrollments(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching enrollments:", error);
        }
    };

    const handleDropEnrollment = async (
        enrollmentId: string,
        courseName: string
    ) => {
        if (!confirm(`هل تريد حذف تسجيل الطالب من مادة ${courseName}؟`)) {
            return;
        }

        try {
            // Admin can bypass drop period
            await enrollmentsService.dropEnrollment(enrollmentId, true);
            alert("تم حذف التسجيل بنجاح");
            fetchEnrollments(); // Refresh enrollments list
        } catch (error) {
            console.error("Error dropping enrollment:", error);
            alert("فشل حذف التسجيل");
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            "default" | "secondary" | "destructive" | "outline"
        > = {
            ACTIVE: "default",
            DEFERRED: "secondary",
            DISMISSED: "destructive",
            GRADUATED: "outline",
        };
        const labels: Record<string, string> = {
            ACTIVE: "نشط",
            DEFERRED: "مؤجل",
            DISMISSED: "مفصول",
            GRADUATED: "متخرج",
        };
        return (
            <Badge
                variant={variants[status] || "default"}
                className="text-sm px-3 py-1">
                {labels[status] || status}
            </Badge>
        );
    };

    const getStandingBadge = (standing: string) => {
        const variants: Record<
            string,
            "default" | "secondary" | "destructive" | "outline"
        > = {
            GOOD_STANDING: "default",
            ACADEMIC_WARNING: "secondary",
            ACADEMIC_PROBATION: "destructive",
            ACADEMIC_DISMISSAL: "destructive",
            NOT_CALCULATED: "outline",
        };
        const labels: Record<string, string> = {
            GOOD_STANDING: "وضع أكاديمي جيد",
            ACADEMIC_WARNING: "إنذار أكاديمي",
            ACADEMIC_PROBATION: "مراقبة أكاديمية",
            ACADEMIC_DISMISSAL: "فصل أكاديمي",
            NOT_CALCULATED: "غير محسوب",
        };
        return (
            <Badge
                variant={variants[standing] || "outline"}
                className="text-sm px-3 py-1">
                {labels[standing] || standing}
            </Badge>
        );
    };

    const formatDate = (date?: string) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Process real enrollment data for charts
    const creditsDistribution = [
        {
            name: "ساعات مكتسبة",
            value: student?.academicStanding?.totalCredits || 0,
        },
        {
            name: "ساعات متبقية",
            value:
                (student?.batch.curriculum.totalCredits || 0) -
                (student?.academicStanding?.totalCredits || 0),
        },
    ];

    // Group enrollments by term for GPA trend (using current CGPA as placeholder)
    const semesterGPAData = enrollments
        .filter((e) => e.section?.term)
        .reduce((acc: { semester: string; gpa: number }[], enrollment) => {
            const termName = enrollment.section.term.name;
            const existing = acc.find((item) => item.semester === termName);
            if (!existing && acc.length < 5) {
                acc.push({
                    semester: termName,
                    gpa: student?.academicStanding?.cgpa || 0,
                });
            }
            return acc;
        }, []);

    // Count enrollments by status
    const enrollmentStats = enrollments.reduce(
        (acc: Record<string, number>, enrollment) => {
            const status = enrollment.status || "ENROLLED";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        },
        {}
    );

    const enrollmentStatusData = Object.keys(enrollmentStats).map((status) => ({
        status:
            status === "ENROLLED"
                ? "مسجل"
                : status === "COMPLETED"
                ? "منتهي"
                : status === "DROPPED"
                ? "محذوف"
                : status,
        count: enrollmentStats[status],
    }));

    if (loading) {
        return (
            <DashboardLayout>
                <div className="text-center py-8 text-gray-500">
                    جاري التحميل...
                </div>
            </DashboardLayout>
        );
    }

    if (!student) {
        return (
            <DashboardLayout>
                <div className="text-center py-8 text-gray-500">
                    لم يتم العثور على بيانات الطالب
                </div>
            </DashboardLayout>
        );
    }

    const completionPercentage =
        ((student.academicStanding?.totalCredits || 0) /
            student.batch.curriculum.totalCredits) *
        100;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate("/students")}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {student.nameAr}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                {student.studentCode} - {student.nameEn}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(student.status)}
                        <Button
                            onClick={() => setManagementModalOpen(true)}
                            className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            إدارة الطالب
                        </Button>
                    </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        المعدل التراكمي
                                    </p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {student.academicStanding?.cgpa &&
                                        student.academicStanding.cgpa > 0
                                            ? student.academicStanding.cgpa.toFixed(
                                                  2
                                              )
                                            : "-"}
                                    </p>
                                </div>
                                <Award className="w-10 h-10 text-blue-600 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        الساعات المكتسبة
                                    </p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {student.academicStanding
                                            ?.totalCredits || 0}
                                    </p>
                                </div>
                                <BookOpen className="w-10 h-10 text-green-600 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        نسبة الإنجاز
                                    </p>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {completionPercentage.toFixed(1)}%
                                    </p>
                                </div>
                                <TrendingUp className="w-10 h-10 text-purple-600 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        الوضع الأكاديمي
                                    </p>
                                    <div className="mt-2">
                                        {getStandingBadge(
                                            student.academicStanding
                                                ?.standing || "NOT_CALCULATED"
                                        )}
                                    </div>
                                </div>
                                <GraduationCap className="w-10 h-10 text-orange-600 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* GPA Trend Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>تطور المعدل الفصلي</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {semesterGPAData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={semesterGPAData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="semester" />
                                        <YAxis domain={[0, 4]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="gpa"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            name="المعدل الفصلي"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    لا توجد بيانات معدلات فصلية
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Credits Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>توزيع الساعات الدراسية</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={creditsDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) =>
                                            `${name}: ${value}`
                                        }
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value">
                                        {creditsDistribution.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        COLORS[
                                                            index %
                                                                COLORS.length
                                                        ]
                                                    }
                                                />
                                            )
                                        )}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Enrollment Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>توزيع حالات التسجيل</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {enrollmentStatusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={enrollmentStatusData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="status" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="count"
                                            fill="#10b981"
                                            name="عدد المقررات"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    لا توجد بيانات تسجيل
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Progress Bar Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>التقدم في الخطة الدراسية</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">
                                        الساعات المكتسبة
                                    </span>
                                    <span className="text-sm font-medium">
                                        {student.academicStanding
                                            ?.totalCredits || 0}{" "}
                                        /{" "}
                                        {student.batch.curriculum.totalCredits}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div
                                        className="bg-blue-600 h-4 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(
                                                completionPercentage,
                                                100
                                            )}%`,
                                        }}></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {student.batch.curriculum.totalCredits}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        إجمالي الساعات المطلوبة
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="text-2xl font-bold text-red-600">
                                        {student.batch.curriculum.totalCredits -
                                            (student.academicStanding
                                                ?.totalCredits || 0)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        ساعات متبقية
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                المعلومات الشخصية
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            الاسم بالعربية
                                        </label>
                                        <p className="text-base font-semibold mt-1">
                                            {student.nameAr}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            الاسم بالإنجليزية
                                        </label>
                                        <p className="text-base font-semibold mt-1">
                                            {student.nameEn}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            الرقم الجامعي
                                        </label>
                                        <p className="text-base font-semibold mt-1">
                                            {student.studentCode}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            الرقم القومي
                                        </label>
                                        <p className="text-base mt-1">
                                            {student.nationalId || "-"}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            النوع
                                        </label>
                                        <p className="text-base mt-1">
                                            {student.gender === "MALE"
                                                ? "ذكر"
                                                : student.gender === "FEMALE"
                                                ? "أنثى"
                                                : "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            تاريخ الميلاد
                                        </label>
                                        <p className="text-base mt-1">
                                            {formatDate(student.dateOfBirth)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                معلومات الاتصال والقبول
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            البريد الإلكتروني
                                        </label>
                                        <p className="text-base mt-1">
                                            {student.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            رقم الهاتف
                                        </label>
                                        <p className="text-base mt-1">
                                            {student.phone || "-"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            تاريخ القبول
                                        </label>
                                        <p className="text-base mt-1">
                                            {formatDate(student.admissionDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Academic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            المعلومات الأكاديمية
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    الدفعة
                                </label>
                                <p className="text-lg font-semibold mt-1">
                                    {student.batch.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    سنة {student.batch.year}
                                </p>
                            </div>
                            {student.department && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        القسم
                                    </label>
                                    <p className="text-lg font-semibold mt-1">
                                        {student.department.nameAr}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {student.department.code}
                                    </p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    الخطة الدراسية
                                </label>
                                <p className="text-lg font-semibold mt-1">
                                    {student.batch.curriculum.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {student.batch.curriculum.totalCredits} ساعة
                                    معتمدة
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Enrolled Courses */}
                {enrollments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                المواد المسجلة ({enrollments.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {enrollments.map((enrollment) => (
                                    <div
                                        key={enrollment.id}
                                        className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-semibold text-lg">
                                                        {
                                                            enrollment.section
                                                                .course.nameAr
                                                        }
                                                    </h4>
                                                    <Badge variant="secondary">
                                                        {(
                                                            enrollment.section
                                                                .course as any
                                                        )?.code || "N/A"}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    {
                                                        enrollment.section
                                                            .course.nameEn
                                                    }
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>
                                                        الفصل:{" "}
                                                        {
                                                            enrollment.section
                                                                .term.name
                                                        }
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        الساعات:{" "}
                                                        {
                                                            enrollment.section
                                                                .course.credits
                                                        }
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        تاريخ التسجيل:{" "}
                                                        {new Date(
                                                            enrollment.enrolledAt
                                                        ).toLocaleDateString(
                                                            "ar-EG"
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        enrollment.status ===
                                                        "ENROLLED"
                                                            ? "default"
                                                            : enrollment.status ===
                                                              "COMPLETED"
                                                            ? "outline"
                                                            : "secondary"
                                                    }>
                                                    {enrollment.status ===
                                                    "ENROLLED"
                                                        ? "مسجل"
                                                        : enrollment.status ===
                                                          "COMPLETED"
                                                        ? "منتهي"
                                                        : enrollment.status ===
                                                          "DROPPED"
                                                        ? "محذوف"
                                                        : enrollment.status}
                                                </Badge>
                                                {enrollment.status ===
                                                    "ENROLLED" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDropEnrollment(
                                                                enrollment.id,
                                                                enrollment
                                                                    .section
                                                                    .course
                                                                    .nameAr
                                                            );
                                                        }}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Admin Management Modal */}
            <AdminStudentManagementModal
                studentId={id || null}
                studentData={student}
                open={managementModalOpen}
                onClose={() => setManagementModalOpen(false)}
                onSuccess={() => {
                    fetchStudentDetails();
                    fetchEnrollments();
                }}
            />
        </DashboardLayout>
    );
}
