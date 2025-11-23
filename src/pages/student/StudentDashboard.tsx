import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    GraduationCap,
    BookOpen,
    Calendar,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
} from "lucide-react";
import { studentsService, enrollmentsService } from "@/services/api";

interface AcademicStanding {
    cgpa: number;
    termGpa: number;
    totalCredits: number;
    requiredCredits: number;
    standing: string;
    creditsThisTerm: number;
    expectedGraduation: string;
}

interface Alert {
    id: string;
    type: "warning" | "info" | "success";
    title: string;
    message: string;
    date: string;
}

export default function StudentDashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [academicData, setAcademicData] = useState<AcademicStanding | null>(
        null
    );
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            console.log("📊 Fetching student dashboard data...");

            // Fetch student profile and academic data
            const profileResponse = await studentsService.getProfile();
            console.log("✅ Profile response:", profileResponse);

            if (profileResponse.success) {
                const student = profileResponse.data;
                console.log("👤 Student data:", student);

                // Get CGPA from cumulative GPA if exists
                const cgpa = student.cumulativeGpa?.cgpa || 0;
                const totalCredits = student.cumulativeGpa?.totalCredits || 0;
                const academicStanding =
                    student.cumulativeGpa?.academicStanding || "GOOD_STANDING";

                // Calculate required credits from curriculum
                const requiredCredits =
                    student.batch?.curriculum?.totalCredits || 132;

                // Get current term enrollments to calculate term GPA and credits
                const enrollmentsRes = await enrollmentsService.getAll({
                    studentId: student.id,
                    status: "ENROLLED",
                });

                console.log("📚 Current enrollments:", enrollmentsRes);

                const currentEnrollments = Array.isArray(enrollmentsRes)
                    ? enrollmentsRes
                    : enrollmentsRes.data || [];

                const creditsThisTerm = currentEnrollments.reduce(
                    (sum: number, e: unknown) => {
                        const enrollment = e as {
                            section?: { course?: { credits?: number } };
                        };
                        return sum + (enrollment.section?.course?.credits || 0);
                    },
                    0
                );

                // Academic standing will be translated via i18n

                // Calculate expected graduation (4 years from admission)
                const admissionYear = new Date(
                    student.admissionDate
                ).getFullYear();
                const expectedGradYear = admissionYear + 4;

                setAcademicData({
                    cgpa: cgpa,
                    termGpa: cgpa, // Use CGPA as term GPA for now
                    totalCredits: totalCredits,
                    requiredCredits: requiredCredits,
                    standing: academicStanding,
                    creditsThisTerm: creditsThisTerm,
                    expectedGraduation: `${expectedGradYear}`,
                });

                // Clear alerts for now (can be populated later based on attendance, etc.)
                setAlerts([]);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStandingColor = (standing: string) => {
        if (standing === "GOOD_STANDING") return "default";
        if (standing === "ACADEMIC_WARNING") return "secondary";
        return "destructive";
    };

    const progressPercentage = academicData
        ? (academicData.totalCredits / academicData.requiredCredits) * 100
        : 0;

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            {t("common.loading")}
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
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        👋 {t("student.dashboard.welcome")}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t("student.dashboard.academicOverview")}
                    </p>
                </div>

                {/* Academic Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {t("student.dashboard.cgpa")}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {academicData?.cgpa.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t("common.from")} 4.0
                                    </p>
                                </div>
                                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {t("student.dashboard.termGpa")}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {academicData?.termGpa.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {academicData?.creditsThisTerm} {t("student.registration.credits")}
                                    </p>
                                </div>
                                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                                    <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {t("student.dashboard.earnedCredits")}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {academicData?.totalCredits}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t("common.from")} {academicData?.requiredCredits} {t("student.registration.credits")}
                                    </p>
                                </div>
                                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                                    <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {t("student.dashboard.academicStanding")}
                                    </p>
                                    <Badge
                                        variant={getStandingColor(
                                            academicData?.standing || ""
                                        )}
                                        className="mt-2">
                                        {t(`student.dashboard.standing.${academicData?.standing}`)}
                                    </Badge>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {t("student.dashboard.expectedGraduation")}:{" "}
                                        {academicData?.expectedGraduation}
                                    </p>
                                </div>
                                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                                    <CheckCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Bar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {t("student.dashboard.progressToGraduation")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {academicData?.totalCredits} {t("common.from")}{" "}
                                    {academicData?.requiredCredits} {t("student.registration.credits")}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {progressPercentage.toFixed(0)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                <div
                                    className="bg-linear-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t("student.dashboard.remainingCredits")}:{" "}
                                {(academicData?.requiredCredits || 0) -
                                    (academicData?.totalCredits || 0)}{" "}
                                {t("student.registration.credits")}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Alerts Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {t("student.dashboard.alerts")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {alerts.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    {t("student.dashboard.noAlerts")}
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {alerts.map((alert) => (
                                        <div
                                            key={alert.id}
                                            className={`p-4 rounded-lg border ${
                                                alert.type === "warning"
                                                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                                                    : alert.type === "info"
                                                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                                                    : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                            }`}>
                                            <div className="flex items-start gap-3">
                                                <AlertCircle
                                                    className={`w-5 h-5 mt-0.5 ${
                                                        alert.type === "warning"
                                                            ? "text-yellow-600 dark:text-yellow-400"
                                                            : alert.type ===
                                                              "info"
                                                            ? "text-blue-600 dark:text-blue-400"
                                                            : "text-green-600 dark:text-green-400"
                                                    }`}
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {alert.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {alert.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                {t("student.dashboard.quickActions")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        navigate("/student/registration")
                                    }
                                    className="h-24 flex flex-col items-center justify-center gap-2">
                                    <Calendar className="w-6 h-6" />
                                    <span className="text-sm">{t("student.dashboard.registerCourses")}</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/student/grades")}
                                    className="h-24 flex flex-col items-center justify-center gap-2">
                                    <BookOpen className="w-6 h-6" />
                                    <span className="text-sm">{t("student.dashboard.viewGrades")}</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        navigate("/student/schedule")
                                    }
                                    className="h-24 flex flex-col items-center justify-center gap-2">
                                    <Clock className="w-6 h-6" />
                                    <span className="text-sm">{t("student.dashboard.checkSchedule")}</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        navigate("/student/attendance")
                                    }
                                    className="h-24 flex flex-col items-center justify-center gap-2">
                                    <AlertCircle className="w-6 h-6" />
                                    <span className="text-sm">{t("student.dashboard.trackAttendance")}</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
