import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { Badge } from "@/components/ui/badge";
import { facultyService } from "@/services/api";
import FacultyModal from "@/components/modals/FacultyModal";

interface Faculty {
    id: string;
    staffCode: string;
    nameEn: string;
    nameAr: string;
    phone?: string;
    type: "FACULTY" | "TA";
    user: {
        email: string;
        status: string;
    };
}

export default function FacultyPage() {
    const { t } = useTranslation();
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState<
        Faculty | undefined
    >();

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            setLoading(true);
            const response = await facultyService.getAll();
            if (response.success) {
                setFaculty(response.data.faculty);
            }
        } catch (error) {
            console.error("Error fetching faculty:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("faculty.deleteConfirm"))) return;

        try {
            await facultyService.delete(id);
            fetchFaculty();
        } catch (error) {
            console.error("Error deleting faculty:", error);
            alert(t("pages.faculty.deleteFailed"));
        }
    };

    const getTypeBadge = (type: string) => {
        return (
            <Badge variant={type === "FACULTY" ? "default" : "secondary"}>
                {type === "FACULTY" ? t("pages.faculty.facultyMember") : t("pages.faculty.teachingAssistant")}
            </Badge>
        );
    };

    const filteredFaculty = faculty.filter(
        (member) =>
            member.staffCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.nameAr.includes(searchTerm) ||
            member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {t("faculty.title")}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                            {t("pages.faculty.subtitle")}
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedFaculty(undefined);
                            setModalOpen(true);
                        }}
                        className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 me-2" />
                        {t("faculty.create")}
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("faculty.title")}</CardTitle>
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
                        ) : filteredFaculty.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.noData")}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("pages.faculty.staffCode")}</TableHead>
                                        <TableHead>{t("pages.faculty.nameAr")}</TableHead>
                                        <TableHead>{t("pages.faculty.nameEn")}</TableHead>
                                        <TableHead>{t("pages.faculty.email")}</TableHead>
                                        <TableHead>{t("pages.faculty.phone")}</TableHead>
                                        <TableHead>{t("pages.faculty.type")}</TableHead>
                                        <TableHead className="text-end">
                                            {t("common.actions")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFaculty.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell className="font-medium">
                                                {member.staffCode}
                                            </TableCell>
                                            <TableCell>
                                                {member.nameAr}
                                            </TableCell>
                                            <TableCell>
                                                {member.nameEn}
                                            </TableCell>
                                            <TableCell>
                                                {member.user.email}
                                            </TableCell>
                                            <TableCell>
                                                {member.phone || "-"}
                                            </TableCell>
                                            <TableCell>
                                                {getTypeBadge(member.type)}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 sm:h-10 sm:w-10"
                                                        title="عرض الشعب"
                                                        onClick={() => {
                                                            // TODO: Navigate to faculty sections
                                                        }}>
                                                        <BookOpen className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 sm:h-10 sm:w-10"
                                                        onClick={() => {
                                                            setSelectedFaculty(
                                                                member
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
                                                                member.id
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
            <FacultyModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchFaculty}
                faculty={selectedFaculty}
            />
        </DashboardLayout>
    );
}
