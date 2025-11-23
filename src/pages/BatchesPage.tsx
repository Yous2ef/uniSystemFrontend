import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, BarChart3 } from "lucide-react";
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
import { batchesService } from "@/services/api";
import BatchModal from "@/components/modals/BatchModal";

interface Batch {
    id: string;
    name: string;
    year: number;
    maxCredits: number;
    departmentId: string | null;
    curriculumId: string;
    department: {
        nameAr: string;
        nameEn: string;
    } | null;
    curriculum: {
        name: string;
    };
    studentsCount?: number;
}

export default function BatchesPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | undefined>();

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const response = await batchesService.getAll();
            // Backend returns array directly, not wrapped in data.batches
            if (Array.isArray(response)) {
                setBatches(response);
            } else if (response.success && response.data) {
                // Handle if wrapped in success/data structure
                setBatches(
                    Array.isArray(response.data)
                        ? response.data
                        : response.data.batches || []
                );
            } else {
                setBatches([]);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
            setBatches([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("batches.deleteConfirm"))) return;

        try {
            await batchesService.delete(id);
            fetchBatches();
        } catch (error) {
            console.error("Error deleting batch:", error);
            alert(t("pages.batches.deleteFailed"));
        }
    };

    const handleViewStats = (id: string) => {
        navigate(`/batches/${id}`);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {t("batches.title")}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                            {t("pages.batches.subtitle")}
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedBatch(undefined);
                            setModalOpen(true);
                        }}
                        className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 me-2" />
                        {t("batches.create")}
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("batches.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.loading")}
                            </div>
                        ) : batches.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.noData")}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {t("batches.name")}
                                        </TableHead>
                                        <TableHead>
                                            {t("batches.year")}
                                        </TableHead>
                                        <TableHead>
                                            {t("batches.department")}
                                        </TableHead>
                                        <TableHead>
                                            {t("batches.curriculum")}
                                        </TableHead>
                                        <TableHead>
                                            {t("batches.maxCredits")}
                                        </TableHead>
                                        <TableHead>
                                            {t("batches.studentsCount")}
                                        </TableHead>
                                        <TableHead className="text-end">
                                            {t("common.actions")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batches.map((batch) => (
                                        <TableRow key={batch.id}>
                                            <TableCell className="font-medium">
                                                {batch.name}
                                            </TableCell>
                                            <TableCell>{batch.year}</TableCell>
                                            <TableCell>
                                                {batch.department?.nameAr ||
                                                    "غير محدد"}
                                            </TableCell>
                                            <TableCell>
                                                {batch.curriculum.name}
                                            </TableCell>
                                            <TableCell>
                                                {batch.maxCredits}
                                            </TableCell>
                                            <TableCell>
                                                {batch.studentsCount || 0}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 sm:h-10 sm:w-10"
                                                        onClick={() =>
                                                            handleViewStats(
                                                                batch.id
                                                            )
                                                        }>
                                                        <BarChart3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 sm:h-10 sm:w-10"
                                                        onClick={() => {
                                                            setSelectedBatch(
                                                                batch
                                                            );
                                                            setModalOpen(true);
                                                        }}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 sm:h-10 sm:w-10"
                                                        onClick={() =>
                                                            handleDelete(
                                                                batch.id
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
            <BatchModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchBatches}
                batch={selectedBatch}
            />
        </DashboardLayout>
    );
}
