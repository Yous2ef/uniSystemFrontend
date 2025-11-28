import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
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
import { studentsService } from "@/services/api";
import StudentModal from "@/components/modals/StudentModal";
import ImportStudentsModal from "@/components/modals/ImportStudentsModal";
import { useNavigate } from "react-router-dom";

interface Student {
    id: string;
    studentCode: string;
    nameEn: string;
    nameAr: string;
    phone?: string;
    batchId: string;
    status: "ACTIVE" | "DEFERRED" | "DISMISSED" | "GRADUATED";
    user: {
        email: string;
        status: string;
    };
    batch: {
        name: string;
        year: number;
    };
    department?: {
        nameAr: string;
        nameEn: string;
    };
    cumulativeGpa?: {
        cgpa: number;
        totalCredits: number;
        academicStanding: string;
    };
}

export default function StudentsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<
        Student | undefined
    >();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await studentsService.getAll();
            if (response.success) {
                setStudents(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("students.deleteConfirm"))) return;

        try {
            await studentsService.delete(id);
            fetchStudents();
        } catch (error) {
            console.error("Error deleting student:", error);
            alert(t("pages.students.deleteFailed"));
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
        return (
            <Badge variant={variants[status] || "default"}>
                {t(`students.statuses.${status}`)}
            </Badge>
        );
    };

    const filteredStudents = (students || []).filter(
        (student) =>
            student.studentCode
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            student.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.nameAr.includes(searchTerm) ||
            student.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {t("students.title")}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                            {t("pages.students.subtitle")}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => setImportModalOpen(true)}
                            className="w-full sm:w-auto">
                            <Upload className="w-4 h-4 me-2" />
                            {t("students.import")}
                        </Button>
                        <Button
                            onClick={() => {
                                setSelectedStudent(undefined);
                                setModalOpen(true);
                            }}
                            className="w-full sm:w-auto">
                            <Plus className="w-4 h-4 me-2" />
                            {t("students.create")}
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("students.title")}</CardTitle>
                        <div className="mt-4">
                            <input
                                type="text"
                                placeholder={t("common.search")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.loading")}
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.noData")}
                            </div>
                        ) : (
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
                                                {t("students.nameEn")}
                                            </TableHead>
                                            <TableHead>
                                                {t("students.email")}
                                            </TableHead>
                                            <TableHead>
                                                {t("students.batch")}
                                            </TableHead>
                                            <TableHead>
                                                {t("students.department")}
                                            </TableHead>
                                            <TableHead>
                                                {t("students.gpa")}
                                            </TableHead>
                                            <TableHead>
                                                {t("students.earnedCredits")}
                                            </TableHead>
                                            <TableHead>
                                                {t("students.status")}
                                            </TableHead>
                                            <TableHead className="text-end">
                                                {t("common.actions")}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStudents.map((student) => (
                                            <TableRow
                                                key={student.id}
                                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                                onClick={() => {
                                                    navigate(
                                                        `/students/${student.id}`
                                                    );
                                                }}>
                                                <TableCell className="font-medium">
                                                    {student.studentCode}
                                                </TableCell>
                                                <TableCell>
                                                    {student.nameAr}
                                                </TableCell>
                                                <TableCell>
                                                    {student.nameEn}
                                                </TableCell>
                                                <TableCell>
                                                    {student.user.email}
                                                </TableCell>
                                                <TableCell>
                                                    {student.batch.name}
                                                </TableCell>
                                                <TableCell>
                                                    {student.department
                                                        ?.nameAr || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {student.cumulativeGpa?.cgpa.toFixed(
                                                        2
                                                    ) || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {student.cumulativeGpa
                                                        ?.totalCredits || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(
                                                        student.status
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-end">
                                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 sm:h-10 sm:w-10"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedStudent(
                                                                    student
                                                                );
                                                                setModalOpen(
                                                                    true
                                                                );
                                                            }}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 sm:h-10 sm:w-10"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(
                                                                    student.id
                                                                );
                                                            }}>
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <StudentModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchStudents}
                student={selectedStudent as any}
            />
            <ImportStudentsModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onSuccess={fetchStudents}
            />
        </DashboardLayout>
    );
}
