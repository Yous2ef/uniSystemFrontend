import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, User, AlertTriangle, CheckCircle } from "lucide-react";
import { enrollmentsService, studentsService } from "@/services/api";

interface Student {
    id: string;
    studentCode: string;
    user: {
        name: string;
        email: string;
    };
    academicYear: number;
    gpa: number;
    status: string;
    enrollment?: {
        id: string;
        finalGrade?: number;
        status: string;
    };
}

interface StudentDetails {
    id: string;
    studentCode: string;
    user: {
        name: string;
        email: string;
        phone?: string;
    };
    academicYear: number;
    gpa: number;
    status: string;
    department?: {
        nameAr: string;
    };
    batch?: {
        year: number;
    };
}

export default function StudentsTab({ sectionId }: { sectionId: string }) {
    const { t } = useTranslation();
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, [sectionId]);

    useEffect(() => {
        applyFilters();
    }, [students, searchTerm, filterStatus]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            console.log("📚 Fetching students for section:", sectionId);

            const data = await enrollmentsService.getBySectionId(sectionId);
            console.log("Enrollments response:", data);

            if (data && data.success) {
                const enrollments = data.data || [];
                const studentsData = enrollments.map((enrollment: any) => ({
                    id: enrollment.student.id,
                    studentCode: enrollment.student.studentCode,
                    user: {
                        name: enrollment.student.nameAr || enrollment.student.nameEn,
                        email: enrollment.student.user.email,
                    },
                    academicYear: enrollment.student.batch?.year || 0,
                    gpa: 0, // GPA not available in enrollment data
                    status: enrollment.status,
                    enrollment: {
                        id: enrollment.id,
                        finalGrade: enrollment.finalGrade,
                        status: enrollment.status,
                    },
                    department: enrollment.student.department,
                    batch: enrollment.student.batch,
                }));
                setStudents(studentsData);
                console.log("✅ Students loaded:", studentsData.length);
            }
        } catch (error) {
            console.error("❌ Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...students];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (student) =>
                    student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.studentCode.includes(searchTerm)
            );
        }

        // Status filter
        if (filterStatus !== "all") {
            filtered = filtered.filter((student) => {
                switch (filterStatus) {
                    case "warning":
                        return student.status === "WARNING";
                    case "probation":
                        return student.status === "PROBATION";
                    case "good":
                        return student.status === "GOOD_STANDING";
                    default:
                        return true;
                }
            });
        }

        setFilteredStudents(filtered);
    };

    const openStudentDetails = async (studentId: string) => {
        try {
            console.log("📄 Fetching details for student:", studentId);
            const response = await studentsService.getById(studentId);
            
            if (response.success) {
                const studentData = response.data;
                // Transform the data to match the expected structure
                const transformedStudent: StudentDetails = {
                    id: studentData.id,
                    studentCode: studentData.studentCode,
                    user: {
                        name: studentData.nameAr || studentData.nameEn,
                        email: studentData.user?.email || studentData.email || '',
                        phone: studentData.phone,
                    },
                    academicYear: studentData.batch?.year || 0,
                    gpa: studentData.gpa || 0,
                    status: studentData.status || 'ACTIVE',
                    department: studentData.department,
                    batch: studentData.batch,
                };
                setSelectedStudent(transformedStudent);
                setDetailsOpen(true);
            }
        } catch (error) {
            console.error("❌ Error fetching student details:", error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "GOOD_STANDING":
                return <Badge className="bg-green-500">{t('studentsTab.status.excellent')}</Badge>;
            case "WARNING":
                return <Badge className="bg-yellow-500">{t('studentsTab.status.warning')}</Badge>;
            case "PROBATION":
                return <Badge className="bg-red-500">{t('studentsTab.status.probation')}</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder={t('studentsTab.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder={t('studentsTab.filterPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('studentsTab.allStudents')}</SelectItem>
                        <SelectItem value="good">{t('studentsTab.goodStanding')}</SelectItem>
                        <SelectItem value="warning">{t('studentsTab.warning')}</SelectItem>
                        <SelectItem value="probation">{t('studentsTab.probation')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Students Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('studentsTab.studentsList', { count: filteredStudents.length })}
                </p>
            </div>

            {/* Students Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">{t('studentsTab.table.image')}</TableHead>
                                    <TableHead className="text-right">{t('studentsTab.table.code')}</TableHead>
                                    <TableHead className="text-right">{t('studentsTab.table.name')}</TableHead>
                                    <TableHead className="text-right">{t('studentsTab.table.year')}</TableHead>
                                    <TableHead className="text-right">{t('studentsTab.table.gpa')}</TableHead>
                                    <TableHead className="text-right">{t('studentsTab.table.status')}</TableHead>
                                    <TableHead className="text-right">{t('studentsTab.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                            {t('studentsTab.noStudents')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <TableCell>
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                                    {student.user.name.charAt(0)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono">{student.studentCode}</TableCell>
                                            <TableCell className="font-medium">{student.user.name}</TableCell>
                                            <TableCell>{student.academicYear}</TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    {student.gpa ? student.gpa.toFixed(2) : "--"}
                                                </span>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(student.status)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openStudentDetails(student.id)}
                                                >
                                                    {t('studentsTab.viewDetails')}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Student Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            {t('studentsTab.studentProfile')}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedStudent && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        {t('studentsTab.basicInfo')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('studentsTab.details.name')}</p>
                                            <p className="font-medium">{selectedStudent.user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('studentsTab.details.code')}</p>
                                            <p className="font-mono font-medium">{selectedStudent.studentCode}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('studentsTab.details.email')}</p>
                                            <p className="text-sm">{selectedStudent.user.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('studentsTab.details.phone')}</p>
                                            <p className="text-sm">{selectedStudent.user.phone || t('studentsTab.notAvailable')}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('studentsTab.details.academicYear')}</p>
                                            <p className="font-medium">{t('studentsTab.yearNum', { year: selectedStudent.academicYear })}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('studentsTab.details.major')}</p>
                                            <p className="font-medium">{selectedStudent.department?.nameAr || t('studentsTab.notSpecified')}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('studentsTab.details.gpa')}</p>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {selectedStudent.gpa ? selectedStudent.gpa.toFixed(2) : "--"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('studentsTab.details.academicStatus')}</p>
                                            <div className="mt-1">{getStatusBadge(selectedStudent.status)}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Course Performance - Placeholder */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">{t('studentsTab.inThisCourse')}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('studentsTab.coursePerformance.attendance')}</p>
                                            <p className="text-lg font-semibold">-- (--)</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('studentsTab.coursePerformance.grades')}</p>
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-500">{t('studentsTab.coursePerformance.noGrades')}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('studentsTab.coursePerformance.previousAttempts')}</p>
                                            <p className="text-sm">{t('studentsTab.coursePerformance.firstTime')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
