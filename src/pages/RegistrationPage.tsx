import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X, CheckCircle, AlertCircle } from "lucide-react";
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
    enrollmentsService,
    sectionsService,
    termsService,
    studentsService,
} from "@/services/api";
import { useAuthStore } from "@/store/auth";

interface Section {
    id: string;
    code: string;
    capacity: number;
    course: {
        code: string;
        nameAr: string;
        nameEn: string;
        credits: number;
    };
    faculty: {
        nameAr: string;
    };
    schedules: {
        day: number;
        startTime: string;
        endTime: string;
        room?: string;
    }[];
    enrolledCount: number;
}

interface Enrollment {
    id: string;
    status: string;
    section: {
        id: string;
        code: string;
        course: {
            code: string;
            nameAr: string;
            credits: number;
        };
    };
}

interface Term {
    id: string;
    name: string;
    status: string;
    registrationStart?: string;
    registrationEnd?: string;
}

interface ValidationResult {
    sectionId: string;
    valid: boolean;
    conflicts: string[];
    missingPrerequisites: string[];
    errors?: string[];
}

interface StudentData {
    id: string;
    batch: {
        id: string;
        name: string;
        maxCredits: number;
    };
}

export default function RegistrationPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [terms, setTerms] = useState<Term[]>([]);
    const [selectedTerm, setSelectedTerm] = useState<string>("");
    const [availableSections, setAvailableSections] = useState<Section[]>([]);
    const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
    const [selectedSections, setSelectedSections] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [validationResult, setValidationResult] = useState<
        ValidationResult[] | null
    >(null);

    useEffect(() => {
        fetchStudentData();
        fetchTerms();
    }, []);

    useEffect(() => {
        if (selectedTerm && studentData?.id) {
            fetchMyEnrollments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTerm, studentData]);

    useEffect(() => {
        if (selectedTerm && myEnrollments.length >= 0) {
            fetchAvailableSections();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTerm, myEnrollments]);

    const fetchStudentData = async () => {
        try {
            const response = await studentsService.getByUserId(user?.id || "");
            if (response.success) {
                setStudentData(response.data);
            }
        } catch (error) {
            console.error("Error fetching student data:", error);
        }
    };

    const fetchTerms = async () => {
        try {
            const response = await termsService.getAll();
            if (response.success && response.data && response.data.terms) {
                setTerms(response.data.terms);
                // Auto-select active term or latest term
                const activeTerm = response.data.terms.find(
                    (t: Term) => t.status === "ACTIVE"
                );
                if (activeTerm) {
                    setSelectedTerm(activeTerm.id);
                } else if (response.data.terms.length > 0) {
                    // Select the most recent term
                    setSelectedTerm(response.data.terms[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching terms:", error);
        }
    };

    const fetchAvailableSections = async () => {
        try {
            setLoading(true);
            const response = await sectionsService.getAll({
                termId: selectedTerm,
            });
            if (response.success) {
                // Get enrolled section IDs
                const enrolledSectionIds = myEnrollments.map(
                    (e) => e.section.id
                );
                // Filter out already enrolled sections
                const availableSections = response.data.sections.filter(
                    (section: Section) =>
                        !enrolledSectionIds.includes(section.id)
                );
                setAvailableSections(availableSections);
            }
        } catch (error) {
            console.error("Error fetching sections:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyEnrollments = async () => {
        if (!studentData?.id) return;

        try {
            const response = await enrollmentsService.getAll({
                studentId: studentData.id,
                termId: selectedTerm,
                status: "ENROLLED",
            });
            if (response.success) {
                const enrollments =
                    response.data?.enrollments || response.data || [];
                setMyEnrollments(Array.isArray(enrollments) ? enrollments : []);
            }
        } catch (error) {
            console.error("Error fetching enrollments:", error);
            setMyEnrollments([]);
        }
    };

    const handleSelectSection = (sectionId: string) => {
        if (selectedSections.includes(sectionId)) {
            setSelectedSections(
                selectedSections.filter((id) => id !== sectionId)
            );
        } else {
            setSelectedSections([...selectedSections, sectionId]);
        }
    };

    const handleValidateEnrollment = async () => {
        if (selectedSections.length === 0) {
            alert(t("student.registration.pleaseSelectAtLeastOne"));
            return;
        }

        if (!studentData?.id) {
            alert(t("student.registration.studentDataNotFound"));
            return;
        }

        try {
            setLoading(true);
            // Validate each section
            const validations = await Promise.all(
                selectedSections.map((sectionId) =>
                    enrollmentsService.validateEnrollment({
                        studentId: studentData.id,
                        sectionId,
                    })
                )
            );

            setValidationResult(validations);
        } catch (error) {
            console.error("Error validating enrollment:", error);
            alert(t("student.registration.validationError"));
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!validationResult || validationResult.some((v) => !v.valid)) {
            alert(t("student.registration.resolveIssuesFirst"));
            return;
        }

        if (!studentData?.id) {
            alert(t("student.registration.studentDataNotFound"));
            return;
        }

        try {
            setLoading(true);
            // Enroll in each section
            await Promise.all(
                selectedSections.map((sectionId) =>
                    enrollmentsService.enrollStudent({
                        studentId: studentData.id,
                        sectionId,
                    })
                )
            );

            alert(t("student.registration.registrationSuccess"));
            setSelectedSections([]);
            setValidationResult(null);
            fetchMyEnrollments();
        } catch (error) {
            console.error("Error enrolling:", error);
            alert(t("student.registration.registrationFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handleDropEnrollment = async (enrollmentId: string) => {
        if (!confirm(t("student.registration.confirmDrop"))) return;

        try {
            await enrollmentsService.dropEnrollment(enrollmentId);
            alert(t("student.registration.dropSuccess"));
            fetchMyEnrollments();
        } catch (error) {
            console.error("Error dropping enrollment:", error);
            alert(t("student.registration.dropFailed"));
        }
    };

    const getDayName = (day: number) => {
        return t(`student.subjects.days.${day}`);
    };

    const totalCredits = myEnrollments.reduce(
        (sum, e) => sum + e.section.course.credits,
        0
    );

    const selectedCredits = availableSections
        .filter((s) => selectedSections.includes(s.id))
        .reduce((sum, s) => sum + s.course.credits, 0);

    const totalWithSelected = totalCredits + selectedCredits;
    const maxCredits = studentData?.batch.maxCredits || 18;
    const canEnroll = totalWithSelected <= maxCredits;
    const creditWarning =
        totalWithSelected > maxCredits
            ? t("student.registration.exceededMaxBy", { credits: totalWithSelected - maxCredits })
            : null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t("student.registration.title")}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t("student.registration.subtitle")}
                    </p>
                    {selectedTerm && (
                        <div className="mt-2 flex items-center gap-2">
                            <Badge variant="default" className="text-sm">
                                {t("student.registration.currentTerm")}:{" "}
                                {terms.find((t) => t.id === selectedTerm)?.name}
                            </Badge>
                            {studentData && (
                                <Badge variant="outline" className="text-sm">
                                    {t("student.registration.maxCredits")}: {maxCredits} {t("student.registration.credits")}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                {/* Credit Status Alert */}
                {selectedSections.length > 0 && (
                    <Card
                        className={
                            !canEnroll
                                ? "border-red-500 border-2"
                                : "border-green-500 border-2"
                        }>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {canEnroll ? (
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6 text-red-600" />
                                    )}
                                    <div>
                                        <p className="font-semibold">
                                            {t("student.registration.totalCredits")}: {totalWithSelected}{" "}
                                            {t("student.registration.credits")} ({totalCredits} {t("student.registration.enrolled")} +{" "}
                                            {selectedCredits} {t("student.registration.selected")})
                                        </p>
                                        {creditWarning && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {creditWarning}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {canEnroll && (
                                    <Badge
                                        variant="default"
                                        className="bg-green-600">
                                        {t("student.registration.readyToRegister")}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Current Enrollments */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{t("student.registration.enrolledCourses")}</CardTitle>
                            <Badge variant="default">
                                {totalCredits} {t("student.registration.credits")}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {myEnrollments.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">
                                {t("student.registration.noEnrollments")}
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("student.registration.courseCode")}</TableHead>
                                        <TableHead>{t("student.registration.courseName")}</TableHead>
                                        <TableHead>{t("student.registration.credits")}</TableHead>
                                        <TableHead>{t("student.subjects.section")}</TableHead>
                                        <TableHead className="text-end">
                                            {t("common.actions")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myEnrollments.map((enrollment) => (
                                        <TableRow key={enrollment.id}>
                                            <TableCell>
                                                {enrollment.section.course.code}
                                            </TableCell>
                                            <TableCell>
                                                {enrollment.section.course.nameAr}
                                            </TableCell>
                                            <TableCell>
                                                {
                                                    enrollment.section.course
                                                        .credits
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {enrollment.section.code}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDropEnrollment(
                                                            enrollment.id
                                                        )
                                                    }>
                                                    <X className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Available Sections */}
                {selectedTerm && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{t("student.registration.availableCourses")}</CardTitle>
                                <div className="flex gap-2">
                                    <Badge variant="secondary">
                                        {t("student.registration.selected")}: {selectedCredits} {t("student.registration.credits")}
                                    </Badge>
                                    <Button
                                        onClick={handleValidateEnrollment}
                                        disabled={
                                            selectedSections.length === 0 ||
                                            loading ||
                                            !canEnroll
                                        }>
                                        <CheckCircle className="w-4 h-4 me-2" />
                                        {t("student.registration.validateRegistration")}
                                    </Button>
                                    {validationResult &&
                                        validationResult.every(
                                            (v) => v.valid
                                        ) &&
                                        canEnroll && (
                                            <Button onClick={handleEnroll}>
                                                <Plus className="w-4 h-4 me-2" />
                                                {t("student.registration.submitRegistration")}
                                            </Button>
                                        )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-center py-4">
                                    {t("common.loading")}
                                </p>
                            ) : availableSections.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">
                                    {t("student.registration.noAvailableSections")}
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {availableSections.map((section) => (
                                        <div
                                            key={section.id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                                selectedSections.includes(
                                                    section.id
                                                )
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                    : "border-gray-300 dark:border-gray-600"
                                            }`}
                                            onClick={() =>
                                                handleSelectSection(section.id)
                                            }>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg">
                                                        {section.course.code} -{" "}
                                                        {section.course.nameAr}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {t("student.subjects.section")}: {section.code} |
                                                        {t("student.registration.instructor")}:{" "}
                                                        {section.faculty.nameAr}{" "}|
                                                        {t("student.registration.credits")}:{" "}
                                                        {section.course.credits}
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {section.schedules.map(
                                                            (schedule, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    variant="outline">
                                                                    {getDayName(
                                                                        schedule.day
                                                                    )}{" "}
                                                                    {
                                                                        schedule.startTime
                                                                    }{" "}
                                                                    -{" "}
                                                                    {
                                                                        schedule.endTime
                                                                    }
                                                                    {schedule.room &&
                                                                        ` (${schedule.room})`}
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <Badge
                                                        variant={
                                                            section.enrolledCount >=
                                                            section.capacity
                                                                ? "destructive"
                                                                : "default"
                                                        }>
                                                        {section.enrolledCount}/
                                                        {section.capacity}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Validation Results */}
                            {validationResult && (
                                <div className="mt-4 space-y-2">
                                    <h4 className="font-bold">{t("student.registration.validationResults")}:</h4>
                                    {validationResult.map(
                                        (result, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`p-3 rounded-lg ${
                                                    result.valid
                                                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                                        : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                                }`}>
                                                <div className="flex items-start gap-2">
                                                    {result.valid ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                                    )}
                                                    <div>
                                                        {result.valid ? (
                                                            <p className="text-green-700 dark:text-green-300">
                                                                {t("student.registration.validRegistration")}
                                                            </p>
                                                        ) : (
                                                            <div>
                                                                <p className="text-red-700 dark:text-red-300 font-medium">
                                                                    {t("student.registration.issuesFound")}:
                                                                </p>
                                                                <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
                                                                    {result.errors?.map(
                                                                        (
                                                                            error: string,
                                                                            i: number
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    i
                                                                                }>
                                                                                {
                                                                                    error
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
