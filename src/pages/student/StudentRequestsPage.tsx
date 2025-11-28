import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FileText,
    GraduationCap,
    Clock,
    XCircle,
    AlertTriangle,
    CheckCircle,
    Plus,
} from "lucide-react";

interface Request {
    id: string;
    type: string;
    typeName: string;
    description: string;
    status: "pending" | "approved" | "rejected";
    submittedAt: string;
    processedAt?: string;
    adminNotes?: string;
}

export default function StudentRequestsPage() {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);

    const REQUEST_TYPES = [
        {
            id: "enrollment_certificate",
            name: t("student.requests.types.enrollment_certificate"),
            icon: FileText,
            description: t(
                "student.requests.types.enrollment_certificate_desc"
            ),
        },
        {
            id: "transcript",
            name: t("student.requests.types.transcript"),
            icon: GraduationCap,
            description: t("student.requests.types.transcript_desc"),
        },
        {
            id: "course_withdrawal",
            name: t("student.requests.types.course_withdrawal"),
            icon: XCircle,
            description: t("student.requests.types.course_withdrawal_desc"),
        },
        {
            id: "study_deferment",
            name: t("student.requests.types.study_deferment"),
            icon: Clock,
            description: t("student.requests.types.study_deferment_desc"),
        },
        {
            id: "grade_appeal",
            name: t("student.requests.types.grade_appeal"),
            icon: AlertTriangle,
            description: t("student.requests.types.grade_appeal_desc"),
        },
    ];
    const [requests, setRequests] = useState<Request[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            // Mock requests data
            const mockRequests: Request[] = [
                {
                    id: "1",
                    type: "enrollment_certificate",
                    typeName: "شهادة قيد",
                    description: "شهادة قيد للسفارة",
                    status: "approved",
                    submittedAt: "2024-01-15T10:30:00",
                    processedAt: "2024-01-16T14:20:00",
                    adminNotes: "تم الموافقة وطباعة الشهادة",
                },
                {
                    id: "2",
                    type: "course_withdrawal",
                    typeName: "انسحاب من مادة",
                    description: "انسحاب من مادة MATH202 - تفاضل وتكامل",
                    status: "pending",
                    submittedAt: "2024-01-20T09:15:00",
                },
                {
                    id: "3",
                    type: "grade_appeal",
                    typeName: "اعتراض على درجة",
                    description: "اعتراض على درجة امتحان CS301",
                    status: "rejected",
                    submittedAt: "2024-01-10T11:00:00",
                    processedAt: "2024-01-12T16:30:00",
                    adminNotes: "تم مراجعة الدرجة ولم يتم العثور على خطأ",
                },
            ];
            setRequests(mockRequests);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRequest = async () => {
        if (!selectedType || !description) return;

        const typeInfo = REQUEST_TYPES.find((t) => t.id === selectedType);
        const newRequest: Request = {
            id: String(requests.length + 1),
            type: selectedType,
            typeName: typeInfo?.name || "",
            description,
            status: "pending",
            submittedAt: new Date().toISOString(),
        };

        setRequests([newRequest, ...requests]);
        setIsDialogOpen(false);
        setSelectedType("");
        setDescription("");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return (
                    <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        <CheckCircle className="w-3 h-3 ml-1" />
                        {t("student.requests.status.approved")}
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 ml-1" />
                        {t("student.requests.status.rejected")}
                    </Badge>
                );
            case "pending":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                        <Clock className="w-3 h-3 ml-1" />
                        {t("student.requests.status.pending")}
                    </Badge>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            {t("student.requests.loadingRequests")}
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            📝 {t("student.requests.title")}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {t("student.requests.subtitle")}
                        </p>
                    </div>
                    <Button className="mt-4 " onClick={() => setIsDialogOpen(true)}>
                        <Plus className="w-4 h-4ml-2" />
                        {t("student.requests.newRequest")}
                    </Button>
                </div>

                {/* Request Types Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {REQUEST_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                            <Card
                                key={type.id}
                                className="cursor-pointer transition-all hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700"
                                onClick={() => {
                                    setSelectedType(type.id);
                                    setIsDialogOpen(true);
                                }}>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                                            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                {type.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {type.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Requests List */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {t("student.requests.myRequests")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {requests.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    {t("student.requests.noRequests")}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="p-4 rounded-lg border dark:border-gray-700">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                        {request.typeName}
                                                    </h3>
                                                    {getStatusBadge(
                                                        request.status
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                    {request.description}
                                                </p>
                                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                                    <span>
                                                        {t(
                                                            "student.requests.submittedAt"
                                                        )}
                                                        :{" "}
                                                        {new Date(
                                                            request.submittedAt
                                                        ).toLocaleDateString(
                                                            i18n.language ===
                                                                "ar"
                                                                ? "ar-EG"
                                                                : "en-US"
                                                        )}
                                                    </span>
                                                    {request.processedAt && (
                                                        <span>
                                                            {t(
                                                                "student.requests.processedAt"
                                                            )}
                                                            :{" "}
                                                            {new Date(
                                                                request.processedAt
                                                            ).toLocaleDateString(
                                                                i18n.language ===
                                                                    "ar"
                                                                    ? "ar-EG"
                                                                    : "en-US"
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                {request.adminNotes && (
                                                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            <strong>
                                                                {t(
                                                                    "student.requests.adminNotes"
                                                                )}
                                                                :
                                                            </strong>{" "}
                                                            {request.adminNotes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Box */}
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                        <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                            💡 {t("student.requests.guidelines")}
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                            <li>• {t("student.requests.info1")}</li>
                            <li>• {t("student.requests.info2")}</li>
                            <li>• {t("student.requests.info3")}</li>
                            <li>• {t("student.requests.info4")}</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* New Request Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {t("student.requests.newRequest")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("student.requests.dialogDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="requestType">
                                {t("student.requests.requestType")}
                            </Label>
                            <Select
                                value={selectedType}
                                onValueChange={setSelectedType}>
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={t(
                                            "student.requests.selectType"
                                        )}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {REQUEST_TYPES.map((type) => (
                                        <SelectItem
                                            key={type.id}
                                            value={type.id}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">
                                {t("student.requests.description")}
                            </Label>
                            <Textarea
                                id="description"
                                placeholder={t(
                                    "student.requests.descriptionPlaceholder"
                                )}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}>
                            {t("student.requests.cancel")}
                        </Button>
                        <Button
                            onClick={handleSubmitRequest}
                            disabled={!selectedType || !description}>
                            {t("student.requests.submit")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
