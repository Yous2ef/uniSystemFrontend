import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, CheckCircle, XCircle, AlertTriangle, FileText, Download } from "lucide-react";
import { toast } from "sonner";

interface AttendanceRecord {
    id: string;
    date: string;
    weekNumber: number;
    present: number;
    absent: number;
    total: number;
}

interface StudentAttendance {
    studentId: string;
    studentCode: string;
    studentName: string;
    present: number;
    absent: number;
    percentage: number;
    status: "good" | "warning" | "danger";
}

interface ExcuseRequest {
    id: string;
    studentCode: string;
    studentName: string;
    date: string;
    reason: string;
    document?: string;
    status: "pending" | "approved" | "rejected";
}

export default function AttendanceTab({ sectionId }: { sectionId: string }) {
    const [activeTab, setActiveTab] = useState("mark");
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [students, setStudents] = useState<StudentAttendance[]>([]);
    const [excuses, setExcuses] = useState<ExcuseRequest[]>([]);
    const [markingStudents, setMarkingStudents] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});
    const [excuseDialog, setExcuseDialog] = useState(false);
    const [selectedExcuse, setSelectedExcuse] = useState<ExcuseRequest | null>(null);
    const [excuseResponse, setExcuseResponse] = useState("");

    useEffect(() => {
        // Mock data
        const mockRecords: AttendanceRecord[] = [
            { id: "1", date: "2025-11-10", weekNumber: 1, present: 42, absent: 3, total: 45 },
            { id: "2", date: "2025-11-13", weekNumber: 2, present: 40, absent: 5, total: 45 },
            { id: "3", date: "2025-11-17", weekNumber: 3, present: 43, absent: 2, total: 45 },
        ];

        const mockStudents: StudentAttendance[] = [
            {
                studentId: "1",
                studentCode: "20230001",
                studentName: "أحمد حسن",
                present: 17,
                absent: 3,
                percentage: 85,
                status: "good",
            },
            {
                studentId: "2",
                studentCode: "20230002",
                studentName: "سارة علي",
                present: 19,
                absent: 1,
                percentage: 95,
                status: "good",
            },
            {
                studentId: "3",
                studentCode: "20230003",
                studentName: "محمد خالد",
                present: 13,
                absent: 7,
                percentage: 65,
                status: "danger",
            },
        ];

        const mockExcuses: ExcuseRequest[] = [
            {
                id: "1",
                studentCode: "20230003",
                studentName: "محمد خالد",
                date: "2025-11-15",
                reason: "ظروف صحية",
                document: "medical-certificate.pdf",
                status: "pending",
            },
        ];

        const mockMarkingStudents = mockStudents.map((s) => ({
            id: s.studentId,
            code: s.studentCode,
            name: s.studentName,
        }));

        setRecords(mockRecords);
        setStudents(mockStudents);
        setExcuses(mockExcuses);
        setMarkingStudents(mockMarkingStudents);

        // Initialize attendance state
        const initialAttendance: { [key: string]: boolean } = {};
        mockMarkingStudents.forEach((s) => {
            initialAttendance[s.id] = true;
        });
        setAttendance(initialAttendance);
    }, [sectionId]);

    const saveAttendance = () => {
        const present = Object.values(attendance).filter((v) => v).length;
        const absent = markingStudents.length - present;

        toast.success(`تم حفظ الحضور: ${present} حاضر، ${absent} غائب`);
    };

    const selectAll = () => {
        const newAttendance: { [key: string]: boolean } = {};
        markingStudents.forEach((s) => {
            newAttendance[s.id] = true;
        });
        setAttendance(newAttendance);
    };

    const deselectAll = () => {
        const newAttendance: { [key: string]: boolean } = {};
        markingStudents.forEach((s) => {
            newAttendance[s.id] = false;
        });
        setAttendance(newAttendance);
    };

    const handleExcuse = (action: "approve" | "reject") => {
        if (!selectedExcuse) return;

        toast.success(`تم ${action === "approve" ? "قبول" : "رفض"} العذر`);
        setExcuses(excuses.map((e) =>
            e.id === selectedExcuse.id
                ? { ...e, status: action === "approve" ? "approved" : "rejected" }
                : e
        ));
        setExcuseDialog(false);
        setExcuseResponse("");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "good":
                return <Badge className="bg-green-500">✅ جيد</Badge>;
            case "warning":
                return <Badge className="bg-yellow-500">⚠️ تحذير</Badge>;
            case "danger":
                return <Badge className="bg-red-500">🚨 خطر</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const studentsAtRisk = students.filter((s) => s.percentage < 75);

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="mark">تسجيل الحضور</TabsTrigger>
                    <TabsTrigger value="report">تقرير الحضور</TabsTrigger>
                    <TabsTrigger value="excuses">أعذار الغياب</TabsTrigger>
                </TabsList>

                {/* Mark Attendance Tab */}
                <TabsContent value="mark" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                📅 تسجيل حضور - {new Date().toLocaleDateString("ar-EG", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex gap-2">
                                <Button variant="outline" size="sm" onClick={selectAll}>
                                    ✅ تحديد الكل حاضر
                                </Button>
                                <Button variant="outline" size="sm" onClick={deselectAll}>
                                    ❌ تحديد الكل غائب
                                </Button>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">الطالب</TableHead>
                                        <TableHead className="text-right">الكود</TableHead>
                                        <TableHead className="text-right">حاضر</TableHead>
                                        <TableHead className="text-right">غائب</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {markingStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell className="font-mono">{student.code}</TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    checked={attendance[student.id] === true}
                                                    onCheckedChange={() =>
                                                        setAttendance({ ...attendance, [student.id]: true })
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    checked={attendance[student.id] === false}
                                                    onCheckedChange={() =>
                                                        setAttendance({ ...attendance, [student.id]: false })
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                                    <p className="font-medium">📊 ملخص:</p>
                                    <p>
                                        حاضرين: {Object.values(attendance).filter((v) => v).length} | غائبين:{" "}
                                        {markingStudents.length - Object.values(attendance).filter((v) => v).length}
                                    </p>
                                    <p>
                                        نسبة الحضور:{" "}
                                        {(
                                            (Object.values(attendance).filter((v) => v).length /
                                                markingStudents.length) *
                                            100
                                        ).toFixed(0)}
                                        %
                                    </p>
                                </div>
                                <Button onClick={saveAttendance} className="w-full" size="lg">
                                    💾 حفظ الحضور
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Report Tab */}
                <TabsContent value="report" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>📊 تقرير الحضور الشامل</CardTitle>
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 ml-2" />
                                    📥 تصدير Excel
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">الطالب</TableHead>
                                        <TableHead className="text-right">الكود</TableHead>
                                        <TableHead className="text-right">حاضر</TableHead>
                                        <TableHead className="text-right">غائب</TableHead>
                                        <TableHead className="text-right">النسبة</TableHead>
                                        <TableHead className="text-right">الحالة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.studentId}>
                                            <TableCell className="font-medium">{student.studentName}</TableCell>
                                            <TableCell className="font-mono">{student.studentCode}</TableCell>
                                            <TableCell>{student.present}</TableCell>
                                            <TableCell>{student.absent}</TableCell>
                                            <TableCell className="font-bold">{student.percentage}%</TableCell>
                                            <TableCell>{getStatusBadge(student.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {studentsAtRisk.length > 0 && (
                                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="flex items-center gap-2 font-medium text-red-800 dark:text-red-200 mb-2">
                                        <AlertTriangle className="w-5 h-5" />
                                        ⚠️ تحذيرات:
                                    </p>
                                    <p className="text-sm">
                                        {studentsAtRisk.length} طلاب نسبة حضورهم أقل من 75%
                                    </p>
                                    <p className="text-sm">سيتم منعهم من دخول الامتحان</p>
                                    <Button variant="outline" size="sm" className="mt-2">
                                        📧 إرسال تنبيه لهم
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Excuses Tab */}
                <TabsContent value="excuses" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>📝 أعذار الغياب المعلقة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {excuses.filter((e) => e.status === "pending").length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    لا توجد أعذار معلقة
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {excuses
                                        .filter((e) => e.status === "pending")
                                        .map((excuse) => (
                                            <Card key={excuse.id}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-lg">
                                                                {excuse.studentName} - غياب يوم {excuse.date}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                الكود: {excuse.studentCode}
                                                            </p>
                                                            <p className="mt-2">
                                                                <span className="font-medium">السبب:</span>{" "}
                                                                {excuse.reason}
                                                            </p>
                                                            {excuse.document && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="mt-2"
                                                                >
                                                                    <FileText className="w-4 h-4 ml-2" />
                                                                    👁️ عرض المستند
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-500 hover:bg-green-600"
                                                                onClick={() => {
                                                                    setSelectedExcuse(excuse);
                                                                    setExcuseDialog(true);
                                                                }}
                                                            >
                                                                <CheckCircle className="w-4 h-4 ml-2" />
                                                                قبول
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => {
                                                                    setSelectedExcuse(excuse);
                                                                    setExcuseDialog(true);
                                                                }}
                                                            >
                                                                <XCircle className="w-4 h-4 ml-2" />
                                                                رفض
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Excuse Action Dialog */}
            <Dialog open={excuseDialog} onOpenChange={setExcuseDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>مراجعة العذر</DialogTitle>
                    </DialogHeader>
                    {selectedExcuse && (
                        <div className="space-y-4">
                            <div>
                                <p className="font-medium">{selectedExcuse.studentName}</p>
                                <p className="text-sm text-gray-600">التاريخ: {selectedExcuse.date}</p>
                                <p className="text-sm">السبب: {selectedExcuse.reason}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">ملاحظات (اختياري)</label>
                                <Textarea
                                    value={excuseResponse}
                                    onChange={(e) => setExcuseResponse(e.target.value)}
                                    placeholder="أضف ملاحظات إن وجدت..."
                                    rows={3}
                                />
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                                <p className="font-medium">عند القبول:</p>
                                <p>└─ سيتم تحويل الغياب إلى حضور ✅</p>
                                <p className="font-medium mt-2">عند الرفض:</p>
                                <p>└─ سيظل الغياب محتسباً ❌</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setExcuseDialog(false)}
                        >
                            إلغاء
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleExcuse("reject")}
                        >
                            رفض العذر
                        </Button>
                        <Button
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleExcuse("approve")}
                        >
                            قبول العذر
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
