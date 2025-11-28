import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    FileText,
    XCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { enrollmentsService, attendanceService } from "@/services/api";

interface CourseAttendance {
    enrollmentId: string;
    courseCode: string;
    courseName: string;
    totalSessions: number;
    attendedSessions: number;
    absentSessions: number;
    excusedAbsences: number;
    attendancePercentage: number;
    isWarning: boolean;
    isCritical: boolean;
}

interface AttendanceRecord {
    id: string;
    date: string;
    sessionNumber: number;
    status: "PRESENT" | "ABSENT" | "EXCUSED";
    notes?: string;
}

export default function StudentAttendancePage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<CourseAttendance[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [attendanceRecords, setAttendanceRecords] = useState<
        AttendanceRecord[]
    >([]);

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchAttendanceRecords(selectedCourse);
        }
    }, [selectedCourse]);

    const fetchAttendanceRecords = async (enrollmentId: string) => {
        try {
            console.log(`📋 Fetching attendance records for enrollment ${enrollmentId}...`);
            
            const response = await attendanceService.getAll({
                enrollmentId,
            });

            console.log("✅ Attendance records response:", response);

            if (response.success) {
                const records = response.data?.attendances || [];
                const formattedRecords: AttendanceRecord[] = records.map(
                    (record: any, index: number) => ({
                        id: record.id,
                        date: new Date(record.sessionDate).toISOString().split('T')[0],
                        sessionNumber: index + 1,
                        status: record.status,
                        notes: record.excuse || undefined,
                    })
                );
                setAttendanceRecords(formattedRecords);
            }
        } catch (error) {
            console.error("Error fetching attendance records:", error);
            setAttendanceRecords([]);
        }
    };

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            console.log("📊 Fetching student attendance data...");

            // Get student's enrollments
            const enrollmentsRes = await enrollmentsService.getMyEnrollments({
                status: "ENROLLED",
            });

            console.log("✅ Enrollments response:", enrollmentsRes);

            if (enrollmentsRes.success) {
                // The data is directly an array, not wrapped in enrollments
                const enrollments = Array.isArray(enrollmentsRes.data) 
                    ? enrollmentsRes.data 
                    : enrollmentsRes.data?.enrollments || [];
                console.log("📚 Processing enrollments:", enrollments);
                console.log("📊 Total enrollments found:", enrollments.length);

                if (enrollments.length === 0) {
                    console.log("⚠️ No enrollments found for student");
                    setCourses([]);
                    setLoading(false);
                    return;
                }

                // For each enrollment, get attendance stats
                const coursesData: CourseAttendance[] = await Promise.all(
                    enrollments.map(async (enrollment: any) => {
                        try {
                            const statsRes = await attendanceService.getStats(
                                enrollment.id
                            );

                            const stats = statsRes.success
                                ? statsRes.data
                                : {
                                      totalSessions: 0,
                                      presentCount: 0,
                                      absentCount: 0,
                                      excusedCount: 0,
                                      attendancePercentage: 0,
                                  };

                            const attendancePercentage =
                                stats.attendancePercentage || 0;
                            const isWarning = attendancePercentage < 85;
                            const isCritical = attendancePercentage < 75;

                            return {
                                enrollmentId: enrollment.id,
                                courseCode:
                                    enrollment.section?.course?.code || "N/A",
                                courseName:
                                    enrollment.section?.course?.nameAr ||
                                    enrollment.section?.course?.nameEn ||
                                    "Unknown Course",
                                totalSessions: stats.totalSessions || 0,
                                attendedSessions: stats.presentCount || 0,
                                absentSessions: stats.absentCount || 0,
                                excusedAbsences: stats.excusedCount || 0,
                                attendancePercentage,
                                isWarning,
                                isCritical,
                            };
                        } catch (error) {
                            console.error(
                                `Error fetching stats for enrollment ${enrollment.id}:`,
                                error
                            );
                            return {
                                enrollmentId: enrollment.id,
                                courseCode:
                                    enrollment.section?.course?.code || "N/A",
                                courseName:
                                    enrollment.section?.course?.nameAr ||
                                    enrollment.section?.course?.nameEn ||
                                    "Unknown Course",
                                totalSessions: 0,
                                attendedSessions: 0,
                                absentSessions: 0,
                                excusedAbsences: 0,
                                attendancePercentage: 0,
                                isWarning: false,
                                isCritical: false,
                            };
                        }
                    })
                );

                console.log("📈 Courses data with stats:", coursesData);
                setCourses(coursesData);
            }
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PRESENT":
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case "ABSENT":
                return <XCircle className="w-5 h-5 text-red-600" />;
            case "EXCUSED":
                return <FileText className="w-5 h-5 text-blue-600" />;
            default:
                return null;
        }
    };

    const getStatusColor = (percentage: number) => {
        if (percentage >= 85) return "text-green-600 dark:text-green-400";
        if (percentage >= 75) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 85) return "bg-green-600";
        if (percentage >= 75) return "bg-yellow-600";
        return "bg-red-600";
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            {t("student.attendance.loadingData")}
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        👁️ {t("student.attendance.title")}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t("student.attendance.subtitle")}
                    </p>
                </div>

                {/* Critical Warnings */}
                {courses.some((c) => c.isCritical) && (
                    <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-800 dark:text-red-300">
                            <strong>{t("student.attendance.criticalWarning")}</strong> {t("student.attendance.criticalMessage")}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Attendance Cards */}
                {courses.length === 0 ? (
                    <Card className="p-12">
                        <CardContent className="text-center">
                            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                لا توجد مقررات مسجلة
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                لم يتم العثور على أي مقررات مسجلة في الفصل الدراسي الحالي
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card
                            key={course.enrollmentId}
                            className={`cursor-pointer transition-all hover:shadow-lg ${
                                selectedCourse === course.enrollmentId
                                    ? "ring-2 ring-blue-500"
                                    : ""
                            }`}
                            onClick={() =>
                                setSelectedCourse(course.enrollmentId)
                            }>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {course.courseCode}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {course.courseName}
                                        </p>
                                    </div>
                                    {course.isCritical && (
                                        <Badge
                                            variant="destructive"
                                            className="text-xs">
                                            {t("student.attendance.critical")}
                                        </Badge>
                                    )}
                                    {course.isWarning && !course.isCritical && (
                                        <Badge
                                            variant="outline"
                                            className="text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                                            {t("student.attendance.warning")}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Percentage */}
                                <div className="text-center">
                                    <p
                                        className={`text-3xl font-bold ${getStatusColor(
                                            course.attendancePercentage
                                        )}`}>
                                        {course.attendancePercentage.toFixed(1)}
                                        %
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {t("student.attendance.attendancePercentage")}
                                    </p>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <Progress
                                        value={course.attendancePercentage}
                                        className="h-2"
                                        style={{
                                            backgroundColor:
                                                "rgb(229 231 235 / var(--tw-bg-opacity))",
                                        }}>
                                        <div
                                            className={`h-full ${getProgressColor(
                                                course.attendancePercentage
                                            )} transition-all`}
                                            style={{
                                                width: `${course.attendancePercentage}%`,
                                            }}
                                        />
                                    </Progress>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <p className="font-medium text-green-700 dark:text-green-400">
                                            {course.attendedSessions}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {t("student.attendance.present")}
                                        </p>
                                    </div>
                                    <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <p className="font-medium text-red-700 dark:text-red-400">
                                            {course.absentSessions}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {t("student.attendance.absent")}
                                        </p>
                                    </div>
                                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="font-medium text-blue-700 dark:text-blue-400">
                                            {course.excusedAbsences}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {t("student.attendance.excused")}
                                        </p>
                                    </div>
                                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <p className="font-medium text-gray-700 dark:text-gray-300">
                                            {course.totalSessions}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {t("student.attendance.total")}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    </div>
                )}

                {/* Attendance Records for Selected Course */}
                {selectedCourse && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{t("student.attendance.detailedRecords")}</CardTitle>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {
                                            courses.find(
                                                (c) =>
                                                    c.enrollmentId ===
                                                    selectedCourse
                                            )?.courseName
                                        }
                                    </p>
                                </div>
                                <Button variant="outline" size="sm">
                                    <FileText className="w-4 h-4 ml-2" />
                                    {t("student.attendance.submitExcuse")}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {attendanceRecords.map((record, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-lg border dark:border-gray-700">
                                        <div className="flex items-center gap-4">
                                            {getStatusIcon(record.status)}
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {t("student.attendance.session")}{" "}
                                                    {record.sessionNumber}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(
                                                            record.date
                                                        ).toLocaleDateString(
                                                            "ar-EG",
                                                            {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                                {record.notes && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {record.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                record.status === "PRESENT"
                                                    ? "default"
                                                    : record.status === "ABSENT"
                                                    ? "destructive"
                                                    : "outline"
                                            }>
                                            {record.status === "PRESENT"
                                                ? t("student.attendance.present")
                                                : record.status === "ABSENT"
                                                ? t("student.attendance.absent")
                                                : t("student.attendance.excused")}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Info Box */}
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                        <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                            💡 {t("student.attendance.importantInfo")}
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                            <li>• {t("student.attendance.info1")}</li>
                            <li>
                                • {t("student.attendance.info2")}
                            </li>
                            <li>
                                • {t("student.attendance.info3")}
                            </li>
                            <li>• {t("student.attendance.info4")}</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
