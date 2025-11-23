import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
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
import {
    attendanceService,
    sectionsService,
    termsService,
} from "@/services/api";

interface Student {
    id: string;
    studentCode: string;
    nameAr: string;
    enrollmentId: string;
    attendance?: "PRESENT" | "ABSENT" | "EXCUSED";
}

export default function AttendancePage() {
    const { t } = useTranslation();
    const [terms, setTerms] = useState<{ id: string; name: string }[]>([]);
    const [sections, setSections] = useState<
        { id: string; code: string; course: { nameAr: string } }[]
    >([]);
    const [selectedTerm, setSelectedTerm] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<
        Record<string, "PRESENT" | "ABSENT" | "EXCUSED">
    >({});
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
        if (!selectedSection) return;

        const fetchStudents = async () => {
            try {
                // Mock data - would fetch enrollments for the section
                setStudents([
                    {
                        id: "s1",
                        studentCode: "2021001",
                        nameAr: "أحمد محمد",
                        enrollmentId: "e1",
                    },
                    {
                        id: "s2",
                        studentCode: "2021002",
                        nameAr: "فاطمة علي",
                        enrollmentId: "e2",
                    },
                    {
                        id: "s3",
                        studentCode: "2021003",
                        nameAr: "محمد حسن",
                        enrollmentId: "e3",
                    },
                ]);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };

        fetchStudents();
    }, [selectedSection]);

    const handleMarkAttendance = (
        enrollmentId: string,
        status: "PRESENT" | "ABSENT" | "EXCUSED"
    ) => {
        setAttendance({
            ...attendance,
            [enrollmentId]: status,
        });
    };

    const handleSaveAttendance = async () => {
        try {
            setLoading(true);
            const updates = Object.entries(attendance).map(
                ([enrollmentId, status]) => {
                    return attendanceService.mark({
                        enrollmentId,
                        sessionDate: new Date(selectedDate),
                        status,
                    });
                }
            );

            await Promise.all(updates);
            alert(t("pages.attendance.saveSuccess"));
            setAttendance({});
        } catch (error) {
            console.error("Error saving attendance:", error);
            alert(t("pages.attendance.saveFailed"));
        } finally {
            setLoading(false);
        }
    };

    const getAttendanceStats = () => {
        const present = Object.values(attendance).filter(
            (s) => s === "PRESENT"
        ).length;
        const absent = Object.values(attendance).filter(
            (s) => s === "ABSENT"
        ).length;
        const excused = Object.values(attendance).filter(
            (s) => s === "EXCUSED"
        ).length;
        return { present, absent, excused };
    };

    const stats = getAttendanceStats();

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {t("pages.attendance.title")}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {t("pages.attendance.subtitle")}
                        </p>
                    </div>
                    {selectedSection && (
                        <Button
                            onClick={handleSaveAttendance}
                            disabled={
                                Object.keys(attendance).length === 0 || loading
                            }>
                            <Calendar className="w-4 h-4 me-2" />
                            {t("pages.attendance.saveAttendance")}
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="grid grid-cols-3 gap-4">
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

                    <Card>
                        <CardHeader>
                            <CardTitle>التاريخ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <input
                                type="date"
                                lang="en"
                                value={selectedDate}
                                onChange={(e) =>
                                    setSelectedDate(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Statistics */}
                {selectedSection && Object.keys(attendance).length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {stats.present}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            حاضر
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <XCircle className="w-8 h-8 text-red-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {stats.absent}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            غائب
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {stats.excused}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            غياب بعذر
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Attendance Table */}
                {selectedSection && (
                    <Card>
                        <CardHeader>
                            <CardTitle>قائمة الحضور</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {students.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">
                                    لا يوجد طلاب مسجلين في هذه الشعبة
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>الرقم الجامعي</TableHead>
                                            <TableHead>الاسم</TableHead>
                                            <TableHead>الحالة</TableHead>
                                            <TableHead className="text-end">
                                                الإجراءات
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((student, index) => {
                                            const status =
                                                attendance[
                                                    student.enrollmentId
                                                ];
                                            return (
                                                <TableRow key={student.id}>
                                                    <TableCell>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        {student.studentCode}
                                                    </TableCell>
                                                    <TableCell>
                                                        {student.nameAr}
                                                    </TableCell>
                                                    <TableCell>
                                                        {status ? (
                                                            <Badge
                                                                variant={
                                                                    status ===
                                                                    "PRESENT"
                                                                        ? "default"
                                                                        : status ===
                                                                          "ABSENT"
                                                                        ? "destructive"
                                                                        : "secondary"
                                                                }>
                                                                {status ===
                                                                "PRESENT"
                                                                    ? "حاضر"
                                                                    : status ===
                                                                      "ABSENT"
                                                                    ? "غائب"
                                                                    : "غياب بعذر"}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">
                                                                لم يتم التسجيل
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-end">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    status ===
                                                                    "PRESENT"
                                                                        ? "default"
                                                                        : "outline"
                                                                }
                                                                onClick={() =>
                                                                    handleMarkAttendance(
                                                                        student.enrollmentId,
                                                                        "PRESENT"
                                                                    )
                                                                }>
                                                                <CheckCircle className="w-4 h-4 me-1" />
                                                                حاضر
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    status ===
                                                                    "ABSENT"
                                                                        ? "destructive"
                                                                        : "outline"
                                                                }
                                                                onClick={() =>
                                                                    handleMarkAttendance(
                                                                        student.enrollmentId,
                                                                        "ABSENT"
                                                                    )
                                                                }>
                                                                <XCircle className="w-4 h-4 me-1" />
                                                                غائب
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    status ===
                                                                    "EXCUSED"
                                                                        ? "secondary"
                                                                        : "outline"
                                                                }
                                                                onClick={() =>
                                                                    handleMarkAttendance(
                                                                        student.enrollmentId,
                                                                        "EXCUSED"
                                                                    )
                                                                }>
                                                                <AlertCircle className="w-4 h-4 me-1" />
                                                                بعذر
                                                            </Button>
                                                        </div>
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
