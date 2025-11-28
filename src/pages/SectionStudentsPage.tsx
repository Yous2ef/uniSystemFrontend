import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Mail, Phone, UserCircle } from "lucide-react";
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
import { enrollmentsService } from "@/services/api";

interface Student {
    id: string;
    studentCode: string;
    nameAr: string;
    nameEn: string;
    email: string;
    phone?: string;
    batch?: {
        name: string;
    };
    department?: {
        nameAr: string;
    };
}

interface Enrollment {
    id: string;
    status: string;
    enrolledAt: string;
    student: Student;
    section?: SectionInfo;
}

interface SectionInfo {
    id: string;
    code: string;
    course: {
        code: string;
        nameAr: string;
        nameEn: string;
        creditHours: number;
    };
    term: {
        name: string;
        type: string;
    };
    faculty: {
        nameAr: string;
        nameEn: string;
    };
}

export default function SectionStudentsPage() {
    const { sectionId } = useParams<{ sectionId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (sectionId) {
            fetchEnrollments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sectionId]);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            console.log("🔍 Fetching enrollments for section:", sectionId);
            const response = await enrollmentsService.getAll({
                sectionId: sectionId,
                status: "ENROLLED",
            });
            console.log("📦 API Response:", response);

            if (response.success) {
                // Handle different response formats
                let enrollmentsArray = [];

                if (Array.isArray(response.data)) {
                    enrollmentsArray = response.data;
                } else if (
                    response.data?.enrollments &&
                    Array.isArray(response.data.enrollments)
                ) {
                    enrollmentsArray = response.data.enrollments;
                } else if (response.data) {
                    enrollmentsArray = [response.data];
                }

                console.log("✅ Enrollments array:", enrollmentsArray);
                setEnrollments(enrollmentsArray);

                // استخراج معلومات الشعبة من أول تسجيل
                if (
                    enrollmentsArray.length > 0 &&
                    enrollmentsArray[0].section
                ) {
                    console.log(
                        "📋 Section info:",
                        enrollmentsArray[0].section
                    );
                    setSectionInfo(enrollmentsArray[0].section);
                } else {
                    console.warn("⚠️ No section info found in enrollments");
                }
            } else {
                console.error("❌ API returned success=false");
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
            DROPPED:
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
            WITHDRAWN:
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        };
        return (
            <Badge className={statusColors[status] || ""}>
                {status === "ENROLLED"
                    ? "مسجل"
                    : status === "DROPPED"
                    ? "منسحب"
                    : "موقوف"}
            </Badge>
        );
    };

    const filteredEnrollments = enrollments.filter(
        (enrollment) =>
            enrollment.student.studentCode
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            enrollment.student.nameAr.includes(searchTerm) ||
            enrollment.student.nameEn
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            enrollment.student.email
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/sections")}
                            className="mb-4 flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" />
                            العودة للشعب
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            الطلاب المسجلين
                        </h1>
                        {sectionInfo && (
                            <div className="mt-2 space-y-1">
                                <p className="text-lg text-gray-700 dark:text-gray-300">
                                    <span className="font-semibold">
                                        {sectionInfo.course.code}
                                    </span>{" "}
                                    - {sectionInfo.course.nameAr}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span>الشعبة: {sectionInfo.code}</span>
                                    <span>الفصل: {sectionInfo.term.name}</span>
                                    <span>
                                        المدرس: {sectionInfo.faculty.nameAr}
                                    </span>
                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                        عدد الطلاب: {enrollments.length}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>قائمة الطلاب</CardTitle>
                        <div className="mt-4">
                            <input
                                type="text"
                                placeholder="ابحث عن طالب بالكود أو الاسم أو البريد..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-96 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.loading")}
                            </div>
                        ) : filteredEnrollments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                لا يوجد طلاب مسجلين في هذه الشعبة
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>الكود</TableHead>
                                        <TableHead>الاسم</TableHead>
                                        <TableHead>القسم</TableHead>
                                        <TableHead>الدفعة</TableHead>
                                        <TableHead>البريد الإلكتروني</TableHead>
                                        <TableHead>رقم الهاتف</TableHead>
                                        <TableHead>تاريخ التسجيل</TableHead>
                                        <TableHead>الحالة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEnrollments.map((enrollment) => (
                                        <TableRow key={enrollment.id}>
                                            <TableCell className="font-medium">
                                                {enrollment.student.studentCode}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <UserCircle className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <div className="font-medium">
                                                            {
                                                                enrollment
                                                                    .student
                                                                    .nameAr
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {
                                                                enrollment
                                                                    .student
                                                                    .nameEn
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {enrollment.student.department
                                                    ?.nameAr || "-"}
                                            </TableCell>
                                            <TableCell>
                                                {enrollment.student.batch
                                                    ?.name || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="w-3 h-3 text-gray-400" />
                                                    {enrollment.student.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    {enrollment.student.phone ||
                                                        "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    enrollment.enrolledAt
                                                ).toLocaleDateString("ar-EG")}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(
                                                    enrollment.status
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
