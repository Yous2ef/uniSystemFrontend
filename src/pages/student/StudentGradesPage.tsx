import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    TrendingUp,
    Award,
    BookOpen,
    AlertCircle,
    Download,
    Calendar,
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
import { studentsService, gradesService } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface Grade {
    id: string;
    componentId: string;
    componentName: string;
    score: number;
    maxScore: number;
    weight: number;
}

interface CourseGrade {
    enrollmentId: string;
    sectionId: string;
    courseCode: string;
    courseNameAr: string;
    courseNameEn: string;
    credits: number;
    termId: string;
    termName: string;
    termStatus: "ACTIVE" | "INACTIVE" | "COMPLETED";
    facultyName: string;
    grades: Grade[];
    totalScore: number;
    percentage: number;
    letterGrade: string;
    gradePoint: number;
    isPublished: boolean;
}

interface TermGrades {
    termId: string;
    termName: string;
    termStatus: "ACTIVE" | "INACTIVE" | "COMPLETED";
    courses: CourseGrade[];
    gpa: number;
    credits: number;
}

interface StudentData {
    id: string;
    studentCode: string;
    nameEn: string;
    nameAr: string;
    email: string;
    batch?: {
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
        nameAr: string;
    };
    academicStanding?: {
        cgpa: number;
        totalCredits: number;
        standing: string;
    };
}

