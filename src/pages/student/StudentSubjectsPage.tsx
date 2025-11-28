import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/auth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, User, Calendar, ChevronLeft } from "lucide-react";
import { enrollmentsService } from "@/services/api";

interface CourseEnrollment {
    id: string;
    status: string;
    enrolledAt: string;
    section: {
        id: string;
        code: string;
        course: {
            id: string;
            code: string;
            nameAr: string;
            nameEn: string;
            credits: number;
            departmentId?: string | null;
        };
        term: {
            id: string;
            name: string;
            type: string;
            status: string;
        };
        faculty: {
            nameAr: string;
            nameEn: string;
        };
        schedules: Array<{
            day: number;
            startTime: string;
            endTime: string;
            room: string;
        }>;
    };
}

export default function StudentSubjectsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
    const [filter, setFilter] = useState<"current" | "all">("current");

    useEffect(() => {
        fetchEnrollments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            console.log("📚 Fetching enrollments for user:", user?.id);

            const response = await enrollmentsService.getMyEnrollments({
                status: "ENROLLED",
            });

            console.log("📦 Enrollments response:", response);

            if (response.success) {
                const data = Array.isArray(response.data) ? response.data : [];
                console.log("✅ Enrollments data:", data);
                setEnrollments(data);
            }
        } catch (error) {
            console.error("❌ Error fetching enrollments:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            ENROLLED:
                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            COMPLETED:
                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            DROPPED:
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
        return (
            <Badge className={statusColors[status] || ""}>
                {t(`student.subjects.status.${status}`)}
            </Badge>
        );
    };

    const getTermStatusBadge = (status: string) => {
        if (status === "ACTIVE") {
            return (
                <Badge variant="default">
                    {t("student.subjects.currentTerm")}
                </Badge>
            );
        }
        return null;
    };

    // Filter enrollments based on current selection
    const filteredEnrollments = enrollments.filter((enrollment) => {
        if (filter === "current") {
            return enrollment.section.term.status === "ACTIVE";
        }
        return true; // show all
    });

    // Group by term
    const groupedByTerm = filteredEnrollments.reduce((acc, enrollment) => {
        const termId = enrollment.section.term.id;
        if (!acc[termId]) {
            acc[termId] = {
                term: enrollment.section.term,
                enrollments: [],
            };
        }
        acc[termId].enrollments.push(enrollment);
        return acc;
    }, {} as Record<string, { term: CourseEnrollment["section"]["term"]; enrollments: CourseEnrollment[] }>);

    const terms = Object.values(groupedByTerm).sort((a, b) => {
        // Active terms first
        if (a.term.status === "ACTIVE" && b.term.status !== "ACTIVE") return -1;
        if (a.term.status !== "ACTIVE" && b.term.status === "ACTIVE") return 1;
        // Then by name (descending for recent terms)
        return b.term.name.localeCompare(a.term.name);
    });

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            {t("common.loading")}
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            📚 {t("student.subjects.title")}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {t("student.subjects.subtitle")}
                        </p>
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant={
                                filter === "current" ? "default" : "outline"
                            }
                            onClick={() => setFilter("current")}
                            className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {t("student.subjects.currentCourses")}
                        </Button>
                        <Button
                            variant={filter === "all" ? "default" : "outline"}
                            onClick={() => setFilter("all")}
                            className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            {t("student.subjects.allCourses")}
                        </Button>
                    </div>
                </div>

                {/* No enrollments message */}
                {filteredEnrollments.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {t("student.subjects.noCourses")}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {filter === "current"
                                    ? t("student.subjects.noCurrentCourses")
                                    : t("student.subjects.noCoursesYet")}
                            </p>
                            <Button
                                onClick={() =>
                                    navigate("/student/registration")
                                }
                                variant="default">
                                {t("student.dashboard.registerCourses")}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Courses grouped by term */}
                {terms.map(({ term, enrollments: termEnrollments }) => (
                    <div key={term.id} className="space-y-4">
                        {/* Term Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {term.name}
                            </h2>
                            {getTermStatusBadge(term.status)}
                            <Badge variant="outline">
                                {termEnrollments.length}{" "}
                                {t("student.subjects.courses")}
                            </Badge>
                        </div>

                        {/* Course Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {termEnrollments.map((enrollment) => (
                                <Card
                                    key={enrollment.id}
                                    className="hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() =>
                                        navigate(
                                            `/student/subjects/${enrollment.section.id}`
                                        )
                                    }>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <Badge variant="secondary">
                                                        {
                                                            enrollment.section
                                                                .course.code
                                                        }
                                                    </Badge>
                                                    {!enrollment.section.course
                                                        .departmentId && (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                                                            {t(
                                                                "student.subjects.general"
                                                            )}
                                                        </Badge>
                                                    )}
                                                    {getStatusBadge(
                                                        enrollment.status
                                                    )}
                                                </div>
                                                <CardTitle className="text-lg">
                                                    {
                                                        enrollment.section
                                                            .course.nameAr
                                                    }
                                                </CardTitle>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {
                                                        enrollment.section
                                                            .course.nameEn
                                                    }
                                                </p>
                                            </div>
                                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Faculty */}
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {
                                                    enrollment.section.faculty
                                                        .nameAr
                                                }
                                            </span>
                                        </div>

                                        {/* Credits & Section */}
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    {
                                                        enrollment.section
                                                            .course.credits
                                                    }{" "}
                                                    {t(
                                                        "student.registration.credits"
                                                    )}
                                                </span>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="text-xs">
                                                {t("student.subjects.section")}{" "}
                                                {enrollment.section.code}
                                            </Badge>
                                        </div>

                                        {/* Schedule Preview */}
                                        {enrollment.section.schedules.length >
                                            0 && (
                                            <div className="pt-3 border-t dark:border-gray-700">
                                                <div className="flex items-start gap-2 text-sm">
                                                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                                                    <div className="flex-1">
                                                        {enrollment.section.schedules
                                                            .slice(0, 2)
                                                            .map(
                                                                (
                                                                    schedule,
                                                                    idx
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="text-gray-600 dark:text-gray-400">
                                                                        {t(
                                                                            `student.subjects.days.${schedule.day}`
                                                                        )}{" "}
                                                                        {
                                                                            schedule.startTime
                                                                        }{" "}
                                                                        -{" "}
                                                                        {
                                                                            schedule.endTime
                                                                        }
                                                                    </div>
                                                                )
                                                            )}
                                                        {enrollment.section
                                                            .schedules.length >
                                                            2 && (
                                                            <span className="text-xs text-gray-500">
                                                                +
                                                                {enrollment
                                                                    .section
                                                                    .schedules
                                                                    .length -
                                                                    2}{" "}
                                                                {t(
                                                                    "student.subjects.more"
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
