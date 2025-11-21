import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
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
import { curriculumService, coursesService } from "@/services/api";

interface Course {
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
    credits: number;
    type: string;
}

interface CurriculumCourse {
    id: string;
    courseId: string;
    semester: number;
    year: number;
    isRequired: boolean;
    course: Course;
}

interface Curriculum {
    id: string;
    name: string;
    version: string;
    totalCredits: number;
    department: {
        nameAr: string;
    };
    curriculumCourses: CurriculumCourse[];
}

export default function CurriculumDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [semester, setSemester] = useState(1);
    const [year, setYear] = useState(1);
    const [isRequired, setIsRequired] = useState(true);

    useEffect(() => {
        fetchCurriculum();
        fetchCourses();
    }, [id]);

    const fetchCurriculum = async () => {
        try {
            setLoading(true);
            const response = await curriculumService.getById(id!);
            setCurriculum(response.data);
        } catch (error) {
            console.error("Error fetching curriculum:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await coursesService.getAll({});
            const coursesData = Array.isArray(response.data)
                ? response.data
                : response.data?.courses || [];
            setCourses(coursesData);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const handleAddCourse = async () => {
        try {
            await curriculumService.addCourse(id!, {
                courseId: selectedCourse,
                semester,
                year,
                isRequired,
            });
            fetchCurriculum();
            setIsAddModalOpen(false);
            setSelectedCourse("");
            setSemester(1);
            setYear(1);
            setIsRequired(true);
        } catch (error: any) {
            console.error("Error adding course:", error);
            alert(
                `فشل إضافة المادة: ${
                    error.response?.data?.message || error.message
                }`
            );
        }
    };

    const handleRemoveCourse = async (courseId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه المادة من الخطة؟")) return;

        try {
            await curriculumService.removeCourse(id!, courseId);
            fetchCurriculum();
        } catch (error: any) {
            console.error("Error removing course:", error);
            alert(
                `فشل حذف المادة: ${
                    error.response?.data?.message || error.message
                }`
            );
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!curriculum) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">
                        الخطة الدراسية غير موجودة
                    </p>
                    <Button
                        onClick={() => navigate("/curriculum")}
                        className="mt-4">
                        العودة للخطط الدراسية
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    // Group courses by year and semester
    const groupedCourses: { [key: string]: CurriculumCourse[] } = {};
    curriculum.curriculumCourses.forEach((cc) => {
        const key = `${cc.year}-${cc.semester}`;
        if (!groupedCourses[key]) {
            groupedCourses[key] = [];
        }
        groupedCourses[key].push(cc);
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => navigate("/curriculum")}>
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                {curriculum.name}
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                                {curriculum.department.nameAr} - الإصدار{" "}
                                {curriculum.version}
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة مادة
                    </Button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>إجمالي الساعات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-blue-600">
                                {curriculum.totalCredits}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>عدد المواد</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-600">
                                {curriculum.curriculumCourses.length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>ساعات مضافة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-purple-600">
                                {curriculum.curriculumCourses.reduce(
                                    (sum, cc) => sum + cc.course.credits,
                                    0
                                )}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Courses by Year/Semester */}
                {Object.keys(groupedCourses)
                    .sort()
                    .map((key) => {
                        const [year, semester] = key.split("-");
                        const coursesInGroup = groupedCourses[key];
                        return (
                            <Card key={key}>
                                <CardHeader>
                                    <CardTitle>
                                        السنة {year} - الفصل {semester}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>الرمز</TableHead>
                                                <TableHead>
                                                    اسم المادة
                                                </TableHead>
                                                <TableHead>الساعات</TableHead>
                                                <TableHead>النوع</TableHead>
                                                <TableHead>الحالة</TableHead>
                                                <TableHead className="text-end">
                                                    الإجراءات
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {coursesInGroup.map((cc) => (
                                                <TableRow key={cc.id}>
                                                    <TableCell>
                                                        {cc.course.code}
                                                    </TableCell>
                                                    <TableCell>
                                                        {cc.course.nameAr}
                                                    </TableCell>
                                                    <TableCell>
                                                        {cc.course.credits}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                cc.course
                                                                    .type ===
                                                                "CORE"
                                                                    ? "default"
                                                                    : "secondary"
                                                            }>
                                                            {cc.course.type ===
                                                            "CORE"
                                                                ? "أساسي"
                                                                : cc.course
                                                                      .type ===
                                                                  "ELECTIVE"
                                                                ? "اختياري"
                                                                : "عام"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                cc.isRequired
                                                                    ? "default"
                                                                    : "outline"
                                                            }>
                                                            {cc.isRequired
                                                                ? "إجباري"
                                                                : "اختياري"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 sm:h-10 sm:w-10"
                                                            onClick={() =>
                                                                handleRemoveCourse(
                                                                    cc.id
                                                                )
                                                            }>
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                {curriculum.curriculumCourses.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-600 dark:text-gray-400">
                                لا توجد مواد في هذه الخطة الدراسية
                            </p>
                            <Button
                                onClick={() => setIsAddModalOpen(true)}
                                className="mt-4">
                                <Plus className="w-4 h-4 ml-2" />
                                إضافة أول مادة
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Add Course Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                                إضافة مادة للخطة الدراسية
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        المادة *
                                    </label>
                                    <select
                                        value={selectedCourse}
                                        onChange={(e) =>
                                            setSelectedCourse(e.target.value)
                                        }
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        <option value="">اختر المادة</option>
                                        {courses.map((course) => (
                                            <option
                                                key={course.id}
                                                value={course.id}>
                                                {course.code} - {course.nameAr}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            السنة *
                                        </label>
                                        <select
                                            value={year}
                                            onChange={(e) =>
                                                setYear(Number(e.target.value))
                                            }
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                            {[1, 2, 3, 4, 5, 6].map((y) => (
                                                <option key={y} value={y}>
                                                    السنة {y}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            الفصل *
                                        </label>
                                        <select
                                            value={semester}
                                            onChange={(e) =>
                                                setSemester(
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                            <option value={1}>الفصل 1</option>
                                            <option value={2}>الفصل 2</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={isRequired}
                                            onChange={(e) =>
                                                setIsRequired(e.target.checked)
                                            }
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">
                                            مادة إجبارية
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setSelectedCourse("");
                                        setSemester(1);
                                        setYear(1);
                                        setIsRequired(true);
                                    }}>
                                    إلغاء
                                </Button>
                                <Button
                                    onClick={handleAddCourse}
                                    disabled={!selectedCourse}
                                    className="w-full sm:w-auto">
                                    إضافة
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
