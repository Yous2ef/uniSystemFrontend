import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, BarChart3, Power } from "lucide-react";
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
import { termsService } from "@/services/api";
import TermModal from "@/components/modals/TermModal";

interface AcademicTerm {
    id: string;
    batchId: string;
    name: string;
    type: "FALL" | "SPRING" | "SUMMER";
    status: "ACTIVE" | "INACTIVE" | "COMPLETED";
    startDate: string;
    endDate: string;
    registrationStart: string;
    registrationEnd: string;
    sectionsCount?: number;
}

export default function TermsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [terms, setTerms] = useState<AcademicTerm[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState<
        AcademicTerm | undefined
    >();

    useEffect(() => {
        fetchTerms();
    }, []);

    const fetchTerms = async () => {
        try {
            setLoading(true);
            const response = await termsService.getAll();
            if (response.success) {
                setTerms(response.data.terms);
            }
        } catch (error) {
            console.error("Error fetching terms:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("terms.deleteConfirm"))) return;

        try {
            await termsService.delete(id);
            fetchTerms();
        } catch (error) {
            console.error("Error deleting term:", error);
            alert(t("pages.terms.deleteFailed"));
        }
    };

    const handleActivate = async (term: AcademicTerm) => {
        if (term.status === "ACTIVE") {
            alert(t("pages.terms.alreadyActive"));
            return;
        }

        if (
            !confirm(
                t("pages.terms.activateConfirm").replace("{name}", term.name)
            )
        )
            return;

        try {
            await termsService.update(term.id, { status: "ACTIVE" });
            fetchTerms();
        } catch (error) {
            console.error("Error activating term:", error);
            alert(t("pages.terms.activateFailed"));
        }
    };

    const handleViewStats = (id: string) => {
        navigate(`/terms/${id}`);
    };

    const getTermTypeBadge = (type: string) => {
        const variants: Record<string, "default" | "secondary" | "outline"> = {
            FALL: "default",
            SPRING: "secondary",
            SUMMER: "outline",
        };
        return (
            <Badge variant={variants[type] || "default"}>
                {t(`terms.types.${type}`)}
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        const statusStyles: Record<string, string> = {
            ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            INACTIVE:
                "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
            COMPLETED:
                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        };
        return (
            <Badge className={statusStyles[status] || ""}>
                {t(`pages.terms.statuses.${status}`)}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {t("terms.title")}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                            {t("pages.terms.subtitle")}
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedTerm(undefined);
                            setModalOpen(true);
                        }}
                        className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 me-2" />
                        {t("terms.create")}
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("terms.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.loading")}
                            </div>
                        ) : terms.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.noData")}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("terms.name")}</TableHead>
                                        <TableHead>{t("terms.type")}</TableHead>
                                        <TableHead>{t("common.status")}</TableHead>
                                        <TableHead>
                                            {t("terms.startDate")}
                                        </TableHead>
                                        <TableHead>
                                            {t("terms.endDate")}
                                        </TableHead>
                                        <TableHead>
                                            {t("terms.registrationStart")}
                                        </TableHead>
                                        <TableHead>
                                            {t("terms.registrationEnd")}
                                        </TableHead>
                                        <TableHead>
                                            {t("terms.sectionsCount")}
                                        </TableHead>
                                        <TableHead className="text-end">
                                            {t("common.actions")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {terms.map((term) => (
                                        <TableRow key={term.id}>
                                            <TableCell className="font-medium">
                                                {term.name}
                                            </TableCell>
                                            <TableCell>
                                                {getTermTypeBadge(term.type)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(term.status)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(term.startDate)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(term.endDate)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    term.registrationStart
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    term.registrationEnd
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {term.sectionsCount || 0}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 sm:h-10 sm:w-10"
                                                        onClick={() =>
                                                            handleViewStats(
                                                                term.id
                                                            )
                                                        }>
                                                        <BarChart3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 sm:h-10 sm:w-10"
                                                        onClick={() =>
                                                            handleActivate(term)
                                                        }
                                                        disabled={
                                                            term.status ===
                                                            "ACTIVE"
                                                        }
                                                        title={
                                                            term.status ===
                                                            "ACTIVE"
                                                                ? t("pages.terms.alreadyActive")
                                                                : t("pages.terms.activate")
                                                        }>
                                                        <Power
                                                            className={`w-4 h-4 ${
                                                                term.status ===
                                                                "ACTIVE"
                                                                    ? "text-green-600"
                                                                    : "text-gray-600"
                                                            }`}
                                                        />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 sm:h-10 sm:w-10"
                                                        onClick={() => {
                                                            setSelectedTerm(
                                                                term
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
                                                                term.id
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
            <TermModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchTerms}
                term={selectedTerm}
            />
        </DashboardLayout>
    );
}