export default function StudentGradesPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [gradesLoading, setGradesLoading] = useState(true);
    const [studentLoading, setStudentLoading] = useState(true);
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [allGrades, setAllGrades] = useState<TermGrades[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<
        "current" | "all" | string
    >("current");
    const [filteredGrades, setFilteredGrades] = useState<TermGrades[]>([]);

    useEffect(() => {
        fetchStudentGrades();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        applyFilter();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFilter, allGrades]);

    const fetchStudentGrades = async () => {
        try {
            setGradesLoading(true);
            setStudentLoading(true);
            console.log("📚 Fetching student grades for user:", user?.id);

            // Fetch student profile by user ID
            const profileResponse = await studentsService.getByUserId(
                user?.id || ""
            );
            if (!profileResponse.success || !profileResponse.data) {
                console.error("❌ Failed to fetch student profile");
                throw new Error("Failed to fetch student profile");
            }

            const student = profileResponse.data;
            setStudentData(student);
            console.log("👤 Student data:", student);
            setStudentLoading(false);

            // Fetch real grades from backend
            const gradesResponse = await gradesService.getMyGrades();

            if (!gradesResponse.success) {
                console.error("❌ Failed to fetch grades");
                throw new Error("Failed to fetch grades");
            }

            console.log("📊 Grades data:", gradesResponse.data);

            // Process grades by term
            const gradesData = processRealGradesData(gradesResponse.data);
            setAllGrades(gradesData);
        } catch (error) {
            console.error("❌ Error fetching grades:", error);
            setStudentLoading(false);
        } finally {
            setGradesLoading(false);
        }
    };

    const processRealGradesData = (gradesData: CourseGrade[]): TermGrades[] => {
        const termMap = new Map<string, TermGrades>();

        gradesData.forEach((gradeData) => {
            const termId = gradeData.termId;

            if (!termMap.has(termId)) {
                termMap.set(termId, {
                    termId: termId,
                    termName: gradeData.termName,
                    termStatus: gradeData.termStatus,
                    courses: [],
                    gpa: 0,
                    credits: 0,
                });
            }

            const courseGrade: CourseGrade = {
                enrollmentId: gradeData.enrollmentId,
                sectionId: gradeData.sectionId,
                courseCode: gradeData.courseCode,
                courseNameAr: gradeData.courseNameAr,
                courseNameEn: gradeData.courseNameEn,
                credits: gradeData.credits,
                termId: gradeData.termId,
                termName: gradeData.termName,
                termStatus: gradeData.termStatus,
                facultyName: gradeData.facultyName,
                grades: gradeData.grades,
                totalScore: gradeData.totalScore,
                percentage: gradeData.percentage,
                letterGrade: gradeData.letterGrade,
                gradePoint: gradeData.gradePoint,
                isPublished: gradeData.isPublished,
            };

            termMap.get(termId)!.courses.push(courseGrade);
        });

        // Calculate GPA for each term
        const termsArray = Array.from(termMap.values());
        termsArray.forEach((term) => {
            const totalPoints = term.courses.reduce(
                (sum, c) => sum + c.gradePoint * c.credits,
                0
            );
            const totalCredits = term.courses.reduce(
                (sum, c) => sum + c.credits,
                0
            );
            term.gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
            term.credits = totalCredits;
        });

        // Sort by term (active first, then by name)
        return termsArray.sort((a, b) => {
            if (a.termStatus === "ACTIVE" && b.termStatus !== "ACTIVE")
                return -1;
            if (a.termStatus !== "ACTIVE" && b.termStatus === "ACTIVE")
                return 1;
            return b.termName.localeCompare(a.termName);
        });
    };

    const applyFilter = () => {
        if (selectedFilter === "current") {
            setFilteredGrades(
                allGrades.filter((term) => term.termStatus === "ACTIVE")
            );
        } else if (selectedFilter === "all") {
            setFilteredGrades(allGrades);
        } else {
            // Specific term selected
            setFilteredGrades(
                allGrades.filter((term) => term.termId === selectedFilter)
            );
        }
    };

    const calculateCumulativeGPA = () => {
        const totalPoints = allGrades.reduce(
            (sum, term) =>
                sum +
                term.courses.reduce(
                    (tSum, course) => tSum + course.gradePoint * course.credits,
                    0
                ),
            0
        );
        const totalCredits = allGrades.reduce(
            (sum, term) => sum + term.credits,
            0
        );
        return totalCredits > 0 ? totalPoints / totalCredits : 0;
    };

    const calculateTotalCredits = () => {
        return allGrades.reduce((sum, term) => sum + term.credits, 0);
    };

    const getAcademicStanding = (gpa: number) => {
        if (gpa >= 3.67)
            return {
                label: "ممتاز",
                color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            };
        if (gpa >= 3.0)
            return {
                label: "جيد جداً",
                color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            };
        if (gpa >= 2.33)
            return {
                label: "جيد",
                color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            };
        if (gpa >= 2.0)
            return {
                label: "مقبول",
                color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
            };
        return {
            label: "راسب",
            color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
    };

    const getGradeColor = (letterGrade: string) => {
        if (letterGrade.startsWith("A"))
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        if (letterGrade.startsWith("B"))
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        if (letterGrade.startsWith("C"))
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        if (letterGrade.startsWith("D"))
            return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    };

    const getGPATrendData = () => {
        return allGrades.map((term) => ({
            name: term.termName,
            gpa: parseFloat(term.gpa.toFixed(2)),
        }));
    };

    const getGradeDistributionData = () => {
        const distribution: Record<string, number> = {};
        allGrades.forEach((term) => {
            term.courses.forEach((course) => {
                distribution[course.letterGrade] =
                    (distribution[course.letterGrade] || 0) + 1;
            });
        });
        return Object.entries(distribution).map(([grade, count]) => ({
            name: grade,
            value: count,
        }));
    };

    const getBestCourses = () => {
        const allCourses: CourseGrade[] = [];
        allGrades.forEach((term) => allCourses.push(...term.courses));
        return allCourses
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 3);
    };

    const getWeakCourses = () => {
        const allCourses: CourseGrade[] = [];
        allGrades.forEach((term) => allCourses.push(...term.courses));
        return allCourses
            .filter((c) => c.gradePoint < 2.5)
            .sort((a, b) => a.percentage - b.percentage);
    };

    const COLORS = [
        "#10b981",
        "#3b82f6",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#ec4899",
    ];

    // Use official CGPA from student's academic standing (includes all completed courses)
    const cumulativeGPA =
        studentData?.academicStanding?.cgpa || calculateCumulativeGPA();
    // Use official total credits from student's academic standing
    const totalCredits =
        studentData?.academicStanding?.totalCredits || calculateTotalCredits();
    const standing = getAcademicStanding(cumulativeGPA);
    const currentTerm = allGrades.find((t) => t.termStatus === "ACTIVE");

    if (studentLoading && !studentData) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            جاري تحميل بيانات الطالب...
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            📊 {t("student.grades.title")}
                        </h1>
                        {studentData && (
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {studentData.nameAr} -{" "}
                                    {studentData.studentCode}
                                </p>
                                {studentData.batch && (
                                    <Badge
                                        variant="outline"
                                        className="text-xs">
                                        {studentData.batch.name}
                                    </Badge>
                                )}
                            </div>
                        )}
                        {!studentData && (
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                {t("student.grades.subtitle")}
                            </p>
                        )}
                    </div>
                    <Button variant="outline">
                        <Download className="w-4 h-4 me-2" />
                        {t("student.grades.downloadTranscript")}
                    </Button>
                </div>

                {/* Filter Controls
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Button
                                variant={
                                    selectedFilter === "current"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => setSelectedFilter("current")}
                                className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {t("student.grades.currentTerm")}
                            </Button>
                            <Button
                                variant={
                                    selectedFilter === "all"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => setSelectedFilter("all")}
                                className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                {t("student.grades.allTerms")}
                            </Button>
                            <div className="flex-1"></div>
                            <select
                                value={selectedFilter}
                                onChange={(e) =>
                                    setSelectedFilter(e.target.value)
                                }
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                <option value="current">
                                    {t("student.grades.currentTerm")}
                                </option>
                                <option value="all">
                                    {t("student.grades.allTerms")}
                                </option>
                                {allGrades.map((term) => (
                                    <option
                                        key={term.termId}
                                        value={term.termId}>
                                        {term.termName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card> */}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t("student.grades.termGpa")}
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">
                                {currentTerm
                                    ? currentTerm.gpa.toFixed(2)
                                    : "0.00"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t("student.grades.currentTerm")}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t("student.grades.cgpa")}
                            </CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {cumulativeGPA > 0
                                    ? cumulativeGPA.toFixed(2)
                                    : "0.00"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                من 4.00 (جميع المقررات المكتملة)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t("student.grades.earnedCredits")}
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {totalCredits}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t("student.grades.outOf")}{" "}
                                {studentData?.batch?.curriculum?.totalCredits ||
                                    132}{" "}
                                {t("student.grades.credits")}
                            </p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{
                                        width: `${
                                            (totalCredits /
                                                (studentData?.batch?.curriculum
                                                    ?.totalCredits || 132)) *
                                            100
                                        }%`,
                                    }}></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t("student.grades.academicStanding")}
                            </CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Badge
                                className={`text-lg px-3 py-1 ${standing.color}`}>
                                {standing.label}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-2">
                                {filteredGrades.reduce(
                                    (sum, t) => sum + t.courses.length,
                                    0
                                )}{" "}
                                {t("student.grades.coursesEnrolled")}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* GPA Trend Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t("student.grades.gpaTrend")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={getGPATrendData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 4]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="gpa"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        name="المعدل"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Grade Distribution Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t("student.grades.gradeDistribution")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={getGradeDistributionData()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) =>
                                            `${entry.name}: ${entry.value}`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value">
                                        {getGradeDistributionData().map(
                                            (_entry, index) => (
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
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Academic Insights */}
                {selectedFilter === "all" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Best Courses */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-green-600" />
                                    {t("student.grades.bestCourses")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {getBestCourses().map((course) => (
                                        <div
                                            key={course.enrollmentId}
                                            className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div>
                                                <p className="font-medium">
                                                    {course.courseNameAr}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {course.courseCode}
                                                </p>
                                            </div>
                                            <Badge
                                                className={getGradeColor(
                                                    course.letterGrade
                                                )}>
                                                {course.letterGrade}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Weak Courses */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                    {t("student.grades.weakCourses")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {getWeakCourses().length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">
                                        🎉 {t("student.grades.allCoursesGood")}
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {getWeakCourses()
                                            .slice(0, 3)
                                            .map((course) => (
                                                <div
                                                    key={course.enrollmentId}
                                                    className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">
                                                            {
                                                                course.courseNameAr
                                                            }
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            يمكن تحسين الأداء
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        className={getGradeColor(
                                                            course.letterGrade
                                                        )}>
                                                        {course.letterGrade}
                                                    </Badge>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Detailed Grades Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {t("student.grades.detailedGrades")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {gradesLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-4 text-gray-600 dark:text-gray-400">
                                    جاري تحميل الدرجات...
                                </p>
                            </div>
                        ) : filteredGrades.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    {t("student.grades.noGrades")}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {t("student.grades.noGradesYet")}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredGrades.map((term) => (
                                    <div
                                        key={term.termId}
                                        className="border rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 flex items-center gap-3">
                                            <span className="font-semibold text-lg">
                                                {term.termName}
                                            </span>
                                            {term.termStatus === "ACTIVE" && (
                                                <Badge variant="default">
                                                    الفصل الحالي
                                                </Badge>
                                            )}
                                            <div className="flex-1"></div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                المعدل: {term.gpa.toFixed(2)} |{" "}
                                                {term.courses.length} مادة
                                            </span>
                                        </div>
                                        <div className="p-4">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            {t(
                                                                "student.grades.courseCode"
                                                            )}
                                                        </TableHead>
                                                        <TableHead>
                                                            {t(
                                                                "student.grades.courseName"
                                                            )}
                                                        </TableHead>
                                                        <TableHead>
                                                            {t(
                                                                "student.grades.credits"
                                                            )}
                                                        </TableHead>
                                                        <TableHead>
                                                            {t(
                                                                "student.grades.finalScore"
                                                            )}
                                                        </TableHead>
                                                        <TableHead>
                                                            {t(
                                                                "student.grades.percentage"
                                                            )}
                                                        </TableHead>
                                                        <TableHead>
                                                            {t(
                                                                "student.grades.grade"
                                                            )}
                                                        </TableHead>
                                                        <TableHead>
                                                            {t(
                                                                "student.grades.status"
                                                            )}
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {term.courses.map(
                                                        (course) => (
                                                            <TableRow
                                                                key={
                                                                    course.enrollmentId
                                                                }>
                                                                <TableCell className="font-medium">
                                                                    {
                                                                        course.courseCode
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        course.courseNameAr
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        course.credits
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {course.totalScore.toFixed(
                                                                        1
                                                                    )}{" "}
                                                                    /{" "}
                                                                    {course.grades.reduce(
                                                                        (
                                                                            sum,
                                                                            g
                                                                        ) =>
                                                                            sum +
                                                                            g.maxScore,
                                                                        0
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {course.percentage.toFixed(
                                                                        1
                                                                    )}
                                                                    %
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        className={getGradeColor(
                                                                            course.letterGrade
                                                                        )}>
                                                                        {
                                                                            course.letterGrade
                                                                        }
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {course.isPublished ? (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-green-600">
                                                                            منشور
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-gray-600">
                                                                            قيد
                                                                            الانتظار
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
