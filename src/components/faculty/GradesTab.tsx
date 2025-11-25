import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { gradesService, enrollmentsService } from "@/services/api";

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
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("components");
    const [components, setComponents] = useState<GradeComponent[]>([]);
    const [students, setStudents] = useState<StudentGrade[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComponent, setNewComponent] = useState({ name: "", weight: 0, maxScore: 100 });
    const [componentDialogOpen, setComponentDialogOpen] = useState(false);
    const [bonusDialogOpen, setBonusDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null);
    const [bonusAmount, setBonusAmount] = useState(0);
    const [bonusReason, setBonusReason] = useState("");
    const [bonusType, setBonusType] = useState<"bonus" | "penalty">("bonus");
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);

    useEffect(() => {
        fetchGradeData();
    }, [sectionId]);

    const fetchGradeData = async () => {
        try {
            setLoading(true);
            // Fetch grade components
            try {
                const componentsData = await gradesService.getSectionComponents(sectionId);
                if (componentsData.success && componentsData.data) {
                    setComponents(componentsData.data.map((c: any) => ({
                        id: c.id,
                        name: c.name,
                        weight: c.weight,
                        maxScore: c.maxScore || 100,
                    })));
                }
            } catch (compError: any) {
                console.log("No grade components found yet (this is normal for new sections)");
                // If 404, it just means no components have been created yet
                if (compError?.response?.status !== 404) {
                    console.error("Error fetching components:", compError);
                }
            }

            // Fetch students and their grades
            const enrollmentsData = await enrollmentsService.getBySectionId(sectionId);
            if (enrollmentsData.success && enrollmentsData.data) {
                const studentsGrades: StudentGrade[] = enrollmentsData.data.map((enrollment: any) => {
                    const studentGrades: { [key: string]: number } = {};
                    let total = 0;
                    
                    // Map grades if available
                    if (enrollment.grades && Array.isArray(enrollment.grades)) {
                        enrollment.grades.forEach((grade: any) => {
                            studentGrades[grade.componentId] = grade.score || 0;
                        });
                    }

                    // Calculate total
                    if (enrollment.finalGrade !== null && enrollment.finalGrade !== undefined) {
                        total = enrollment.finalGrade;
                    }

                    return {
                        studentId: enrollment.student.id,
                        studentCode: enrollment.student.studentCode,
                        studentName: enrollment.student.nameAr || enrollment.student.nameEn,
                        grades: studentGrades,
                        total,
                        letterGrade: calculateLetterGrade(total),
                    };
                });
                setStudents(studentsGrades);
            }
        } catch (error: any) {
            console.error("Error fetching grade data:", error);
            // Only show error toast if it's not a 404 (which is expected for new sections)
            if (error?.response?.status !== 404) {
                toast.error(t('gradesTab.errors.loadFailed'));
            }
        } finally {
            setLoading(false);
        }
    };

    const addComponent = () => {
        if (!newComponent.name || newComponent.weight <= 0) {
            toast.error(t('gradesTab.errors.enterNameWeight'));
            return;
        }

        const totalWeight = components.reduce((sum, c) => sum + c.weight, 0) + newComponent.weight;
        if (totalWeight > 100) {
            toast.error(t('gradesTab.errors.totalWeightExceeds'));
            return;
        }

        setComponents([
            ...components,
            { ...newComponent, id: Date.now().toString() },
        ]);
        setNewComponent({ name: "", weight: 0, maxScore: 100 });
        setComponentDialogOpen(false);
        toast.success(t('gradesTab.success.componentAdded'));
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
    const passRate = students.length > 0 ? (students.filter((s) => s.total >= 60).length / students.length * 100) : 0;
    const average = students.length > 0 ? (students.reduce((sum, s) => sum + s.total, 0) / students.length) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 gap-2">
                    <TabsTrigger value="components">{t('gradesTab.tabs.gradeDistribution')}</TabsTrigger>
                    <TabsTrigger value="manual">{t('gradesTab.tabs.manualEntry')}</TabsTrigger>
                    <TabsTrigger value="upload">{t('gradesTab.tabs.excelUpload')}</TabsTrigger>
                    <TabsTrigger value="preview">{t('gradesTab.tabs.previewPublish')}</TabsTrigger>
                </TabsList>

                {/* Components Tab */}
                <TabsContent value="components" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{t('gradesTab.setupGradeDistribution')}</CardTitle>
                                <Button onClick={() => setComponentDialogOpen(true)} size="sm">
                                    <Plus className="w-4 h-4 ml-2" />
                                    {t('gradesTab.addComponent')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">{t('gradesTab.table.name')}</TableHead>
                                        <TableHead className="text-right">{t('gradesTab.table.weight')}</TableHead>
                                        <TableHead className="text-right">{t('gradesTab.table.maxScore')}</TableHead>
                                        <TableHead className="text-right">{t('gradesTab.table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {components.map((comp) => (
                                        <TableRow key={comp.id}>
                                            <TableCell className="font-medium">{comp.name}</TableCell>
                                            <TableCell>{comp.weight}%</TableCell>
                                            <TableCell>{comp.maxScore}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm">{t('gradesTab.edit')}</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="font-bold bg-gray-50 dark:bg-gray-800">
                                        <TableCell>{t('gradesTab.total')}</TableCell>
                                        <TableCell className={totalWeight === 100 ? "text-green-600" : "text-red-600"}>
                                            {totalWeight}%
                                        </TableCell>
                                        <TableCell colSpan={2}>
                                            {totalWeight !== 100 && (
                                                <span className="text-sm text-red-600">
                                                    {t('gradesTab.totalMustBe100')}
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
                            <CardTitle>{t('gradesTab.manualGradeEntry')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right">{t('gradesTab.student')}</TableHead>
                                            <TableHead className="text-right">{t('gradesTab.code')}</TableHead>
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
                                    {t('gradesTab.saveDraft')}
                                </Button>
                                <Button>
                                    <CheckCircle className="w-4 h-4 ml-2" />
                                    {t('gradesTab.save')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Excel Upload Tab */}
                <TabsContent value="upload" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('gradesTab.uploadGradesFile')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-lg mb-2">{t('gradesTab.dragFileHere')}</p>
                                <p className="text-sm text-gray-500">
                                    {t('gradesTab.excelFormat')}
                                </p>
                            </div>
                            <Button variant="outline" onClick={downloadTemplate}>
                                <Download className="w-4 h-4 ml-2" />
                                {t('gradesTab.downloadTemplate')}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Preview & Publish Tab */}
                <TabsContent value="preview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('gradesTab.previewFinalGrades')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">{t('gradesTab.student')}</TableHead>
                                        <TableHead className="text-right">{t('gradesTab.code')}</TableHead>
                                        {components.map((comp) => (
                                            <TableHead key={comp.id} className="text-right text-xs">
                                                {comp.name}
                                            </TableHead>
                                        ))}
                                        <TableHead className="text-right">{t('gradesTab.total')}</TableHead>
                                        <TableHead className="text-right">{t('gradesTab.grade')}</TableHead>
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
                                        <p className="text-sm text-gray-600">{t('gradesTab.average')}</p>
                                        <p className="text-2xl font-bold">{average.toFixed(1)}%</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <p className="text-sm text-gray-600">{t('gradesTab.passRate')}</p>
                                        <p className="text-2xl font-bold text-green-600">{passRate.toFixed(0)}%</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <p className="text-sm text-gray-600">{t('gradesTab.failRate')}</p>
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
                                    {t('gradesTab.publishGrades')}
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
                        <DialogTitle>{t('gradesTab.addNewComponent')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>{t('gradesTab.componentName')}</Label>
                            <Input
                                value={newComponent.name}
                                onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
                                placeholder={t('gradesTab.exampleAssignment')}
                            />
                        </div>
                        <div>
                            <Label>{t('gradesTab.weightPercent')}</Label>
                            <Input
                                type="number"
                                value={newComponent.weight}
                                onChange={(e) => setNewComponent({ ...newComponent, weight: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <Label>{t('gradesTab.maxScore')}</Label>
                            <Input
                                type="number"
                                value={newComponent.maxScore}
                                onChange={(e) => setNewComponent({ ...newComponent, maxScore: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setComponentDialogOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={addComponent}>{t('common.add')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bonus/Penalty Dialog */}
            <Dialog open={bonusDialogOpen} onOpenChange={setBonusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('gradesTab.grantBonusPenalty')}</DialogTitle>
                    </DialogHeader>
                    {selectedStudent && (
                        <div className="space-y-4">
                            <p className="font-medium">{t('gradesTab.studentName')}: {selectedStudent.studentName}</p>
                            <div>
                                <Label>{t('gradesTab.type')}</Label>
                                <Select value={bonusType} onValueChange={(v: "bonus" | "penalty") => setBonusType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bonus">Bonus</SelectItem>
                                        <SelectItem value="penalty">{t('gradesTab.deduction')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{t('gradesTab.amount')}</Label>
                                <Input
                                    type="number"
                                    value={bonusAmount}
                                    onChange={(e) => setBonusAmount(Number(e.target.value))}
                                    placeholder={t('gradesTab.exampleTwo')}
                                />
                            </div>
                            <div>
                                <Label>{t('gradesTab.reason')}</Label>
                                <Input
                                    value={bonusReason}
                                    onChange={(e) => setBonusReason(e.target.value)}
                                    placeholder={t('gradesTab.exampleActiveParticipation')}
                                />
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm font-medium">{t('gradesTab.result')}</p>
                                <p className="text-sm">
                                    {t('gradesTab.currentGrade')}: {selectedStudent.total.toFixed(1)}
                                </p>
                                <p className="text-sm">
                                    {t('gradesTab.afterAdjustment')}: {(selectedStudent.total + (bonusType === "bonus" ? bonusAmount : -bonusAmount)).toFixed(1)}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBonusDialogOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={applyBonus}>{t('gradesTab.apply')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Publish Confirmation Dialog */}
            <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('gradesTab.confirmPublish')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <p className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                <AlertCircle className="w-5 h-5" />
                                {t('common.warning')}
                            </p>
                            <p className="text-sm mt-2">
                                {t('gradesTab.publishWarning')}
                            </p>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p className="font-medium">{t('gradesTab.onPublish')}</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                                <li>{t('gradesTab.publishActions.sendNotification')}</li>
                                <li>{t('gradesTab.publishActions.calculateGPA')}</li>
                                <li>{t('gradesTab.publishActions.updateRecord')}</li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={publishGrades}>
                            {t('gradesTab.publishNow')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
