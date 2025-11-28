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
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);

    const REQUEST_TYPES = [
        {
            id: "enrollment_certificate",
            name: "شهادة قيد",
            icon: FileText,
            description: "طلب شهادة قيد للجهات الرسمية أو السفارات",
        },
        {
            id: "transcript",
            name: "كشف درجات",
            icon: GraduationCap,
            description: "طلب كشف درجات رسمي معتمد",
        },
        {
            id: "course_withdrawal",
            name: "انسحاب من مادة",
            icon: XCircle,
            description: "طلب انسحاب من مادة دراسية",
        },
        {
            id: "study_deferment",
            name: "تأجيل الدراسة",
            icon: Clock,
            description: "طلب تأجيل الدراسة لفصل دراسي أو أكثر",
        },
        {
            id: "grade_appeal",
            name: "اعتراض على درجة",
            icon: AlertTriangle,
            description: "طلب مراجعة درجة امتحان أو تقييم",
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
                        مقبول
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 ml-1" />
                        مرفوض
                    </Badge>
                );
            case "pending":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                        <Clock className="w-3 h-3 ml-1" />
                        قيد المراجعة
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
                            جاري تحميل الطلبات...
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
                            📝 طلبي
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            إدارة طلباتك وتقديم طلبات جديدة
                        </p>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="w-4 h-4 ml-2" />
                        طلب جديد
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
                        <CardTitle>طلباتي</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {requests.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    لم تقم بتقديم أي طلبات بعد
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
                                                        تاريخ التقديم:{" "}
                                                        {new Date(
                                                            request.submittedAt
                                                        ).toLocaleDateString(
                                                            "ar-EG"
                                                        )}
                                                    </span>
                                                    {request.processedAt && (
                                                        <span>
                                                            تاريخ المعالجة:{" "}
                                                            {new Date(
                                                                request.processedAt
                                                            ).toLocaleDateString(
                                                                "ar-EG"
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                {request.adminNotes && (
                                                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            <strong>
                                                                ملاحظات الإدارة:
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
                            💡 إرشادات تقديم الطلبات
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                            <li>• يتم مراجعة الطلبات خلال 3-5 أيام عمل</li>
                            <li>• تأكد من إدخال جميع التفاصيل المطلوبة بدقة</li>
                            <li>
                                • يمكنك متابعة حالة طلبك من خلال هذه الصفحة
                            </li>
                            <li>
                                • في حالة الرفض، يمكنك التواصل مع شؤون الطلاب للاستفسار
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* New Request Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>طلب جديد</DialogTitle>
                        <DialogDescription>
                            اختر نوع الطلب وأدخل التفاصيل المطلوبة
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="requestType">نوع الطلب</Label>
                            <Select
                                value={selectedType}
                                onValueChange={setSelectedType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر نوع الطلب" />
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
                            <Label htmlFor="description">التفاصيل</Label>
                            <Textarea
                                id="description"
                                placeholder="أدخل تفاصيل الطلب..."
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
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleSubmitRequest}
                            disabled={!selectedType || !description}>
                            تقديم الطلب
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
