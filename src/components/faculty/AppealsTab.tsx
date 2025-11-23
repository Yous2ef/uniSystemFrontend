import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";

interface Appeal {
    id: string;
    studentCode: string;
    studentName: string;
    component: string;
    currentGrade: number;
    maxGrade: number;
    reason: string;
    attachments?: string[];
    date: string;
    status: "pending" | "approved" | "rejected";
    response?: string;
}

export default function AppealsTab({ sectionId }: { sectionId: string }) {
    const [appeals, setAppeals] = useState<Appeal[]>([
        {
            id: "1",
            studentCode: "20230001",
            studentName: "أحمد حسن",
            component: "Midterm",
            currentGrade: 35,
            maxGrade: 40,
            reason: "أعتقد أن هناك خطأ في تصحيح السؤال الثالث. الإجابة صحيحة لكن تم خصم 3 درجات.",
            attachments: ["exam_paper_photo.jpg"],
            date: "2025-11-20",
            status: "pending",
        },
    ]);
    const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [response, setResponse] = useState("");
    const [newGrade, setNewGrade] = useState<number | null>(null);

    const handleAppeal = (action: "approve" | "reject") => {
        if (!selectedAppeal) return;

        if (!response.trim()) {
            toast.error("يرجى إدخال الرد");
            return;
        }

        if (action === "approve" && (newGrade === null || newGrade === selectedAppeal.currentGrade)) {
            toast.error("يرجى تعديل الدرجة");
            return;
        }

        setAppeals(
            appeals.map((appeal) =>
                appeal.id === selectedAppeal.id
                    ? {
                          ...appeal,
                          status: action === "approve" ? "approved" : "rejected",
                          response,
                          currentGrade: action === "approve" && newGrade !== null ? newGrade : appeal.currentGrade,
                      }
                    : appeal
            )
        );

        setDialogOpen(false);
        setResponse("");
        setNewGrade(null);
        toast.success(`تم ${action === "approve" ? "قبول" : "رفض"} التظلم`);
    };

    const pendingAppeals = appeals.filter((a) => a.status === "pending");
    const processedAppeals = appeals.filter((a) => a.status !== "pending");

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">💬 التظلمات والاستفسارات</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    مراجعة طلبات التظلم على الدرجات
                </p>
            </div>

            {/* Pending Appeals */}
            <div>
                <h4 className="font-medium mb-3">📝 تظلمات معلقة ({pendingAppeals.length})</h4>
                {pendingAppeals.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            لا توجد تظلمات معلقة
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {pendingAppeals.map((appeal) => (
                            <Card key={appeal.id}>
                                <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">
                                                📝 تظلم جديد من: {appeal.studentName}
                                            </CardTitle>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                الكود: {appeal.studentCode} | التاريخ: {appeal.date}
                                            </p>
                                        </div>
                                        <Badge className="bg-yellow-500">معلق</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">المكون</p>
                                            <p className="font-medium">{appeal.component}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">الدرجة الحالية</p>
                                            <p className="font-medium text-blue-600 dark:text-blue-400">
                                                {appeal.currentGrade}/{appeal.maxGrade}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">سبب التظلم:</p>
                                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            "{appeal.reason}"
                                        </p>
                                    </div>

                                    {appeal.attachments && appeal.attachments.length > 0 && (
                                        <div>
                                            <p className="font-medium mb-2">المرفقات:</p>
                                            {appeal.attachments.map((file, index) => (
                                                <Button key={index} variant="outline" size="sm" className="gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    {file}
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedAppeal(appeal);
                                                setNewGrade(appeal.currentGrade);
                                                setDialogOpen(true);
                                            }}
                                        >
                                            مراجعة
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Processed Appeals */}
            {processedAppeals.length > 0 && (
                <div>
                    <h4 className="font-medium mb-3">✅ تظلمات تمت معالجتها</h4>
                    <div className="space-y-4">
                        {processedAppeals.map((appeal) => (
                            <Card key={appeal.id}>
                                <CardHeader
                                    className={
                                        appeal.status === "approved"
                                            ? "bg-green-50 dark:bg-green-900/20"
                                            : "bg-red-50 dark:bg-red-900/20"
                                    }
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{appeal.studentName}</CardTitle>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {appeal.component} | {appeal.date}
                                            </p>
                                        </div>
                                        <Badge
                                            className={
                                                appeal.status === "approved" ? "bg-green-500" : "bg-red-500"
                                            }
                                        >
                                            {appeal.status === "approved" ? "مقبول" : "مرفوض"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-sm">
                                        <span className="font-medium">الرد:</span> {appeal.response}
                                    </p>
                                    {appeal.status === "approved" && (
                                        <p className="text-sm mt-2 text-green-600 dark:text-green-400">
                                            الدرجة الجديدة: {appeal.currentGrade}/{appeal.maxGrade}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Review Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>💬 مراجعة التظلم</DialogTitle>
                    </DialogHeader>
                    {selectedAppeal && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="font-medium">{selectedAppeal.studentName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedAppeal.component} | الدرجة الحالية: {selectedAppeal.currentGrade}/
                                    {selectedAppeal.maxGrade}
                                </p>
                                <p className="text-sm mt-2">{selectedAppeal.reason}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium">الدرجة الجديدة (في حالة القبول)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max={selectedAppeal.maxGrade}
                                    value={newGrade || ""}
                                    onChange={(e) => setNewGrade(Number(e.target.value))}
                                    className="w-full px-3 py-2 border rounded-lg mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">ردك</label>
                                <Textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder="اكتب ردك على التظلم..."
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                                <p className="font-medium">الإجراء:</p>
                                <p className="mt-1">● قبول: تعديل الدرجة وإرسال الرد للطالب</p>
                                <p>● رفض: الدرجة تظل كما هي مع إرسال الرد</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            إلغاء
                        </Button>
                        <Button variant="destructive" onClick={() => handleAppeal("reject")}>
                            <XCircle className="w-4 h-4 ml-2" />
                            رفض
                        </Button>
                        <Button className="bg-green-500 hover:bg-green-600" onClick={() => handleAppeal("approve")}>
                            <CheckCircle className="w-4 h-4 ml-2" />
                            قبول
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
