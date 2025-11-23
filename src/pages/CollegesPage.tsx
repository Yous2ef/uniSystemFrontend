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
import { collegesService } from "@/services/api";
import CollegeModal from "@/components/modals/CollegeModal";

interface College {
    id: string;
    code: string;
    nameEn: string;
    nameAr: string;
    description?: string;
    createdAt: string;
}

export default function CollegesPage() {
    const { t } = useTranslation();
    const [colleges, setColleges] = useState<College[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState<College | undefined>();

    useEffect(() => {
        fetchColleges();
    }, []);

    const fetchColleges = async () => {
        try {
            setLoading(true);
            const response = await collegesService.getAll();
            if (response.success) {
                setColleges(response.data.colleges);
            }
        } catch (error) {
            console.error("Error fetching colleges:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("colleges.deleteConfirm"))) return;

        try {
            await collegesService.delete(id);
            fetchColleges();
        } catch (error) {
            console.error("Error deleting college:", error);
            alert(t("pages.colleges.deleteFailed"));
        }
    };

    const handleCreate = () => {
        setSelectedCollege(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (college: College) => {
        setSelectedCollege(college);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data: any) => {
        try {
            console.log("Submitting college data:", data);
            if (selectedCollege) {
                await collegesService.update(selectedCollege.id, data);
            } else {
                await collegesService.create(data);
            }
            fetchColleges();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Error saving college:", error);
            console.error("Error response:", error.response?.data);
            alert(`${t("pages.colleges.deleteFailed")}: ${error.response?.data?.message || error.message}`);
            throw error;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {t("colleges.title")}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                            {t("pages.colleges.subtitle")}
                        </p>
                    </div>
                    <Button onClick={handleCreate} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 me-2" />
                        {t("colleges.create")}
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t("colleges.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.loading")}
                            </div>
                        ) : colleges.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.noData")}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {t("colleges.code")}
                                        </TableHead>
                                        <TableHead>
                                            {t("colleges.nameAr")}
                                        </TableHead>
                                        <TableHead>
                                            {t("colleges.nameEn")}
                                        </TableHead>
                                        <TableHead>
                                            {t("colleges.createdAt")}
                                        </TableHead>
                                        <TableHead className="text-end">
                                            {t("common.actions")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {colleges.map((college) => (
                                        <TableRow key={college.id}>
                                            <TableCell className="font-medium">
                                                {college.code}
                                            </TableCell>
                                            <TableCell>
                                                {college.nameAr}
                                            </TableCell>
                                            <TableCell>
                                                {college.nameEn}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    college.createdAt
                                                ).toLocaleDateString("ar-EG")}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 sm:h-10 sm:w-10"
                                                        onClick={() =>
                                                            handleEdit(college)
                                                        }>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 sm:h-10 sm:w-10"
                                                        onClick={() =>
                                                            handleDelete(
                                                                college.id
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

            <CollegeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                college={selectedCollege}
            />
        </DashboardLayout>
    );
}
