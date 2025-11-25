import { useState, useEffect } from "react";
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
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Materials will be loaded from API when backend endpoint is ready
        // For now keeping empty until API is implemented
        setLoading(false);
    }, [sectionId]);
    const [uploadDialog, setUploadDialog] = useState(false);
    const [newMaterial, setNewMaterial] = useState({
        weekNumber: 1,
        title: "",
        type: "pdf" as "pdf" | "video" | "code" | "link",
        url: "",
        publishNow: true,
        publishDate: "",
    });
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        
        const files = Array.from(e.dataTransfer.files);
        setUploadedFiles(prev => [...prev, ...files]);
        
        if (files.length > 0 && !newMaterial.title) {
            setNewMaterial({ ...newMaterial, title: files[0].name.replace(/\.[^/.]+$/, "") });
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setUploadedFiles(prev => [...prev, ...files]);
            
            if (files.length > 0 && !newMaterial.title) {
                setNewMaterial({ ...newMaterial, title: files[0].name.replace(/\.[^/.]+$/, "") });
            }
        }
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const uploadMaterial = () => {
        if (!newMaterial.title) {
            toast.error(t('materialsTab.errors.enterTitle'));
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
        setUploadedFiles([]);
        toast.success(t('materialsTab.success.materialUploaded'));
    };

    const deleteMaterial = (id: string) => {
        setMaterials(materials.filter((m) => m.id !== id));
        toast.success(t('materialsTab.success.materialDeleted'));
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
                <h3 className="text-lg font-semibold">{t('materialsTab.title')}</h3>
                <Button onClick={() => setUploadDialog(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    {t('materialsTab.addMaterial')}
                </Button>
            </div>

            <div className="space-y-4">
                {weeks.map((weekNum) => (
                    <Card key={weekNum}>
                        <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                            <CardTitle className="text-lg">
                                📅 {t('materialsTab.week')} {weekNum}
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
                                                    📅 {material.publishDate}
                                                </span>
                                            )}
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
                    <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                        <CardTitle className="text-lg text-gray-600 dark:text-gray-400">
                            📅 {t('materialsTab.week')} {weeks.length + 1}: {t('common.comingSoon')}...
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
                            {t('materialsTab.addMaterial')}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Upload Dialog */}
            <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('materialsTab.uploadMaterial')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>{t('materialsTab.weekNumber')}</Label>
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
                                                {t('materialsTab.week')} {week}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{t('materialsTab.materialType')}</Label>
                                <Select
                                    value={newMaterial.type}
                                    onValueChange={(v: any) => setNewMaterial({ ...newMaterial, type: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pdf">📄 {t('materialsTab.pdf')}</SelectItem>
                                        <SelectItem value="video">🎥 {t('materialsTab.video')}</SelectItem>
                                        <SelectItem value="code">💻 {t('materialsTab.code')}</SelectItem>
                                        <SelectItem value="link">🔗 {t('materialsTab.link')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>{t('materialsTab.materialTitle')}</Label>
                            <Input
                                value={newMaterial.title}
                                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                placeholder={t('common.enterTitle')}
                            />
                        </div>

                        <div>
                            <Label>{t('common.attachFiles')}</Label>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`
                                    border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                                    ${isDragging 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }
                                `}
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    accept={
                                        newMaterial.type === 'pdf' ? '.pdf' :
                                        newMaterial.type === 'video' ? 'video/*' :
                                        newMaterial.type === 'code' ? '.zip,.rar,.7z' :
                                        '*'
                                    }
                                />
                                <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                                <p className={`text-sm font-medium mb-1 ${isDragging ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {isDragging ? t('common.dropHere') : t('common.dragOrClick')}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {newMaterial.type === 'pdf' && 'PDF files only'}
                                    {newMaterial.type === 'video' && 'Video files (MP4, AVI, MOV)'}
                                    {newMaterial.type === 'code' && 'Compressed files (ZIP, RAR)'}
                                    {newMaterial.type === 'link' && 'Any file type'}
                                </p>
                            </div>

                            {/* Uploaded Files List */}
                            {uploadedFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'} selected:
                                    </p>
                                    {uploadedFiles.map((file, index) => (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile(index);
                                                }}
                                                className="shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {newMaterial.type === "link" && (
                            <div>
                                <Label>{t('materialsTab.url')}</Label>
                                <Input
                                    value={newMaterial.url}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>📅 {t('materialsTab.publishDate')}</Label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={newMaterial.publishNow}
                                        onChange={() => setNewMaterial({ ...newMaterial, publishNow: true })}
                                    />
                                    <span>● {t('materialsTab.publishNow')}</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={!newMaterial.publishNow}
                                        onChange={() => setNewMaterial({ ...newMaterial, publishNow: false })}
                                    />
                                    <span>○ {t('materialsTab.schedulePublish')}</span>
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
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={uploadMaterial}>
                            <Upload className="w-4 h-4 ml-2" />
                            {t('materialsTab.upload')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
