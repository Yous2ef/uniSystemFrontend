import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    GraduationCap,
    TrendingUp,
    Award,
    Calendar,
    CheckCircle,
    Trophy,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { batchesService } from "@/services/api";

interface BatchDetails {
    batch: {
        id: string;
        name: string;
        year: number;
        maxCredits: number;
        department: {
            nameAr: string;
            nameEn: string;
        } | null;
        curriculum: {
            name: string;
            version: string;
            totalCredits: number;
        };
    };
    statistics: {
        totalStudents: number;
        activeStudents: number;
        graduatedStudents: number;
        deferredStudents: number;
        dismissedStudents: number;
        averageGpa: number;
        totalCreditsEarned: number;
        performance: {
            excellent: number;
            veryGood: number;
            good: number;
            pass: number;
            fail: number;
        };
    };
    termEnrollments: Array<{
        termId: string;
        termName: string;
        termType: string;
        enrolledCount: number;
        passedCount: number;
        failedCount: number;
    }>;
    students: Array<{
        id: string;
        studentCode: string;
        nameAr: string;
        nameEn: string;
        email: string;
        status: string;
        gpa: number;
        creditsEarned: number;
        department: string;
        phone: string | null;
    }>;
}

export default function BatchDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<BatchDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "gpa" | "credits">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    useEffect(() => {
        if (id) {
            fetchBatchDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchBatchDetails = async () => {
        try {
            setLoading(true);
            const response = await batchesService.getStatistics(id!);
            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error("Error fetching batch details:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            {
                variant: "default" | "secondary" | "destructive" | "outline";
                label: string;
            }
        > = {
            ACTIVE: { variant: "default", label: "نشط" },
            GRADUATED: { variant: "secondary", label: "متخرج" },
            DEFERRED: { variant: "outline", label: "مؤجل" },
            DISMISSED: { variant: "destructive", label: "منسحب" },
        };
        const config = variants[status] || {
            variant: "outline",
            label: status,
        };
        return (
            <Badge variant={config.variant} className="text-xs">
                {config.label}
            </Badge>
        );
    };

    const filteredAndSortedStudents = () => {
        if (!data) return [];

        let filtered = data.students;

        // Filter by status
        if (statusFilter !== "ALL") {
            filtered = filtered.filter((s) => s.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (s) =>
                    s.nameAr.includes(searchTerm) ||
                    s.studentCode.includes(searchTerm) ||
                    s.email.includes(searchTerm)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            if (sortBy === "name") {
                comparison = a.nameAr.localeCompare(b.nameAr, "ar");
            } else if (sortBy === "gpa") {
                comparison = a.gpa - b.gpa;
            } else if (sortBy === "credits") {
                comparison = a.creditsEarned - b.creditsEarned;
            }
            return sortOrder === "asc" ? comparison : -comparison;
        });

        return filtered;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">
                            جاري التحميل...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!data) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-xl text-muted-foreground">
                            لم يتم العثور على بيانات الدفعة
                        </p>
                        <Button
                            onClick={() => navigate("/batches")}
                            className="mt-4">
                            <ArrowLeft className="w-4 h-4 ml-2" />
                            العودة للدفعات
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const { batch, statistics, termEnrollments } = data;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/batches")}
                            className="mb-2">
                            <ArrowLeft className="w-4 h-4 ml-2" />
                            العودة للدفعات
                        </Button>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                            دفعة {batch.name} - {batch.year}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {batch.department?.nameAr || "غير محدد"} •{" "}
                            {batch.curriculum.name} ({batch.curriculum.version})
                        </p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                إجمالي الطلاب
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.totalStudents}
                            </div>
                            <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    {statistics.activeStudents} نشط
                                </span>
                                <span className="flex items-center gap-1">
                                    <Trophy className="w-3 h-3 text-blue-600" />
                                    {statistics.graduatedStudents} متخرج
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                المعدل التراكمي
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.averageGpa.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                متوسط المعدل التراكمي للدفعة
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                الساعات المكتسبة
                            </CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.totalCreditsEarned}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                إجمالي ساعات جميع الطلاب
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                حدود التسجيل
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {batch.maxCredits}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                الحد الأقصى للساعات
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Academic Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            التوزيع الأكاديمي
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">
                                    {statistics.performance.excellent}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    ممتاز
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    (3.7+)
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">
                                    {statistics.performance.veryGood}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    جيد جداً
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    (3.0 - 3.7)
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-600">
                                    {statistics.performance.good}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    جيد
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    (2.5 - 3.0)
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-600">
                                    {statistics.performance.pass}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    مقبول
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    (2.0 - 2.5)
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-red-600">
                                    {statistics.performance.fail}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    راسب
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    (&lt;2.0)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Term Enrollments */}
                {termEnrollments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                إحصائيات التسجيل حسب الفصول
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>الفصل الدراسي</TableHead>
                                        <TableHead className="text-center">
                                            عدد المسجلين
                                        </TableHead>
                                        <TableHead className="text-center">
                                            الناجحون
                                        </TableHead>
                                        <TableHead className="text-center">
                                            الراسبون
                                        </TableHead>
                                        <TableHead className="text-center">
                                            معدل النجاح
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {termEnrollments.map((term) => {
                                        const passRate =
                                            term.passedCount +
                                                term.failedCount >
                                            0
                                                ? (
                                                      (term.passedCount /
                                                          (term.passedCount +
                                                              term.failedCount)) *
                                                      100
                                                  ).toFixed(1)
                                                : "N/A";
                                        return (
                                            <TableRow key={term.termId}>
                                                <TableCell className="font-medium">
                                                    {term.termName}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {term.enrolledCount}
                                                </TableCell>
                                                <TableCell className="text-center text-green-600">
                                                    {term.passedCount}
                                                </TableCell>
                                                <TableCell className="text-center text-red-600">
                                                    {term.failedCount}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {passRate}%
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Students List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            قائمة الطلاب ({filteredAndSortedStudents().length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                            <div className="flex-1 min-w-0">
                                <input
                                    type="text"
                                    placeholder="بحث بالاسم أو الرقم الجامعي..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="flex h-10 w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="ALL">جميع الحالات</option>
                                <option value="ACTIVE">نشط</option>
                                <option value="GRADUATED">متخرج</option>
                                <option value="DEFERRED">مؤجل</option>
                                <option value="DISMISSED">منسحب</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    setSortBy(
                                        e.target.value as
                                            | "name"
                                            | "gpa"
                                            | "credits"
                                    )
                                }
                                className="flex h-10 w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="name">الترتيب حسب الاسم</option>
                                <option value="gpa">الترتيب حسب المعدل</option>
                                <option value="credits">
                                    الترتيب حسب الساعات
                                </option>
                            </select>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() =>
                                    setSortOrder(
                                        sortOrder === "asc" ? "desc" : "asc"
                                    )
                                }>
                                {sortOrder === "asc" ? "تصاعدي" : "تنازلي"}
                            </Button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>الرقم الجامعي</TableHead>
                                        <TableHead>الاسم</TableHead>
                                        <TableHead className="text-center">
                                            الحالة
                                        </TableHead>
                                        <TableHead className="text-center">
                                            المعدل التراكمي
                                        </TableHead>
                                        <TableHead className="text-center">
                                            الساعات المكتسبة
                                        </TableHead>
                                        <TableHead>القسم</TableHead>
                                        <TableHead>البريد الإلكتروني</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedStudents().length ===
                                    0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="text-center py-8">
                                                <p className="text-muted-foreground">
                                                    لا توجد نتائج مطابقة
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAndSortedStudents().map(
                                            (student) => (
                                                <TableRow key={student.id}>
                                                    <TableCell className="font-medium">
                                                        {student.studentCode}
                                                    </TableCell>
                                                    <TableCell>
                                                        {student.nameAr}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {getStatusBadge(
                                                            student.status
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center font-semibold">
                                                        {student.gpa > 0
                                                            ? student.gpa.toFixed(
                                                                  2
                                                              )
                                                            : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {student.creditsEarned}
                                                    </TableCell>
                                                    <TableCell>
                                                        {student.department}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {student.email}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
