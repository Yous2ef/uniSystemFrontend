import { useState, useEffect } from "react";
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
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Appeals will be loaded from API when backend endpoint is ready
        setLoading(false);
    }, [sectionId]);
    const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [response, setResponse] = useState("");
    const [newGrade, setNewGrade] = useState<number | null>(null);

    const handleAppeal = (action: "approve" | "reject") => {
        if (!selectedAppeal) return;

        if (!response.trim()) {
            toast.error(t('appealsTab.errors.enterResponse'));
            return;
        }

        if (action === "approve" && (newGrade === null || newGrade === selectedAppeal.currentGrade)) {
            toast.error(t('appealsTab.errors.modifyGrade'));
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
        toast.success(t(`appealsTab.success.appeal${action === "approve" ? "Approved" : "Rejected"}`));
    };

    const pendingAppeals = appeals.filter((a) => a.status === "pending");
    const processedAppeals = appeals.filter((a) => a.status !== "pending");

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">{t('appealsTab.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('appealsTab.subtitle')}
                </p>
            </div>

            {/* Pending Appeals */}
            <div>
                <h4 className="font-medium mb-3">{t('appealsTab.pending')} ({pendingAppeals.length})</h4>
                {pendingAppeals.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            {t('appealsTab.noPending')}
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
                                                {t('appealsTab.newAppeal')}: {appeal.studentName}
                                            </CardTitle>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {t('appealsTab.code')}: {appeal.studentCode} | {t('appealsTab.date')}: {appeal.date}
                                            </p>
                                        </div>
                                        <Badge className="bg-yellow-500">{t('appealsTab.statusPending')}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('appealsTab.component')}</p>
                                            <p className="font-medium">{appeal.component}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('appealsTab.currentGrade')}</p>
                                            <p className="font-medium text-blue-600 dark:text-blue-400">
                                                {appeal.currentGrade}/{appeal.maxGrade}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">{t('appealsTab.reason')}:</p>
                                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            "{appeal.reason}"
                                        </p>
                                    </div>

                                    {appeal.attachments && appeal.attachments.length > 0 && (
                                        <div>
                                            <p className="font-medium mb-2">{t('appealsTab.attachments')}:</p>
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
                                            {t('appealsTab.reviewAppeal')}
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
                    <h4 className="font-medium mb-3">{t('appealsTab.processed')}</h4>
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
                                            {t(`appealsTab.status${appeal.status === "approved" ? "Approved" : "Rejected"}`)}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-sm">
                                        <span className="font-medium">{t('appealsTab.instructorResponse')}:</span> {appeal.response}
                                    </p>
                                    {appeal.status === "approved" && (
                                        <p className="text-sm mt-2 text-green-600 dark:text-green-400">
                                            {t('appealsTab.gradeUpdated')}: {appeal.currentGrade}/{appeal.maxGrade}
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
                        <DialogTitle>{t('appealsTab.reviewAppeal')}</DialogTitle>
                    </DialogHeader>
                    {selectedAppeal && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="font-medium">{selectedAppeal.studentName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedAppeal.component} | {t('appealsTab.currentGrade')}: {selectedAppeal.currentGrade}/
                                    {selectedAppeal.maxGrade}
                                </p>
                                <p className="text-sm mt-2">{selectedAppeal.reason}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium">{t('appealsTab.newGrade')}</label>
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
                                <label className="text-sm font-medium">{t('appealsTab.yourResponse')}</label>
                                <Textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder={t('appealsTab.enterResponse')}
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                                <p className="font-medium">{t('common.actions')}:</p>
                                <p className="mt-1">● {t('appealsTab.approveAppeal')}: {t('appealsTab.gradeUpdated')}</p>
                                <p>● {t('appealsTab.rejectAppeal')}: {t('appealsTab.currentGrade')}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={() => handleAppeal("reject")}>
                            <XCircle className="w-4 h-4 ml-2" />
                            {t('appealsTab.rejectAppeal')}
                        </Button>
                        <Button className="bg-green-500 hover:bg-green-600" onClick={() => handleAppeal("approve")}>
                            <CheckCircle className="w-4 h-4 ml-2" />
                            {t('appealsTab.approveAppeal')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
