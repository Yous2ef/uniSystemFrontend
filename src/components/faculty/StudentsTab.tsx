import { useState, useEffect } from "react";
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

            const response = await enrollmentsService.getBySectionId(sectionId);
            console.log("Enrollments response:", response);

            if (response.success) {
                const enrollments = response.data || [];
                const studentsData = enrollments.map((enrollment: any) => ({
                    ...enrollment.student,
                    enrollment: {
                        id: enrollment.id,
                        finalGrade: enrollment.finalGrade,
                        status: enrollment.status,
                    },
                }));
                setStudents(studentsData);
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
                setSelectedStudent(response.data);
                setDetailsOpen(true);
            }
        } catch (error) {
            console.error("❌ Error fetching student details:", error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "GOOD_STANDING":
                return <Badge className="bg-green-500">ممتاز</Badge>;
            case "WARNING":
                return <Badge className="bg-yellow-500">تحذير</Badge>;
            case "PROBATION":
                return <Badge className="bg-red-500">إنذار</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
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
                        placeholder="🔍 بحث: اسم الطالب أو الكود"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="🎯 فلتر حسب الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">جميع الطلاب</SelectItem>
                        <SelectItem value="good">حالة جيدة</SelectItem>
                        <SelectItem value="warning">تحذير</SelectItem>
                        <SelectItem value="probation">إنذار</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Students Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    👥 قائمة الطلاب ({filteredStudents.length} طالب)
                </p>
            </div>

            {/* Students Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">الصورة</TableHead>
                                    <TableHead className="text-right">الكود</TableHead>
                                    <TableHead className="text-right">الاسم</TableHead>
                                    <TableHead className="text-right">السنة</TableHead>
                                    <TableHead className="text-right">المعدل</TableHead>
                                    <TableHead className="text-right">الحالة</TableHead>
                                    <TableHead className="text-right">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                            لا يوجد طلاب
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
                                                    عرض التفاصيل
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
                            👤 ملف الطالب
                        </DialogTitle>
                    </DialogHeader>

                    {selectedStudent && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        معلومات أساسية
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">الاسم</p>
                                            <p className="font-medium">{selectedStudent.user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">الكود</p>
                                            <p className="font-mono font-medium">{selectedStudent.studentCode}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">البريد</p>
                                            <p className="text-sm">{selectedStudent.user.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">الهاتف</p>
                                            <p className="text-sm">{selectedStudent.user.phone || "غير متوفر"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">السنة الدراسية</p>
                                            <p className="font-medium">السنة {selectedStudent.academicYear}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">التخصص</p>
                                            <p className="font-medium">{selectedStudent.department?.nameAr || "غير محدد"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">المعدل التراكمي</p>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {selectedStudent.gpa ? selectedStudent.gpa.toFixed(2) : "--"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">الحالة الأكاديمية</p>
                                            <div className="mt-1">{getStatusBadge(selectedStudent.status)}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Course Performance - Placeholder */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">📊 في هذه المادة</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">الحضور</p>
                                            <p className="text-lg font-semibold">-- (--)</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">الدرجات</p>
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-500">لم يتم رفع الدرجات بعد</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">المحاولات السابقة</p>
                                            <p className="text-sm">أول مرة في المادة</p>
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
