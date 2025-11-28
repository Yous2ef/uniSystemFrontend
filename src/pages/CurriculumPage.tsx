import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
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
import { curriculumService, departmentsService } from "@/services/api";
import CurriculumModal from "@/components/modals/CurriculumModal";

interface Curriculum {
    id: string;
    name: string;
    version: string;
    totalCredits: number;
    effectiveFrom: string;
    department: {
        nameAr: string;
        nameEn: string;
    };
    _count: {
        curriculumCourses: number;
    };
}

export default function CurriculumPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [curricula, setCurricula] = useState<Curriculum[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCurriculum, setSelectedCurriculum] = useState<
        Curriculum | undefined
    >();
    const [departments, setDepartments] = useState<any[]>([]);

    useEffect(() => {
        fetchCurricula();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await departmentsService.getAll();
            if (response.success) {
                setDepartments(response.data.departments);
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const fetchCurricula = async () => {
        try {
            setLoading(true);
            const response = await curriculumService.getAll();
            if (response.success && response.data) {
                setCurricula(response.data.curricula || []);
            }
        } catch (error) {
            console.error("Error fetching curricula:", error);
            setCurricula([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("curriculum.deleteConfirm"))) return;

        try {
            await curriculumService.delete(id);
            fetchCurricula();
        } catch (error: any) {
            console.error("Error deleting curriculum:", error);
            const message =
                error?.response?.data?.message ||
                t("pages.curriculum.deleteFailed");
            alert(message);
        }
    };

    const handleCreate = () => {
        setSelectedCurriculum(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (curriculum: Curriculum) => {
        setSelectedCurriculum(curriculum);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data: any) => {
        try {
            console.log("Submitting curriculum data:", data);
            // Transform data for backend
            const payload = {
                departmentId: data.departmentId,
                name: data.name,
                version: data.version,
                totalCredits: Number(data.totalCredits),
                effectiveFrom: new Date(data.effectiveFrom).toISOString(),
                courses: [], // يمكن إضافة المواد لاحقاً من صفحة التفاصيل
            };

            if (selectedCurriculum) {
                await curriculumService.update(selectedCurriculum.id, {
                    name: payload.name,
                    version: payload.version,
                    totalCredits: payload.totalCredits,
                    effectiveFrom: payload.effectiveFrom,
                });
            } else {
                await curriculumService.create(payload);
            }
            fetchCurricula();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Error saving curriculum:", error);
            console.error("Error response:", error.response?.data);
            alert(
                `${t("pages.curriculum.saveFailed")}: ${
                    error.response?.data?.message || error.message
                }`
            );
            throw error;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {t("curriculum.title")}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                            {t("pages.curriculum.subtitle")}
                        </p>
                    </div>
                    <Button onClick={handleCreate} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 me-2" />
                        {t("curriculum.create")}
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("curriculum.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.loading")}
                            </div>
                        ) : curricula.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.noData")}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                {t("curriculum.name")}
                                            </TableHead>
                                            <TableHead>
                                                {t("curriculum.version")}
                                            </TableHead>
                                            <TableHead>
                                                {t("curriculum.specialization")}
                                            </TableHead>
                                            <TableHead>
                                                {t("curriculum.totalCredits")}
                                            </TableHead>
                                            <TableHead>
                                                {t("curriculum.courses")}
                                            </TableHead>
                                            <TableHead className="text-end">
                                                {t("common.actions")}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {curricula.map((curr) => (
                                            <TableRow key={curr.id}>
                                                <TableCell className="font-medium">
                                                    {curr.name}
                                                </TableCell>
                                                <TableCell>
                                                    {curr.version}
                                                </TableCell>
                                                <TableCell>
                                                    {curr.department.nameAr}
                                                </TableCell>
                                                <TableCell>
                                                    {curr.totalCredits}
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        curr._count
                                                            .curriculumCourses
                                                    }{" "}
                                                    مادة
                                                </TableCell>
                                                <TableCell className="text-end">
                                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 sm:h-10 sm:w-10"
                                                            title="إدارة المواد"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/curriculum/${curr.id}`
                                                                )
                                                            }>
                                                            <BookOpen className="w-4 h-4 text-blue-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 sm:h-10 sm:w-10"
                                                            onClick={() =>
                                                                handleEdit(curr)
                                                            }>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 sm:h-10 sm:w-10"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    curr.id
                                                                )
                                                            }>
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

            <CurriculumModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                curriculum={selectedCurriculum as any}
                departments={departments}
            />
        </DashboardLayout>
    );
}
