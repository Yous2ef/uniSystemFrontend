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
import { useTranslation } from "react-i18next";
import { attendanceService, enrollmentsService } from "@/services/api";

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
    const { t } = useTranslation();
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
        fetchAttendanceData();
    }, [sectionId]);

    const fetchAttendanceData = async () => {
        try {
            // Fetch students enrolled in section
            const enrollmentsData = await enrollmentsService.getBySectionId(sectionId);
            if (enrollmentsData.success && enrollmentsData.data) {
                const enrolledStudents = enrollmentsData.data.map((enrollment: any) => ({
                    id: enrollment.student.id,
                    code: enrollment.student.studentCode,
                    name: enrollment.student.nameAr || enrollment.student.nameEn,
                }));
                setMarkingStudents(enrolledStudents);

                // Initialize attendance state
                const initialAttendance: { [key: string]: boolean } = {};
                enrolledStudents.forEach((s: any) => {
                    initialAttendance[s.id] = true;
                });
                setAttendance(initialAttendance);

                // Fetch attendance stats for each student
                const studentsAttendance: StudentAttendance[] = await Promise.all(
                    enrollmentsData.data.map(async (enrollment: any) => {
                        try {
                            const statsData = await attendanceService.getStats(enrollment.id);
                            const stats = statsData.success ? statsData.data : null;
                            
                            const present = stats?.presentCount || 0;
                            const absent = stats?.absentCount || 0;
                            const total = present + absent;
                            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
                            
                            return {
                                studentId: enrollment.student.id,
                                studentCode: enrollment.student.studentCode,
                                studentName: enrollment.student.nameAr || enrollment.student.nameEn,
                                present,
                                absent,
                                percentage,
                                status: percentage >= 90 ? "good" : percentage >= 75 ? "warning" : "danger",
                            };
                        } catch (error) {
                            return {
                                studentId: enrollment.student.id,
                                studentCode: enrollment.student.studentCode,
                                studentName: enrollment.student.nameAr || enrollment.student.nameEn,
                                present: 0,
                                absent: 0,
                                percentage: 0,
                                status: "good" as const,
                            };
                        }
                    })
                );
                setStudents(studentsAttendance);
            }

            // Fetch attendance records (if available from API)
            // For now using empty array, can be populated from backend
            setRecords([]);
            setExcuses([]);
        } catch (error) {
            console.error("Error fetching attendance data:", error);
        }
    };

    const saveAttendance = () => {
        const present = Object.values(attendance).filter((v) => v).length;
        const absent = markingStudents.length - present;

        toast.success(t('attendanceTab.success.attendanceSaved', { present, absent }));
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

        toast.success(t(`attendanceTab.success.excuse${action === "approve" ? "Approved" : "Rejected"}`));
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
                return <Badge className="bg-green-500">{t('attendanceTab.statusBadges.good')}</Badge>;
            case "warning":
                return <Badge className="bg-yellow-500">{t('attendanceTab.statusBadges.warning')}</Badge>;
            case "danger":
                return <Badge className="bg-red-500">{t('attendanceTab.statusBadges.danger')}</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const studentsAtRisk = students.filter((s) => s.percentage < 75);

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="mark">{t('attendanceTab.tabs.mark')}</TabsTrigger>
                    <TabsTrigger value="report">{t('attendanceTab.tabs.report')}</TabsTrigger>
                    <TabsTrigger value="excuses">{t('attendanceTab.tabs.excuses')}</TabsTrigger>
                </TabsList>

                {/* Mark Attendance Tab */}
                <TabsContent value="mark" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                {t('attendanceTab.markAttendance')} - {new Date().toLocaleDateString("ar-EG", {
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
                                    {t('attendanceTab.selectAllPresent')}
                                </Button>
                                <Button variant="outline" size="sm" onClick={deselectAll}>
                                    {t('attendanceTab.selectAllAbsent')}
                                </Button>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">{t('attendanceTab.student')}</TableHead>
                                        <TableHead className="text-right">{t('attendanceTab.code')}</TableHead>
                                        <TableHead className="text-right">{t('attendanceTab.present')}</TableHead>
                                        <TableHead className="text-right">{t('attendanceTab.absent')}</TableHead>
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
                                    <p className="font-medium">{t('attendanceTab.attendanceSummary')}:</p>
                                    <p>
                                        {t('attendanceTab.present')}: {Object.values(attendance).filter((v) => v).length} | {t('attendanceTab.absent')}:{" "}
                                        {markingStudents.length - Object.values(attendance).filter((v) => v).length}
                                    </p>
                                    <p>
                                        {t('attendanceTab.attendanceRate')}:{" "}
                                        {(
                                            (Object.values(attendance).filter((v) => v).length /
                                                markingStudents.length) *
                                            100
                                        ).toFixed(0)}
                                        %
                                    </p>
                                </div>
                                <Button onClick={saveAttendance} className="w-full" size="lg">
                                    {t('attendanceTab.saveAttendance')}
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
                                <CardTitle>{t('attendanceTab.attendanceSummary')}</CardTitle>
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 ml-2" />
                                    {t('attendanceTab.exportReport')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">{t('attendanceTab.student')}</TableHead>
                                        <TableHead className="text-right">{t('attendanceTab.code')}</TableHead>
                                        <TableHead className="text-right">{t('attendanceTab.presentCount')}</TableHead>
                                        <TableHead className="text-right">{t('attendanceTab.absentCount')}</TableHead>
                                        <TableHead className="text-right">{t('attendanceTab.percentage')}</TableHead>
                                        <TableHead className="text-right">{t('attendanceTab.status')}</TableHead>
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
                            <CardTitle>{t('attendanceTab.pendingExcuses')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {excuses.filter((e) => e.status === "pending").length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    {t('attendanceTab.noExcuses')}
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
                                                                {excuse.studentName} - {t('attendanceTab.absenceDate')} {excuse.date}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                {t('attendanceTab.code')}: {excuse.studentCode}
                                                            </p>
                                                            <p className="mt-2">
                                                                <span className="font-medium">{t('attendanceTab.reason')}:</span>{" "}
                                                                {excuse.reason}
                                                            </p>
                                                            {excuse.document && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="mt-2"
                                                                >
                                                                    <FileText className="w-4 h-4 ml-2" />
                                                                    {t('attendanceTab.viewDocument')}
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
                                                                {t('attendanceTab.approve')}
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
                                                                {t('attendanceTab.reject')}
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
                        <DialogTitle>{t('attendanceTab.reviewExcuse')}</DialogTitle>
                    </DialogHeader>
                    {selectedExcuse && (
                        <div className="space-y-4">
                            <div>
                                <p className="font-medium">{selectedExcuse.studentName}</p>
                                <p className="text-sm text-gray-600">{t('attendanceTab.date')}: {selectedExcuse.date}</p>
                                <p className="text-sm">{t('attendanceTab.reason')}: {selectedExcuse.reason}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('attendanceTab.notesOptional')}</label>
                                <Textarea
                                    value={excuseResponse}
                                    onChange={(e) => setExcuseResponse(e.target.value)}
                                    placeholder={t('attendanceTab.addNotes')}
                                    rows={3}
                                />
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                                <p className="font-medium">{t('attendanceTab.onApprove')}</p>
                                <p>{t('attendanceTab.absenceToPresent')}</p>
                                <p className="font-medium mt-2">{t('attendanceTab.onReject')}</p>
                                <p>{t('attendanceTab.absenceStays')}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setExcuseDialog(false)}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleExcuse("reject")}
                        >
                            {t('attendanceTab.rejectExcuse')}
                        </Button>
                        <Button
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleExcuse("approve")}
                        >
                            {t('attendanceTab.approveExcuse')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
