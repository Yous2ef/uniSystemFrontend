import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, Download, Eye, Save, CheckCircle, AlertCircle, Star } from "lucide-react";
import { toast } from "sonner";

interface GradeComponent {
    id: string;
    name: string;
    weight: number;
    maxScore: number;
}

interface StudentGrade {
    studentId: string;
    studentCode: string;
    studentName: string;
    grades: { [componentId: string]: number };
    total: number;
    letterGrade: string;
    bonus?: number;
    penalty?: number;
}

export default function GradesTab({ sectionId }: { sectionId: string }) {
    const [activeTab, setActiveTab] = useState("components");
    const [components, setComponents] = useState<GradeComponent[]>([
        { id: "1", name: "Quizzes", weight: 10, maxScore: 100 },
        { id: "2", name: "Midterm", weight: 30, maxScore: 100 },
        { id: "3", name: "Final", weight: 40, maxScore: 100 },
        { id: "4", name: "Project", weight: 15, maxScore: 100 },
        { id: "5", name: "Attendance", weight: 5, maxScore: 100 },
    ]);
    const [students, setStudents] = useState<StudentGrade[]>([]);
    const [newComponent, setNewComponent] = useState({ name: "", weight: 0, maxScore: 100 });
    const [componentDialogOpen, setComponentDialogOpen] = useState(false);
    const [bonusDialogOpen, setBonusDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null);
    const [bonusAmount, setBonusAmount] = useState(0);
    const [bonusReason, setBonusReason] = useState("");
    const [bonusType, setBonusType] = useState<"bonus" | "penalty">("bonus");
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);

    useEffect(() => {
        // Mock data - Replace with actual API call
        const mockStudents: StudentGrade[] = [
            {
                studentId: "1",
                studentCode: "20230001",
                studentName: "أحمد حسن",
                grades: { "1": 17, "2": 35, "3": 75, "4": 38, "5": 10 },
                total: 87.5,
                letterGrade: "A",
            },
            {
                studentId: "2",
                studentCode: "20230002",
                studentName: "سارة علي",
                grades: { "1": 19, "2": 38, "3": 80, "4": 40, "5": 10 },
                total: 93.5,
                letterGrade: "A+",
            },
            {
                studentId: "3",
                studentCode: "20230003",
                studentName: "محمد خالد",
                grades: { "1": 14, "2": 28, "3": 55, "4": 30, "5": 6 },
                total: 66.5,
                letterGrade: "D+",
            },
        ];
        setStudents(mockStudents);
    }, [sectionId]);

    const addComponent = () => {
        if (!newComponent.name || newComponent.weight <= 0) {
            toast.error("يرجى إدخال اسم المكون والوزن");
            return;
        }

        const totalWeight = components.reduce((sum, c) => sum + c.weight, 0) + newComponent.weight;
        if (totalWeight > 100) {
            toast.error("مجموع الأوزان يتجاوز 100%");
            return;
        }

        setComponents([
            ...components,
            { ...newComponent, id: Date.now().toString() },
        ]);
        setNewComponent({ name: "", weight: 0, maxScore: 100 });
        setComponentDialogOpen(false);
        toast.success("تم إضافة المكون بنجاح");
    };

    const calculateLetterGrade = (total: number): string => {
        if (total >= 95) return "A+";
        if (total >= 90) return "A";
        if (total >= 85) return "B+";
        if (total >= 80) return "B";
        if (total >= 75) return "C+";
        if (total >= 70) return "C";
        if (total >= 65) return "D+";
        if (total >= 60) return "D";
        return "F";
    };

    const applyBonus = () => {
        if (!selectedStudent || bonusAmount === 0) {
            toast.error("يرجى إدخال المقدار");
            return;
        }

        if (!bonusReason.trim()) {
            toast.error("يرجى إدخال السبب");
            return;
        }

        const updatedStudents = students.map((s) => {
            if (s.studentId === selectedStudent.studentId) {
                const adjustment = bonusType === "bonus" ? bonusAmount : -bonusAmount;
                const newTotal = s.total + adjustment;
                return {
                    ...s,
                    total: Math.max(0, Math.min(100, newTotal)),
                    letterGrade: calculateLetterGrade(newTotal),
                    bonus: bonusType === "bonus" ? bonusAmount : s.bonus,
                    penalty: bonusType === "penalty" ? bonusAmount : s.penalty,
                };
            }
            return s;
        });

        setStudents(updatedStudents);
        setBonusDialogOpen(false);
        setBonusAmount(0);
        setBonusReason("");
        toast.success(`تم ${bonusType === "bonus" ? "منح" : "خصم"} الدرجات بنجاح`);
    };

    const publishGrades = () => {
        toast.success("تم نشر الدرجات بنجاح");
        setPublishDialogOpen(false);
    };

    const downloadTemplate = () => {
        toast.info("جاري تحميل النموذج...");
        // Implementation for Excel template download
    };

    const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
    const passRate = students.filter((s) => s.total >= 60).length / students.length * 100;
    const average = students.reduce((sum, s) => sum + s.total, 0) / students.length;

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="components">توزيع الدرجات</TabsTrigger>
                    <TabsTrigger value="manual">إدخال يدوي</TabsTrigger>
                    <TabsTrigger value="upload">رفع Excel</TabsTrigger>
                    <TabsTrigger value="preview">معاينة ونشر</TabsTrigger>
                </TabsList>

                {/* Components Tab */}
                <TabsContent value="components" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>⚙️ إعداد توزيع الدرجات</CardTitle>
                                <Button onClick={() => setComponentDialogOpen(true)} size="sm">
                                    <Plus className="w-4 h-4 ml-2" />
                                    إضافة مكون
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">الاسم</TableHead>
                                        <TableHead className="text-right">الوزن</TableHead>
                                        <TableHead className="text-right">الدرجة القصوى</TableHead>
                                        <TableHead className="text-right">الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {components.map((comp) => (
                                        <TableRow key={comp.id}>
                                            <TableCell className="font-medium">{comp.name}</TableCell>
                                            <TableCell>{comp.weight}%</TableCell>
                                            <TableCell>{comp.maxScore}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm">تعديل</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="font-bold bg-gray-50 dark:bg-gray-800">
                                        <TableCell>المجموع</TableCell>
                                        <TableCell className={totalWeight === 100 ? "text-green-600" : "text-red-600"}>
                                            {totalWeight}%
                                        </TableCell>
                                        <TableCell colSpan={2}>
                                            {totalWeight !== 100 && (
                                                <span className="text-sm text-red-600">
                                                    ⚠️ يجب أن يكون المجموع 100%
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Manual Entry Tab */}
                <TabsContent value="manual" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>📝 إدخال الدرجات يدوياً</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right">الطالب</TableHead>
                                            <TableHead className="text-right">الكود</TableHead>
                                            {components.map((comp) => (
                                                <TableHead key={comp.id} className="text-right">
                                                    {comp.name}<br />
                                                    <span className="text-xs text-gray-500">/{comp.maxScore}</span>
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((student) => (
                                            <TableRow key={student.studentId}>
                                                <TableCell className="font-medium">{student.studentName}</TableCell>
                                                <TableCell className="font-mono">{student.studentCode}</TableCell>
                                                {components.map((comp) => (
                                                    <TableCell key={comp.id}>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max={comp.maxScore}
                                                            value={student.grades[comp.id] || ""}
                                                            className="w-20"
                                                            placeholder="--"
                                                        />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button variant="outline">
                                    <Save className="w-4 h-4 ml-2" />
                                    حفظ مسودة
                                </Button>
                                <Button>
                                    <CheckCircle className="w-4 h-4 ml-2" />
                                    حفظ
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Excel Upload Tab */}
                <TabsContent value="upload" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>📤 رفع ملف الدرجات</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-lg mb-2">📄 اسحب الملف هنا أو اضغط للرفع</p>
                                <p className="text-sm text-gray-500">
                                    ✅ تنسيق Excel (.xlsx, .xls) | ✅ تنسيق CSV (.csv)
                                </p>
                            </div>
                            <Button variant="outline" onClick={downloadTemplate}>
                                <Download className="w-4 h-4 ml-2" />
                                📥 تحميل النموذج
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Preview & Publish Tab */}
                <TabsContent value="preview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>👁️ معاينة الدرجات النهائية</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">الطالب</TableHead>
                                        <TableHead className="text-right">الكود</TableHead>
                                        {components.map((comp) => (
                                            <TableHead key={comp.id} className="text-right text-xs">
                                                {comp.name}
                                            </TableHead>
                                        ))}
                                        <TableHead className="text-right">المجموع</TableHead>
                                        <TableHead className="text-right">الدرجة</TableHead>
                                        <TableHead className="text-right">Bonus</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.studentId}>
                                            <TableCell className="font-medium">{student.studentName}</TableCell>
                                            <TableCell className="font-mono">{student.studentCode}</TableCell>
                                            {components.map((comp) => (
                                                <TableCell key={comp.id}>
                                                    {student.grades[comp.id] || "--"}
                                                </TableCell>
                                            ))}
                                            <TableCell className="font-bold">{student.total.toFixed(1)}</TableCell>
                                            <TableCell>
                                                <Badge className={student.total >= 60 ? "bg-green-500" : "bg-red-500"}>
                                                    {student.letterGrade}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setBonusDialogOpen(true);
                                                    }}
                                                >
                                                    <Star className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-6 grid grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <p className="text-sm text-gray-600">المتوسط</p>
                                        <p className="text-2xl font-bold">{average.toFixed(1)}%</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <p className="text-sm text-gray-600">نسبة النجاح</p>
                                        <p className="text-2xl font-bold text-green-600">{passRate.toFixed(0)}%</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <p className="text-sm text-gray-600">نسبة الرسوب</p>
                                        <p className="text-2xl font-bold text-red-600">{(100 - passRate).toFixed(0)}%</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="mt-6">
                                <Button
                                    onClick={() => setPublishDialogOpen(true)}
                                    className="w-full"
                                    size="lg"
                                >
                                    <CheckCircle className="w-5 h-5 ml-2" />
                                    🚀 نشر الدرجات
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Component Dialog */}
            <Dialog open={componentDialogOpen} onOpenChange={setComponentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>➕ إضافة مكون جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>اسم المكون</Label>
                            <Input
                                value={newComponent.name}
                                onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
                                placeholder="مثال: Assignment 1"
                            />
                        </div>
                        <div>
                            <Label>الوزن (%)</Label>
                            <Input
                                type="number"
                                value={newComponent.weight}
                                onChange={(e) => setNewComponent({ ...newComponent, weight: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <Label>الدرجة القصوى</Label>
                            <Input
                                type="number"
                                value={newComponent.maxScore}
                                onChange={(e) => setNewComponent({ ...newComponent, maxScore: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setComponentDialogOpen(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={addComponent}>إضافة</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bonus/Penalty Dialog */}
            <Dialog open={bonusDialogOpen} onOpenChange={setBonusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>⭐ منح Bonus / خصم</DialogTitle>
                    </DialogHeader>
                    {selectedStudent && (
                        <div className="space-y-4">
                            <p className="font-medium">الطالب: {selectedStudent.studentName}</p>
                            <div>
                                <Label>النوع</Label>
                                <Select value={bonusType} onValueChange={(v: "bonus" | "penalty") => setBonusType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bonus">Bonus</SelectItem>
                                        <SelectItem value="penalty">خصم</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>المقدار</Label>
                                <Input
                                    type="number"
                                    value={bonusAmount}
                                    onChange={(e) => setBonusAmount(Number(e.target.value))}
                                    placeholder="مثال: 2"
                                />
                            </div>
                            <div>
                                <Label>السبب</Label>
                                <Input
                                    value={bonusReason}
                                    onChange={(e) => setBonusReason(e.target.value)}
                                    placeholder="مثال: مشاركة فعالة"
                                />
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm font-medium">💡 النتيجة:</p>
                                <p className="text-sm">
                                    الدرجة الحالية: {selectedStudent.total.toFixed(1)}
                                </p>
                                <p className="text-sm">
                                    بعد التعديل: {(selectedStudent.total + (bonusType === "bonus" ? bonusAmount : -bonusAmount)).toFixed(1)}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBonusDialogOpen(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={applyBonus}>تطبيق</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Publish Confirmation Dialog */}
            <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>🚀 تأكيد نشر الدرجات</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <p className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                <AlertCircle className="w-5 h-5" />
                                تحذير
                            </p>
                            <p className="text-sm mt-2">
                                هل أنت متأكد من نشر الدرجات؟ لن تتمكن من التعديل بعد النشر إلا بموافقة رئيس القسم.
                            </p>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p className="font-medium">📧 عند النشر:</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                                <li>سيتم إرسال إشعار لكل طالب</li>
                                <li>سيتم حساب GPA تلقائياً</li>
                                <li>سيتم تحديث السجل الأكاديمي</li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={publishGrades}>
                            ✅ نشر الآن
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
