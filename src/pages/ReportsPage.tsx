import { useState, useEffect } from "react";
import {
    FileText,
    Download,
    TrendingUp,
    Users,
    GraduationCap,
    BarChart3,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    studentsService,
    termsService,
    gradesService,
    reportsService,
} from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Student {
    id: string;
    studentCode: string;
    nameAr: string;
    specialization: { nameAr: string };
    batch: { name: string };
    currentGPA?: number;
}

interface Term {
    id: string;
    name: string;
}

interface Statistics {
    totalStudents: number;
    activeStudents: number;
    graduatedStudents: number;
    averageGPA: number;
    enrollmentRate: number;
    attendanceRate: number;
    topSpecializations: {
        name: string;
        count: number;
    }[];
    gradeDistribution: {
        grade: string;
        count: number;
        percentage: number;
    }[];
}

export default function ReportsPage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [terms, setTerms] = useState<Term[]>([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedTerm, setSelectedTerm] = useState("");
    const [reportType, setReportType] = useState<
        "transcript" | "grades" | "attendance" | "statistics"
    >("statistics");
    const [studentTranscript, setStudentTranscript] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [loadingTranscript, setLoadingTranscript] = useState(false);
    const [gradesReport, setGradesReport] = useState<any>(null);
    const [attendanceReport, setAttendanceReport] = useState<any>(null);
    const [loadingGrades, setLoadingGrades] = useState(false);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const { t } = useTranslation();
    useEffect(() => {
        // Redirect student to their grades page
        if (user?.role === "STUDENT") {
            navigate("/student/grades");
            return;
        }

        const fetchData = async () => {
            try {
                const [studentsRes, termsRes, statsRes] = await Promise.all([
                    studentsService.getAll({}),
                    termsService.getAll(),
                    reportsService.getStatistics(),
                ]);

                console.log("📚 Students response:", studentsRes);
                console.log("📅 Terms response:", termsRes);
                console.log("📊 Stats response:", statsRes);

                if (studentsRes.success) {
                    // API returns students directly in data array, not data.students
                    const studentsData = Array.isArray(studentsRes.data)
                        ? studentsRes.data
                        : studentsRes.data?.students || [];
                    console.log("✅ Setting students:", studentsData);
                    setStudents(studentsData);
                }
                if (termsRes.success) {
                    const termsData = Array.isArray(termsRes.data)
                        ? termsRes.data
                        : termsRes.data?.terms || [];
                    setTerms(termsData);
                }
                if (statsRes.success) {
                    setStatistics(statsRes.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
            fetchData();
        }
    }, [user, navigate]);

    const fetchTranscript = async (studentId: string) => {
        try {
            setLoadingTranscript(true);
            const response = await reportsService.getTranscript(studentId);
            if (response.success) {
                setStudentTranscript(response.data);
            }
        } catch (error) {
            console.error("Error fetching transcript:", error);
            setStudentTranscript(null);
        } finally {
            setLoadingTranscript(false);
        }
    };

    useEffect(() => {
        if (selectedStudent) {
            fetchTranscript(selectedStudent);
        } else {
            setStudentTranscript(null);
        }
    }, [selectedStudent]);

    const fetchGradesReport = async (termId: string) => {
        try {
            setLoadingGrades(true);
            const response = await reportsService.getGradesReport(termId);
            if (response.success) {
                setGradesReport(response.data);
            }
        } catch (error) {
            console.error("Error fetching grades report:", error);
            setGradesReport(null);
        } finally {
            setLoadingGrades(false);
        }
    };

    const fetchAttendanceReport = async (termId: string) => {
        try {
            setLoadingAttendance(true);
            const response = await reportsService.getAttendanceReport(termId);
            if (response.success) {
                setAttendanceReport(response.data);
            }
        } catch (error) {
            console.error("Error fetching attendance report:", error);
            setAttendanceReport(null);
        } finally {
            setLoadingAttendance(false);
        }
    };

    useEffect(() => {
        if (selectedTerm && reportType === "grades") {
            fetchGradesReport(selectedTerm);
        } else if (selectedTerm && reportType === "attendance") {
            fetchAttendanceReport(selectedTerm);
        }
    }, [selectedTerm, reportType]);

    const handleExportPDF = () => {
        // Use browser's print functionality to generate PDF
        window.print();
    };

    const handleExportExcel = () => {
        // Simple CSV export
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Add BOM for proper Arabic support
        
        if (reportType === "statistics" && statistics) {
            csvContent += t("reports.General Statistics") + "\n\n";
            csvContent += t("reports.Total students") + "," + statistics.totalStudents + "\n";
            csvContent += t("reports.Active students") + "," + statistics.activeStudents + "\n";
            csvContent += t("reports.Overall GPA") + "," + statistics.averageGPA.toFixed(2) + "\n";
            csvContent += t("reports.Enrollment Rate") + "," + statistics.enrollmentRate.toFixed(1) + "%\n";
        } else if (reportType === "transcript" && studentTranscript) {
            csvContent += t("reports.Grade sheet") + "\n\n";
            csvContent += t("students.studentCode") + "," + studentTranscript.studentCode + "\n";
            csvContent += t("students.nameAr") + "," + studentTranscript.nameAr + "\n";
            csvContent += t("students.specialization") + "," + studentTranscript.specialization + "\n";
            csvContent += t("students.gpa") + "," + studentTranscript.currentGPA.toFixed(2) + "\n\n";
            
            studentTranscript.terms.forEach((term: any) => {
                csvContent += term.name + " - " + t("student.grades.termGpa") + ": " + term.gpa.toFixed(2) + "\n";
                csvContent += t("courses.code") + "," + t("courses.name") + "," + t("courses.credits") + "," + t("student.grades.grade") + "," + t("student.grades.points") + "\n";
                term.courses.forEach((course: any) => {
                    csvContent += `${course.code},${course.name},${course.credits},${course.grade},${course.points}\n`;
                });
                csvContent += "\n";
            });
        } else if (reportType === "grades" && gradesReport) {
            csvContent += t("reports.Grades Report") + " - " + gradesReport.termName + "\n\n";
            csvContent += t("students.studentCode") + "," + t("students.nameAr") + "," + t("reports.Number of courses") + "," + t("student.grades.termGpa") + "\n";
            gradesReport.students.forEach((student: any) => {
                csvContent += `${student.studentCode},${student.nameAr},${student.courses.length},${student.termGPA ? student.termGPA.toFixed(2) : t("student.grades.notPublished")}\n`;
            });
        } else if (reportType === "attendance" && attendanceReport) {
            csvContent += t("reports.Attendance Statistics") + " - " + attendanceReport.termName + "\n\n";
            csvContent += t("reports.Overall Attendance Rate") + "," + attendanceReport.overallAttendanceRate.toFixed(1) + "%\n";
            csvContent += t("reports.Regular Students") + "," + attendanceReport.regularStudents + "\n";
            csvContent += t("reports.Poor Attendance Students") + "," + attendanceReport.poorStudents + "\n\n";
            csvContent += t("students.studentCode") + "," + t("students.nameAr") + "," + t("reports.Total Sessions") + "," + t("pages.attendance.present") + "," + t("pages.attendance.absent") + "," + t("reports.Rate") + "\n";
            attendanceReport.students.forEach((student: any) => {
                csvContent += `${student.studentCode},${student.nameAr},${student.totalSessions},${student.presentCount},${student.absentCount},${student.attendanceRate.toFixed(1)}%\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `report_${reportType}_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {user?.role === "FACULTY" || user?.role === "TA"
                                ? t("faculty.course.materials")
                                : t("reports.title")}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                            {user?.role === "FACULTY" || user?.role === "TA"
                                ? t("faculty.dashboard.myCourses")
                                : t("pages.reports.subtitle")}
                        </p>
                    </div>
                    {(user?.role === "ADMIN" ||
                        user?.role === "SUPER_ADMIN") && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                onClick={handleExportExcel}
                                className="flex-1 sm:flex-none">
                                <Download className="w-4 h-4 me-2" />
                                Excel
                            </Button>
                            <Button
                                onClick={handleExportPDF}
                                className="flex-1 sm:flex-none">
                                <FileText className="w-4 h-4 me-2" />
                                PDF
                            </Button>
                        </div>
                    )}
                </div>

                {/* Faculty View */}
                {(user?.role === "FACULTY" || user?.role === "TA") && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("faculty.dashboard.myCourses")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 text-center py-8">
                                {t("pages.reports.noData")}
                            </p>
                            {/* TODO: Add faculty sections and grade reports */}
                        </CardContent>
                    </Card>
                )}

                {/* Admin View */}
                {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
                    <Tabs
                        value={reportType}
                        onValueChange={(v: string) =>
                            setReportType(v as typeof reportType)
                        }>
                        <TabsList>
                            <TabsTrigger value="statistics">
                                <BarChart3 className="w-4 h-4 me-2" />
                                {t("reports.General Statistics")}
                            </TabsTrigger>
                            <TabsTrigger value="transcript">
                                <FileText className="w-4 h-4 me-2" />
                                {t("reports.Grade sheet")}
                            </TabsTrigger>
                            <TabsTrigger value="grades">
                                <GraduationCap className="w-4 h-4 me-2" />
                                {t("reports.Grade report")}
                            </TabsTrigger>
                            <TabsTrigger value="attendance">
                                <Users className="w-4 h-4 me-2" />
                                {t("reports.attendance report")}
                            </TabsTrigger>
                        </TabsList>

                        {/* Statistics Tab */}
                        <TabsContent value="statistics" className="space-y-6">
                            {!statistics ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {t("pages.reports.loading")}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-3">
                                                    <Users className="w-8 h-8 text-blue-600" />
                                                    <div>
                                                        <p className="text-2xl font-bold">
                                                            {
                                                                statistics.totalStudents
                                                            }
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {t(
                                                                "reports.Total students"
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-3">
                                                    <GraduationCap className="w-8 h-8 text-green-600" />
                                                    <div>
                                                        <p className="text-2xl font-bold">
                                                            {
                                                                statistics.activeStudents
                                                            }
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {t("reports.Active students")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-3">
                                                    <TrendingUp className="w-8 h-8 text-purple-600" />
                                                    <div>
                                                        <p className="text-2xl font-bold">
                                                            {statistics.averageGPA.toFixed(
                                                                2
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {t("reports.Overall GPA")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-3">
                                                    <BarChart3 className="w-8 h-8 text-orange-600" />
                                                    <div>
                                                        <p className="text-2xl font-bold">
                                                            {
                                                                statistics.enrollmentRate
                                                            }
                                                            %
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {t("reports.Enrollment Rate")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    {t("reports.Most Requested Specializations")}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {statistics.topSpecializations.map(
                                                        (spec, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between">
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    {spec.name}
                                                                </span>
                                                                <Badge variant="secondary">
                                                                    {spec.count}{" "}
                                                                    {t("students.title")}
                                                                </Badge>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    {t("reports.Grade Distribution")}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {statistics.gradeDistribution.map(
                                                        (item, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center gap-3">
                                                                <span className="text-lg font-semibold w-8">
                                                                    {item.grade}
                                                                </span>
                                                                <div className="flex-1">
                                                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-blue-600"
                                                                            style={{
                                                                                width: `${item.percentage}%`,
                                                                            }}></div>
                                                                    </div>
                                                                </div>
                                                                <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-end">
                                                                    {item.count}{" "}
                                                                    (
                                                                    {
                                                                        item.percentage
                                                                    }
                                                                    %)
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </>
                            )}
                        </TabsContent>

                        {/* Transcript Tab */}
                        <TabsContent value="transcript" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("reports.Student Selection")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <select
                                        value={selectedStudent}
                                        onChange={(e) =>
                                            setSelectedStudent(e.target.value)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                        <option value="">{t("reports.Select a Student")}</option>
                                        {students &&
                                            students.map((student) => (
                                                <option
                                                    key={student.id}
                                                    value={student.id}>
                                                    {student.studentCode} -{" "}
                                                    {student.nameAr}
                                                </option>
                                            ))}
                                    </select>
                                </CardContent>
                            </Card>

                            {loadingTranscript ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {t("pages.reports.loading")}
                                    </p>
                                </div>
                            ) : studentTranscript ? (
                                <>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                {t("students.title")}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        {t("students.studentCode")}
                                                    </p>
                                                    <p className="text-lg font-semibold">
                                                        {
                                                            studentTranscript.studentCode
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        {t("students.nameAr")}
                                                    </p>
                                                    <p className="text-lg font-semibold">
                                                        {
                                                            studentTranscript.nameAr
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        {t("students.specialization")}
                                                    </p>
                                                    <p className="text-lg font-semibold">
                                                        {
                                                            studentTranscript.specialization
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        {t("students.batch")}
                                                    </p>
                                                    <p className="text-lg font-semibold">
                                                        {
                                                            studentTranscript.batch
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        {t("students.gpa")}
                                                    </p>
                                                    <p className="text-lg font-semibold text-green-600">
                                                        {studentTranscript.currentGPA.toFixed(
                                                            2
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        {t("courses.credits")}
                                                    </p>
                                                    <p className="text-lg font-semibold">
                                                        {
                                                            studentTranscript.totalCredits
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {studentTranscript.terms.map(
                                        (term: any, termIndex: number) => (
                                            <Card key={termIndex}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle>
                                                            {term.name}
                                                        </CardTitle>
                                                        <Badge>
                                                            {t("student.grades.termGpa")}:{" "}
                                                            {term.gpa.toFixed(
                                                                2
                                                            )}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="overflow-x-auto">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>
                                                                        {t("courses.code")}
                                                                    </TableHead>
                                                                    <TableHead>
                                                                        {t("courses.name")}
                                                                    </TableHead>
                                                                    <TableHead>
                                                                        {t("courses.credits")}
                                                                    </TableHead>
                                                                    <TableHead>
                                                                        {t("student.grades.grade")}
                                                                    </TableHead>
                                                                    <TableHead>
                                                                        {t("student.grades.points")}
                                                                    </TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {term.courses.map(
                                                                    (
                                                                        course,
                                                                        courseIndex
                                                                    ) => (
                                                                        <TableRow
                                                                            key={
                                                                                courseIndex
                                                                            }>
                                                                            <TableCell>
                                                                                {
                                                                                    course.code
                                                                                }
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {
                                                                                    course.name
                                                                                }
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {
                                                                                    course.credits
                                                                                }
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Badge>
                                                                                    {
                                                                                        course.grade
                                                                                    }
                                                                                </Badge>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {course.points.toFixed(
                                                                                    1
                                                                                )}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    )}
                                </>
                            ) : selectedStudent ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {t("pages.reports.noData")}
                                    </p>
                                </div>
                            ) : null}
                        </TabsContent>

                        {/* Grades Report Tab */}
                        <TabsContent value="grades" className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {t("terms.selectTerm")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <select
                                            value={selectedTerm}
                                            onChange={(e) =>
                                                setSelectedTerm(e.target.value)
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                            <option value="">{t("terms.selectTerm")}</option>
                                            {terms &&
                                                terms.map((term) => (
                                                    <option
                                                        key={term.id}
                                                        value={term.id}>
                                                        {term.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </CardContent>
                                </Card>
                            </div>

                            {selectedTerm && gradesReport ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {t("reports.Grades Report")} -{" "}
                                            {gradesReport.termName}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {t("student.grades.termGpa")}:{" "}
                                                <span className="font-bold text-lg">
                                                    {gradesReport.averageGPA.toFixed(
                                                        2
                                                    )}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            {t("students.studentCode")}
                                                        </TableHead>
                                                        <TableHead>
                                                            {t("students.nameAr")}
                                                        </TableHead>
                                                        <TableHead>
                                                            {t("reports.Number of courses")}
                                                        </TableHead>
                                                        <TableHead>
                                                            {t("student.grades.termGpa")}
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {gradesReport.students.map(
                                                        (student: any) => (
                                                            <TableRow
                                                                key={
                                                                    student.studentCode
                                                                }>
                                                                <TableCell>
                                                                    {
                                                                        student.studentCode
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        student.nameAr
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        student
                                                                            .courses
                                                                            .length
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge>
                                                                        {student.termGPA
                                                                            ? student.termGPA.toFixed(
                                                                                  2
                                                                              )
                                                                            : t("student.grades.notPublished")}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : selectedTerm && loadingGrades ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                                        {t("pages.reports.loading")}
                                    </p>
                                </div>
                            ) : selectedTerm ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("reports.Grades Report")}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-center text-gray-500 py-8">
                                            {t("pages.reports.noData")}
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : null}
                        </TabsContent>

                        {/* Attendance Report Tab */}
                        <TabsContent value="attendance" className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {t("terms.selectTerm")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <select
                                            value={selectedTerm}
                                            onChange={(e) =>
                                                setSelectedTerm(e.target.value)
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                            <option value="">{t("terms.selectTerm")}</option>
                                            {terms &&
                                                terms.map((term) => (
                                                    <option
                                                        key={term.id}
                                                        value={term.id}>
                                                        {term.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </CardContent>
                                </Card>
                            </div>

                            {selectedTerm && attendanceReport ? (
                                <>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                {t("reports.Attendance Statistics")} -{" "}
                                                {attendanceReport.termName}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                    <p className="text-sm text-gray-500 mb-1">
                                                        {t("reports.Overall Attendance Rate")}
                                                    </p>
                                                    <p className="text-3xl font-bold text-green-600">
                                                        {attendanceReport.overallAttendanceRate.toFixed(
                                                            1
                                                        )}
                                                        %
                                                    </p>
                                                </div>
                                                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                    <p className="text-sm text-gray-500 mb-1">
                                                        {t("reports.Regular Students")} (&gt;=75%)
                                                    </p>
                                                    <p className="text-3xl font-bold text-blue-600">
                                                        {
                                                            attendanceReport.regularStudents
                                                        }
                                                    </p>
                                                </div>
                                                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                    <p className="text-sm text-gray-500 mb-1">
                                                        {t("reports.Poor Attendance Students")} (&lt;75%)
                                                    </p>
                                                    <p className="text-3xl font-bold text-red-600">
                                                        {
                                                            attendanceReport.poorStudents
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                {t("reports.Student Attendance Details")}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>
                                                                {t("students.studentCode")}
                                                            </TableHead>
                                                            <TableHead>
                                                                {t("students.nameAr")}
                                                            </TableHead>
                                                            <TableHead>
                                                                {t("reports.Total Sessions")}
                                                            </TableHead>
                                                            <TableHead>
                                                                {t("pages.attendance.present")}
                                                            </TableHead>
                                                            <TableHead>
                                                                {t("pages.attendance.absent")}
                                                            </TableHead>
                                                            <TableHead>
                                                                {t("reports.Rate")}
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {attendanceReport.students.map(
                                                            (student: any) => (
                                                                <TableRow
                                                                    key={
                                                                        student.studentCode
                                                                    }>
                                                                    <TableCell>
                                                                        {
                                                                            student.studentCode
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            student.nameAr
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            student.totalSessions
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="text-green-600">
                                                                        {
                                                                            student.presentCount
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="text-red-600">
                                                                        {
                                                                            student.absentCount
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge
                                                                            variant={
                                                                                student.attendanceRate >=
                                                                                75
                                                                                    ? "default"
                                                                                    : "destructive"
                                                                            }>
                                                                            {student.attendanceRate.toFixed(
                                                                                1
                                                                            )}
                                                                            %
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            ) : selectedTerm && loadingAttendance ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                                        {t("pages.reports.loading")}
                                    </p>
                                </div>
                            ) : selectedTerm ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("reports.Attendance Statistics")}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-center text-gray-500 py-8">
                                            {t("pages.reports.noData")}
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : null}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </DashboardLayout>
    );
}
