import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, FileText, Video, Link as LinkIcon, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Material {
    id: string;
    weekNumber: number;
    title: string;
    type: "pdf" | "video" | "code" | "link";
    fileName?: string;
    fileSize?: string;
    url?: string;
    publishDate?: string;
    status: "published" | "scheduled";
}

export default function MaterialsTab({ sectionId }: { sectionId: string }) {
    const [materials, setMaterials] = useState<Material[]>([
        {
            id: "1",
            weekNumber: 1,
            title: "مقدمة",
            type: "pdf",
            fileName: "Lecture_1.pdf",
            fileSize: "2.5 MB",
            status: "published",
        },
        {
            id: "2",
            weekNumber: 1,
            title: "فيديو تعريفي",
            type: "video",
            fileName: "Video_Intro.mp4",
            fileSize: "45 MB",
            status: "published",
        },
        {
            id: "3",
            weekNumber: 2,
            title: "Arrays & Linked Lists",
            type: "pdf",
            fileName: "Lecture_2.pdf",
            fileSize: "3.1 MB",
            status: "published",
        },
    ]);
    const [uploadDialog, setUploadDialog] = useState(false);
    const [newMaterial, setNewMaterial] = useState({
        weekNumber: 1,
        title: "",
        type: "pdf" as "pdf" | "video" | "code" | "link",
        url: "",
        publishNow: true,
        publishDate: "",
    });

    const uploadMaterial = () => {
        if (!newMaterial.title) {
            toast.error("يرجى إدخال العنوان");
            return;
        }

        const material: Material = {
            id: Date.now().toString(),
            weekNumber: newMaterial.weekNumber,
            title: newMaterial.title,
            type: newMaterial.type,
            url: newMaterial.url,
            status: newMaterial.publishNow ? "published" : "scheduled",
            publishDate: newMaterial.publishDate,
        };

        setMaterials([...materials, material]);
        setUploadDialog(false);
        setNewMaterial({
            weekNumber: 1,
            title: "",
            type: "pdf",
            url: "",
            publishNow: true,
            publishDate: "",
        });
        toast.success("تم رفع المحتوى بنجاح");
    };

    const deleteMaterial = (id: string) => {
        setMaterials(materials.filter((m) => m.id !== id));
        toast.success("تم حذف المحتوى");
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "pdf":
                return <FileText className="w-5 h-5 text-red-500" />;
            case "video":
                return <Video className="w-5 h-5 text-blue-500" />;
            case "code":
                return <FileText className="w-5 h-5 text-green-500" />;
            case "link":
                return <LinkIcon className="w-5 h-5 text-purple-500" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    // Group materials by week
    const materialsByWeek = materials.reduce((acc, material) => {
        if (!acc[material.weekNumber]) {
            acc[material.weekNumber] = [];
        }
        acc[material.weekNumber].push(material);
        return acc;
    }, {} as { [week: number]: Material[] });

    const weeks = Object.keys(materialsByWeek)
        .map(Number)
        .sort((a, b) => a - b);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">📚 محتوى المادة</h3>
                <Button onClick={() => setUploadDialog(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    رفع محتوى جديد
                </Button>
            </div>

            <div className="space-y-4">
                {weeks.map((weekNum) => (
                    <Card key={weekNum}>
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                            <CardTitle className="text-lg">
                                📅 الأسبوع {weekNum}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                {materialsByWeek[weekNum].map((material) => (
                                    <div
                                        key={material.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            {getIcon(material.type)}
                                            <div>
                                                <p className="font-medium">{material.title}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {material.fileName && `${material.fileName} (${material.fileSize})`}
                                                    {material.url && material.url}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {material.status === "scheduled" && (
                                                <span className="text-xs text-orange-600">
                                                    📅 مجدول: {material.publishDate}
                                                </span>
                                            )}
                                            <Button variant="ghost" size="sm">
                                                ✏️ تعديل
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteMaterial(material.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Empty state for next week */}
                <Card>
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                        <CardTitle className="text-lg text-gray-600 dark:text-gray-400">
                            📅 الأسبوع {weeks.length + 1}: قريباً...
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setNewMaterial({ ...newMaterial, weekNumber: weeks.length + 1 });
                                setUploadDialog(true);
                            }}
                        >
                            <Plus className="w-4 h-4 ml-2" />
                            إضافة محتوى
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Upload Dialog */}
            <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>📤 رفع محتوى جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>الأسبوع</Label>
                                <Select
                                    value={newMaterial.weekNumber.toString()}
                                    onValueChange={(v) =>
                                        setNewMaterial({ ...newMaterial, weekNumber: Number(v) })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 15 }, (_, i) => i + 1).map((week) => (
                                            <SelectItem key={week} value={week.toString()}>
                                                الأسبوع {week}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>نوع المحتوى</Label>
                                <Select
                                    value={newMaterial.type}
                                    onValueChange={(v: any) => setNewMaterial({ ...newMaterial, type: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pdf">📄 PDF</SelectItem>
                                        <SelectItem value="video">🎥 فيديو</SelectItem>
                                        <SelectItem value="code">💻 كود</SelectItem>
                                        <SelectItem value="link">🔗 رابط</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>العنوان</Label>
                            <Input
                                value={newMaterial.title}
                                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                placeholder="مثال: محاضرة الأسبوع الأول"
                            />
                        </div>

                        <div>
                            <Label>إرفاق ملفات</Label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">📎 اسحب الملفات هنا أو اضغط للرفع</p>
                            </div>
                        </div>

                        {newMaterial.type === "link" && (
                            <div>
                                <Label>الرابط</Label>
                                <Input
                                    value={newMaterial.url}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>📅 موعد النشر</Label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={newMaterial.publishNow}
                                        onChange={() => setNewMaterial({ ...newMaterial, publishNow: true })}
                                    />
                                    <span>● الآن</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={!newMaterial.publishNow}
                                        onChange={() => setNewMaterial({ ...newMaterial, publishNow: false })}
                                    />
                                    <span>○ جدولة</span>
                                </label>
                            </div>
                            {!newMaterial.publishNow && (
                                <Input
                                    type="datetime-local"
                                    value={newMaterial.publishDate}
                                    onChange={(e) =>
                                        setNewMaterial({ ...newMaterial, publishDate: e.target.value })
                                    }
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUploadDialog(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={uploadMaterial}>
                            <Upload className="w-4 h-4 ml-2" />
                            📤 رفع ونشر
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
