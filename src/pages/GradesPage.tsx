import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Save, Eye } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { gradesService, sectionsService, termsService } from "@/services/api";

interface GradeComponent {
    id: string;
    name: string;
    weight: number;
    maxScore: number;
}

interface Student {
    id: string;
    studentCode: string;
    nameAr: string;
    enrollmentId: string;
}

export default function GradesPage() {
    const { t } = useTranslation();
    const [terms, setTerms] = useState<{ id: string; name: string }[]>([]);
    const [sections, setSections] = useState<
        { id: string; code: string; course: { nameAr: string } }[]
    >([]);
    const [selectedTerm, setSelectedTerm] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [components, setComponents] = useState<GradeComponent[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [grades, setGrades] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const response = await termsService.getAll();
                if (response.success) {
                    setTerms(response.data.terms);
                }
            } catch (error) {
                console.error("Error fetching terms:", error);
            }
        };
        fetchTerms();
    }, []);

    useEffect(() => {
        const fetchSections = async () => {
            if (!selectedTerm) return;
            try {
                const response = await sectionsService.getAll({
                    termId: selectedTerm,
                });
                if (response.success) {
                    setSections(response.data.sections);
                }
            } catch (error) {
                console.error("Error fetching sections:", error);
            }
        };
        fetchSections();
    }, [selectedTerm]);

    useEffect(() => {
        const fetchComponents = async () => {
            if (!selectedSection) return;
            try {
                const response = await gradesService.getSectionComponents(
                    selectedSection
                );
                if (response.success) {
                    setComponents(response.data.components);
                }
            } catch (error) {
                console.error("Error fetching components:", error);
            }
        };

        const fetchStudents = async () => {
            if (!selectedSection) return;
            try {
                setStudents([
                    {
                        id: "s1",
                        studentCode: "2021001",
                        nameAr: "أحمد محمد",
                        enrollmentId: "e1",
                    },
                ]);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };

        fetchComponents();
        fetchStudents();
    }, [selectedSection]);

    const handleGradeChange = (
        enrollmentId: string,
        componentId: string,
        score: string
    ) => {
        const key = `${enrollmentId}-${componentId}`;
        setGrades({
            ...grades,
            [key]: parseFloat(score) || 0,
        });
    };

    const handleSaveGrades = async () => {
        try {
            setLoading(true);
            const updates = Object.entries(grades).map(([key, score]) => {
                const [enrollmentId, componentId] = key.split("-");
                return gradesService.recordGrade({
                    enrollmentId,
                    componentId,
                    score,
                });
            });

            await Promise.all(updates);
            alert(t("pages.grades.saveSuccess"));
            setGrades({});
        } catch (error) {
            console.error("Error saving grades:", error);
            alert(t("pages.grades.saveFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handlePublishGrades = async () => {
        if (
            !confirm(
                t("pages.grades.publishConfirm")
            )
        )
            return;

        try {
            setLoading(true);
            await gradesService.publishFinalGrades(selectedSection);
            alert(t("pages.grades.publishSuccess"));
        } catch (error) {
            console.error("Error publishing grades:", error);
            alert(t("pages.grades.publishFailed"));
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (enrollmentId: string) => {
        return components.reduce((total, component) => {
            const key = `${enrollmentId}-${component.id}`;
            return total + (grades[key] || 0);
        }, 0);
    };

    const getLetterGrade = (percentage: number) => {
        if (percentage >= 90) return "A";
        if (percentage >= 80) return "B";
        if (percentage >= 70) return "C";
        if (percentage >= 60) return "D";
        return "F";
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {t("pages.grades.title")}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {t("pages.grades.subtitle")}
                        </p>
                    </div>
                    {selectedSection && (
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSaveGrades}
                                disabled={
                                    Object.keys(grades).length === 0 || loading
                                }>
                                <Save className="w-4 h-4 me-2" />
                                {t("pages.grades.saveGrades")}
                            </Button>
                            <Button
                                variant="default"
                                onClick={handlePublishGrades}
                                disabled={loading}>
                                <Eye className="w-4 h-4 me-2" />
                                نشر الدرجات
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>الفصل الدراسي</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <select
                                value={selectedTerm}
                                onChange={(e) =>
                                    setSelectedTerm(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                <option value="">اختر الفصل</option>
                                {terms.map((term) => (
                                    <option key={term.id} value={term.id}>
                                        {term.name}
                                    </option>
                                ))}
                            </select>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>الشعبة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <select
                                value={selectedSection}
                                onChange={(e) =>
                                    setSelectedSection(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                disabled={!selectedTerm}>
                                <option value="">اختر الشعبة</option>
                                {sections.map((section) => (
                                    <option key={section.id} value={section.id}>
                                        {section.course.nameAr} - {section.code}
                                    </option>
                                ))}
                            </select>
                        </CardContent>
                    </Card>
                </div>

                {selectedSection && components.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>عناصر التقييم</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {components.map((component) => (
                                    <Badge key={component.id} variant="outline">
                                        {component.name} ({component.weight}% -{" "}
                                        {component.maxScore} نقطة)
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {selectedSection && (
                    <Card>
                        <CardHeader>
                            <CardTitle>درجات الطلاب</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            {components.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">
                                    الرجاء إضافة عناصر التقييم أولاً
                                </p>
                            ) : students.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">
                                    لا يوجد طلاب مسجلين في هذه الشعبة
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>الرقم الجامعي</TableHead>
                                            <TableHead>الاسم</TableHead>
                                            {components.map((component) => (
                                                <TableHead key={component.id}>
                                                    {component.name}
                                                    <br />
                                                    <span className="text-xs text-gray-500">
                                                        ({component.maxScore})
                                                    </span>
                                                </TableHead>
                                            ))}
                                            <TableHead>المجموع</TableHead>
                                            <TableHead>التقدير</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((student) => {
                                            const total = calculateTotal(
                                                student.enrollmentId
                                            );
                                            const maxTotal = components.reduce(
                                                (sum, c) => sum + c.maxScore,
                                                0
                                            );
                                            const percentage =
                                                (total / maxTotal) * 100;
                                            const letterGrade =
                                                getLetterGrade(percentage);

                                            return (
                                                <TableRow key={student.id}>
                                                    <TableCell>
                                                        {student.studentCode}
                                                    </TableCell>
                                                    <TableCell>
                                                        {student.nameAr}
                                                    </TableCell>
                                                    {components.map(
                                                        (component) => (
                                                            <TableCell
                                                                key={
                                                                    component.id
                                                                }>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max={
                                                                        component.maxScore
                                                                    }
                                                                    step="0.5"
                                                                    className="w-20"
                                                                    value={
                                                                        grades[
                                                                            `${student.enrollmentId}-${component.id}`
                                                                        ] || ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleGradeChange(
                                                                            student.enrollmentId,
                                                                            component.id,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                />
                                                            </TableCell>
                                                        )
                                                    )}
                                                    <TableCell className="font-bold">
                                                        {total.toFixed(2)} /{" "}
                                                        {maxTotal}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                letterGrade ===
                                                                "F"
                                                                    ? "destructive"
                                                                    : "default"
                                                            }>
                                                            {letterGrade}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
