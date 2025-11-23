import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { departmentsService, collegesService } from "@/services/api";
import DepartmentModal from "@/components/modals/DepartmentModal";

interface Department {
    id: string;
    code: string;
    nameEn: string;
    nameAr: string;
    collegeId: string;
    college: {
        nameAr: string;
        nameEn: string;
    };
    createdAt: string;
}

export default function DepartmentsPage() {
    const { t } = useTranslation();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [colleges, setColleges] = useState<
        { id: string; nameAr: string; nameEn: string }[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<
        Department | undefined
    >();

    useEffect(() => {
        fetchDepartments();
        fetchColleges();
    }, []);

    const fetchColleges = async () => {
        try {
            const response = await collegesService.getAll();
            if (response.success) {
                setColleges(response.data.colleges);
            }
        } catch (error) {
            console.error("Error fetching colleges:", error);
        }
    };

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await departmentsService.getAll();
            if (response.success) {
                setDepartments(response.data.departments);
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("departments.deleteConfirm"))) return;

        try {
            await departmentsService.delete(id);
            fetchDepartments();
        } catch (error) {
            console.error("Error deleting department:", error);
            alert(t("pages.departments.deleteFailed"));
        }
    };

    const handleSubmit = async (data: {
        code: string;
        nameEn: string;
        nameAr: string;
        collegeId: string;
    }) => {
        try {
            console.log("Submitting department data:", data);
            if (selectedDepartment) {
                await departmentsService.update(selectedDepartment.id, data);
            } else {
                await departmentsService.create(data);
            }
            fetchDepartments();
            setIsModalOpen(false);
            setSelectedDepartment(undefined);
        } catch (error: any) {
            console.error("Error saving department:", error);
            console.error("Error response:", error.response?.data);
            alert(
                `${t("pages.departments.saveFailed")}: ${
                    error.response?.data?.message || error.message
                }`
            );
        }
    };

    const handleEdit = (department: Department) => {
        setSelectedDepartment(department);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedDepartment(undefined);
        setIsModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {t("departments.title")}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                            {t("pages.departments.subtitle")}
                        </p>
                    </div>
                    <Button onClick={handleCreate} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 me-2" />
                        {t("departments.create")}
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("departments.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.loading")}
                            </div>
                        ) : departments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.noData")}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {t("departments.code")}
                                        </TableHead>
                                        <TableHead>
                                            {t("departments.nameAr")}
                                        </TableHead>
                                        <TableHead>
                                            {t("departments.nameEn")}
                                        </TableHead>
                                        <TableHead>
                                            {t("departments.college")}
                                        </TableHead>
                                        <TableHead className="text-end">
                                            {t("common.actions")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departments.map((dept) => (
                                        <TableRow key={dept.id}>
                                            <TableCell className="font-medium">
                                                {dept.code}
                                            </TableCell>
                                            <TableCell>{dept.nameAr}</TableCell>
                                            <TableCell>{dept.nameEn}</TableCell>
                                            <TableCell>
                                                {dept.college.nameAr}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 sm:h-10 sm:w-10"
                                                        onClick={() =>
                                                            handleEdit(dept)
                                                        }>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 sm:h-10 sm:w-10"
                                                        onClick={() =>
                                                            handleDelete(
                                                                dept.id
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

                <DepartmentModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedDepartment(undefined);
                    }}
                    onSubmit={handleSubmit}
                    department={selectedDepartment}
                    colleges={colleges}
                />
            </div>
        </DashboardLayout>
    );
}
