import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Plus, Pencil, Trash2, Calendar, Users } from "lucide-react";
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
import { sectionsService } from "@/services/api";
import SectionModal from "@/components/modals/SectionModal";
import SectionScheduleModal from "@/components/modals/SectionScheduleModal";

interface Section {
    id: string;
    code: string;
    capacity: number;
    courseId: string;
    termId: string;
    facultyId: string;
    course: {
        code: string;
        nameAr: string;
        nameEn: string;
    };
    term: {
        name: string;
        type: string;
    };
    faculty: {
        nameAr: string;
        nameEn: string;
    };
    schedules?: {
        id: string;
        day: string;
        startTime: string;
        endTime: string;
        room?: string;
    }[];
    _count?: {
        enrollments: number;
    };
}

export default function SectionsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<
        Section | undefined
    >();

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const response = await sectionsService.getAll();
            if (response.success) {
                setSections(response.data.sections);
            }
        } catch (error) {
            console.error("Error fetching sections:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("sections.deleteConfirm"))) return;

        try {
            await sectionsService.delete(id);
            fetchSections();
        } catch (error) {
            console.error("Error deleting section:", error);
            alert(t("pages.sections.deleteFailed"));
        }
    };

    const getCapacityBadge = (enrolled: number, capacity: number) => {
        const percentage = (enrolled / capacity) * 100;
        if (percentage >= 90) {
            return (
                <Badge variant="destructive">
                    {enrolled}/{capacity}
                </Badge>
            );
        } else if (percentage >= 70) {
            return (
                <Badge variant="secondary">
                    {enrolled}/{capacity}
                </Badge>
            );
        }
        return (
            <Badge variant="default">
                {enrolled}/{capacity}
            </Badge>
        );
    };

    const filteredSections = sections.filter(
        (section) =>
            section.course.code
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            section.course.nameEn
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            section.course.nameAr.includes(searchTerm) ||
            section.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {t("sections.title")}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                            {t("pages.sections.subtitle")}
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedSection(undefined);
                            setModalOpen(true);
                        }}
                        className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 me-2" />
                        {t("sections.create")}
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("sections.title")}</CardTitle>
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
                        ) : filteredSections.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.noData")}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                {t("sections.course")}
                                            </TableHead>
                                            <TableHead>
                                                {t("sections.sectionCode")}
                                            </TableHead>
                                            <TableHead>
                                                {t("sections.term")}
                                            </TableHead>
                                            <TableHead>
                                                {t("sections.faculty")}
                                            </TableHead>
                                            <TableHead>
                                                {t("sections.enrolled")} /{" "}
                                                {t("sections.capacity")}
                                            </TableHead>
                                            <TableHead>
                                                {t("sections.schedules")}
                                            </TableHead>
                                            <TableHead className="text-end">
                                                {t("common.actions")}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSections.map((section) => (
                                            <TableRow key={section.id}>
                                                <TableCell className="font-medium">
                                                    <div>
                                                        <div className="font-semibold">
                                                            {
                                                                section.course
                                                                    .code
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {
                                                                section.course
                                                                    .nameAr
                                                            }
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {section.code}
                                                </TableCell>
                                                <TableCell>
                                                    {section.term.name}
                                                </TableCell>
                                                <TableCell>
                                                    {section.faculty.nameAr}
                                                </TableCell>
                                                <TableCell>
                                                    {getCapacityBadge(
                                                        section._count
                                                            ?.enrollments || 0,
                                                        section.capacity
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex items-center gap-1"
                                                        onClick={() => {
                                                            setSelectedSection(
                                                                section
                                                            );
                                                            setScheduleModalOpen(
                                                                true
                                                            );
                                                        }}>
                                                        <Calendar className="w-3 h-3" />
                                                        {section.schedules
                                                            ?.length || 0}
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="text-end">
                                                    <div className="flex items-center justify-end gap-1 sm:gap-2 flex-wrap">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/sections/${section.id}/students`
                                                                )
                                                            }
                                                            className="flex items-center gap-1 text-xs sm:text-sm">
                                                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            الطلاب
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 sm:h-10 sm:w-10"
                                                            onClick={() => {
                                                                setSelectedSection(
                                                                    section
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
                                                            onClick={() =>
                                                                handleDelete(
                                                                    section.id
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
            <SectionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchSections}
                section={selectedSection}
            />
            <SectionScheduleModal
                open={scheduleModalOpen}
                onClose={() => setScheduleModalOpen(false)}
                section={selectedSection as any}
            />
        </DashboardLayout>
    );
}
