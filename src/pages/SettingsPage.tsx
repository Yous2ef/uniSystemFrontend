import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Settings,
    Database,
    Bell,
    Shield,
    Mail,
    Globe,
    Users,
    Calendar,
    FileText,
    Download,
    Upload,
    Trash2,
    RefreshCw,
    Save,
    Lock,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { backupService } from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface SystemSettings {
    // General Settings
    universityName: string;
    universityNameEn: string;
    universityLogo: string;
    academicYear: string;
    defaultLanguage: string;
    timezone: string;

    // Registration Settings
    allowSelfRegistration: boolean;
    requireEmailVerification: boolean;
    minPasswordLength: number;
    maxLoginAttempts: number;
    sessionTimeout: number;

    // Academic Settings
    maxCreditsPerTerm: number;
    minCreditsForFullTime: number;
    passingGrade: number;
    gradingScale: string;
    attendanceRequired: boolean;
    minAttendancePercentage: number;

    // Notification Settings
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    notifyOnEnrollment: boolean;
    notifyOnGradePosted: boolean;
    notifyOnDropDeadline: boolean;

    // System Settings
    maintenanceMode: boolean;
    allowDataExport: boolean;
    enableAuditLog: boolean;
    autoBackup: boolean;
    backupFrequency: string;
}

export default function SettingsPage() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<SystemSettings>({
        universityName: "جامعة الملك سعود",
        universityNameEn: "King Saud University",
        universityLogo: "",
        academicYear: "2024-2025",
        defaultLanguage: "ar",
        timezone: "Asia/Riyadh",
        allowSelfRegistration: false,
        requireEmailVerification: true,
        minPasswordLength: 8,
        maxLoginAttempts: 5,
        sessionTimeout: 30,
        maxCreditsPerTerm: 18,
        minCreditsForFullTime: 12,
        passingGrade: 60,
        gradingScale: "percentage",
        attendanceRequired: true,
        minAttendancePercentage: 75,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        notifyOnEnrollment: true,
        notifyOnGradePosted: true,
        notifyOnDropDeadline: true,
        maintenanceMode: false,
        allowDataExport: true,
        enableAuditLog: true,
        autoBackup: true,
        backupFrequency: "daily",
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const [isCreatingBackup, setIsCreatingBackup] = useState(false);
    const [backupProgress, setBackupProgress] = useState({
        message: "",
        percent: 0,
    });
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreProgress, setRestoreProgress] = useState({
        message: "",
        percent: 0,
    });
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalFaculty: 0,
        totalCourses: 0,
        activeTerms: 0,
        databaseSize: "0 MB",
        lastBackup: "",
    });

    useEffect(() => {
        // Load settings from API
        loadSettings();
        loadStats();
    }, []);

    const loadSettings = async () => {
        try {
            // TODO: Replace with actual API call
            // const response = await api.get("/settings");
            // setSettings(response.data);
            console.log("Settings loaded");
        } catch (error) {
            console.error("Error loading settings:", error);
        }
    };

    const loadStats = async () => {
        try {
            const [backupStats, systemStats] = await Promise.all([
                backupService.getBackupStats(),
                backupService.getSystemStats(),
            ]);

            setStats({
                totalUsers: systemStats.data.totalUsers,
                totalStudents: systemStats.data.totalStudents,
                totalFaculty: systemStats.data.totalFaculty,
                totalCourses: systemStats.data.totalCourses,
                activeTerms: systemStats.data.activeTerms,
                databaseSize: backupStats.data.databaseSize,
                lastBackup: backupStats.data.lastBackup,
            });
        } catch (error) {
            console.error("Error loading stats:", error);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            // TODO: Replace with actual API call
            // await api.put("/settings", settings);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSaveMessage({
                type: "success",
                text: t("pages.settings.saveSuccess"),
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            setSaveMessage({
                type: "error",
                text: t("pages.settings.saveFailed"),
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleBackupDatabase = async () => {
        try {
            setIsCreatingBackup(true);
            setBackupProgress({
                message: t("pages.settings.backupProgress.creatingInProgress"),
                percent: 0,
            });

            const { accessToken } = useAuthStore.getState();
            const response = await fetch(
                "http://localhost:5000/api/backup/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to create backup");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let filename = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = JSON.parse(line.slice(6));

                            if (data.error) {
                                throw new Error(
                                    data.message || "Backup failed"
                                );
                            }

                            if (data.done) {
                                filename = data.filename;
                                break;
                            }

                            setBackupProgress({
                                message: data.message || "",
                                percent: data.percent || 0,
                            });
                        }
                    }
                }
            }

            // Download the backup file
            if (filename) {
                const downloadResponse = await backupService.downloadBackup(
                    filename
                );
                const blob = new Blob([downloadResponse.data], {
                    type: "application/sql",
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                alert(t("pages.settings.backupSuccess") + ": " + filename);
            }

            loadStats();
        } catch (error) {
            console.error("Error backing up database:", error);
            alert(t("pages.settings.backupFailed"));
        } finally {
            setIsCreatingBackup(false);
            setBackupProgress({ message: "", percent: 0 });
        }
    };

    const handleRestoreDatabase = async () => {
        // Create file input element
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".sql";

        input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];

            if (!file) {
                return;
            }

            if (
                !confirm(
                    t("pages.settings.restoreConfirm", { filename: file.name })
                )
            ) {
                return;
            }

            setIsRestoring(true);
            setRestoreProgress({ message: "جاري تحميل الملف...", percent: 0 });

            try {
                const formData = new FormData();
                formData.append("file", file);

                // Use EventSource for SSE
                const { accessToken } = useAuthStore.getState();
                const response = await fetch(
                    "http://localhost:5000/api/backup/upload-restore",
                    {
                        method: "POST",
                        body: formData,
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                if (!response.body) {
                    throw new Error("No response body");
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                const data = JSON.parse(line.substring(6));

                                if (data.error) {
                                    throw new Error(data.message);
                                }

                                if (data.done) {
                                    setRestoreProgress({
                                        message: data.message,
                                        percent: 100,
                                    });
                                    setTimeout(() => {
                                        alert(
                                            t("pages.settings.restoreSuccess")
                                        );
                                        loadStats();
                                        setIsRestoring(false);
                                    }, 1000);
                                    return;
                                }

                                setRestoreProgress({
                                    message: data.message,
                                    percent: data.percent,
                                });
                            } catch (parseError) {
                                console.error(
                                    "Error parsing SSE data:",
                                    parseError
                                );
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error restoring database:", error);
                alert(t("pages.settings.restoreFailed"));
                setIsRestoring(false);
            }
        };

        input.click();
    };

    const handleClearCache = async () => {
        try {
            const result = await backupService.clearCache();
            if (result.success) {
                alert(result.message || t("pages.settings.cacheCleared"));
            }
        } catch (error) {
            console.error("Error clearing cache:", error);
            alert(t("pages.settings.cacheClearFailed"));
        }
    };

    const handleExportData = async (type: string) => {
        try {
            const response = await backupService.exportData(type);

            // Create download link
            const blob = new Blob([JSON.stringify(response.data, null, 2)], {
                type: "application/json",
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${type}-export-${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert(t("pages.settings.exportSuccess", { type }));
        } catch (error) {
            console.error("Error exporting data:", error);
            alert(t("pages.settings.exportFailed"));
        }
    };

    const handleDeleteAllData = async () => {
        const confirmation = prompt(t("pages.settings.deleteAllDataPrompt"));

        if (confirmation !== t("pages.settings.deleteKeyword")) {
            alert(t("pages.settings.operationCancelled"));
            return;
        }

        if (!confirm(t("pages.settings.deleteAllDataConfirm"))) {
            alert(t("pages.settings.operationCancelled"));
            return;
        }

        try {
            const result = await backupService.deleteAllData();
            if (result.success) {
                alert(t("pages.settings.deleteAllDataSuccess"));
                loadStats();
            }
        } catch (error) {
            console.error("Error deleting all data:", error);
            alert(t("pages.settings.deleteAllDataFailed"));
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto p-4 sm:p-6 space-y-6" dir="rtl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                            <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
                            {t("pages.settings.title")}
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-2">
                            {t("pages.settings.subtitle")}
                        </p>
                    </div>
                    <Button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        size="lg"
                        className="w-full sm:w-auto">
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving
                            ? t("pages.settings.saving")
                            : t("pages.settings.saveSettings")}
                    </Button>
                </div>

                {saveMessage && (
                    <Alert
                        variant={
                            saveMessage.type === "error"
                                ? "destructive"
                                : "default"
                        }>
                        {saveMessage.type === "success" ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : (
                            <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>{saveMessage.text}</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        <TabsTrigger
                            value="general"
                            className="text-xs sm:text-sm flex items-center justify-center">
                            <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {t("pages.settings.tabs.general")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="academic"
                            className="text-xs sm:text-sm flex items-center justify-center">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {t("pages.settings.tabs.academic")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="text-xs sm:text-sm flex items-center justify-center">
                            <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {t("pages.settings.tabs.security")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="text-xs sm:text-sm flex items-center justify-center">
                            <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {t("pages.settings.tabs.notifications")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="database"
                            className="text-xs sm:text-sm flex items-center justify-center">
                            <Database className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {t("pages.settings.tabs.database")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="system"
                            className="text-xs sm:text-sm flex items-center justify-center">
                            <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {t("pages.settings.tabs.system")}
                        </TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t("pages.settings.generalSettings")}
                                </CardTitle>
                                <CardDescription>
                                    {t("pages.settings.generalSettingsDesc")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="universityName">
                                            {t("pages.settings.universityName")}
                                        </Label>
                                        <Input
                                            id="universityName"
                                            value={settings.universityName}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    universityName:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="universityNameEn">
                                            {t(
                                                "pages.settings.universityNameEn"
                                            )}
                                        </Label>
                                        <Input
                                            id="universityNameEn"
                                            value={settings.universityNameEn}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    universityNameEn:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="academicYear">
                                            {t("pages.settings.academicYear")}
                                        </Label>
                                        <Input
                                            id="academicYear"
                                            value={settings.academicYear}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    academicYear:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="defaultLanguage">
                                            {t(
                                                "pages.settings.defaultLanguage"
                                            )}
                                        </Label>
                                        <Select
                                            value={settings.defaultLanguage}
                                            onValueChange={(value) =>
                                                setSettings({
                                                    ...settings,
                                                    defaultLanguage: value,
                                                })
                                            }>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ar">
                                                    {t(
                                                        "pages.settings.languages.arabic"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="en">
                                                    {t(
                                                        "pages.settings.languages.english"
                                                    )}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timezone">
                                        {t("pages.settings.timezone")}
                                    </Label>
                                    <Select
                                        value={settings.timezone}
                                        onValueChange={(value) =>
                                            setSettings({
                                                ...settings,
                                                timezone: value,
                                            })
                                        }>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Asia/Riyadh">
                                                {t(
                                                    "pages.settings.timezones.riyadh"
                                                )}
                                            </SelectItem>
                                            <SelectItem value="Asia/Dubai">
                                                {t(
                                                    "pages.settings.timezones.dubai"
                                                )}
                                            </SelectItem>
                                            <SelectItem value="Asia/Cairo">
                                                {t(
                                                    "pages.settings.timezones.cairo"
                                                )}
                                            </SelectItem>
                                            <SelectItem value="UTC">
                                                {t(
                                                    "pages.settings.timezones.utc"
                                                )}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t("pages.settings.systemStats")}
                                </CardTitle>
                                <CardDescription>
                                    {t("pages.settings.systemStatsDesc")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="flex flex-col items-center p-4 border rounded-lg">
                                        <Users className="h-8 w-8 mb-2 text-primary" />
                                        <div className="text-2xl font-bold">
                                            {stats.totalUsers}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {t(
                                                "pages.settings.stats.totalUsers"
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center p-4 border rounded-lg">
                                        <Users className="h-8 w-8 mb-2 text-blue-500" />
                                        <div className="text-2xl font-bold">
                                            {stats.totalStudents}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {t("pages.settings.stats.students")}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center p-4 border rounded-lg">
                                        <Users className="h-8 w-8 mb-2 text-green-500" />
                                        <div className="text-2xl font-bold">
                                            {stats.totalFaculty}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {t("pages.settings.stats.faculty")}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center p-4 border rounded-lg">
                                        <FileText className="h-8 w-8 mb-2 text-orange-500" />
                                        <div className="text-2xl font-bold">
                                            {stats.totalCourses}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {t("pages.settings.stats.courses")}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Academic Settings */}
                    <TabsContent value="academic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t("pages.settings.academicSettings")}
                                </CardTitle>
                                <CardDescription>
                                    {t("pages.settings.academicSettingsDesc")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="maxCredits">
                                            {t(
                                                "pages.settings.maxCreditsPerTerm"
                                            )}
                                        </Label>
                                        <Input
                                            id="maxCredits"
                                            type="number"
                                            value={settings.maxCreditsPerTerm}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    maxCreditsPerTerm: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="minCredits">
                                            {t(
                                                "pages.settings.minCreditsFullTime"
                                            )}
                                        </Label>
                                        <Input
                                            id="minCredits"
                                            type="number"
                                            value={
                                                settings.minCreditsForFullTime
                                            }
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    minCreditsForFullTime:
                                                        parseInt(
                                                            e.target.value
                                                        ),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="passingGrade">
                                            {t("pages.settings.passingGrade")}
                                        </Label>
                                        <Input
                                            id="passingGrade"
                                            type="number"
                                            value={settings.passingGrade}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    passingGrade: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gradingScale">
                                            {t("pages.settings.gradingScale")}
                                        </Label>
                                        <Select
                                            value={settings.gradingScale}
                                            onValueChange={(value) =>
                                                setSettings({
                                                    ...settings,
                                                    gradingScale: value,
                                                })
                                            }>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">
                                                    {t(
                                                        "pages.settings.gradingScales.percentage"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="gpa">
                                                    {t(
                                                        "pages.settings.gradingScales.gpa"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="letters">
                                                    {t(
                                                        "pages.settings.gradingScales.letters"
                                                    )}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>
                                                {t(
                                                    "pages.settings.attendanceRequired"
                                                )}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t(
                                                    "pages.settings.attendanceRequiredDesc"
                                                )}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={
                                                settings.attendanceRequired
                                            }
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    attendanceRequired: checked,
                                                })
                                            }
                                        />
                                    </div>

                                    {settings.attendanceRequired && (
                                        <div className="space-y-2 mr-6">
                                            <Label htmlFor="minAttendance">
                                                {t(
                                                    "pages.settings.minAttendancePercentage"
                                                )}
                                            </Label>
                                            <Input
                                                id="minAttendance"
                                                type="number"
                                                value={
                                                    settings.minAttendancePercentage
                                                }
                                                onChange={(e) =>
                                                    setSettings({
                                                        ...settings,
                                                        minAttendancePercentage:
                                                            parseInt(
                                                                e.target.value
                                                            ),
                                                    })
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Settings */}
                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t("pages.settings.securitySettings")}
                                </CardTitle>
                                <CardDescription>
                                    {t("pages.settings.securitySettingsDesc")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>
                                                {t(
                                                    "pages.settings.allowSelfRegistration"
                                                )}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t(
                                                    "pages.settings.allowSelfRegistrationDesc"
                                                )}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={
                                                settings.allowSelfRegistration
                                            }
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    allowSelfRegistration:
                                                        checked,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>
                                                {t(
                                                    "pages.settings.requireEmailVerification"
                                                )}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t(
                                                    "pages.settings.requireEmailVerificationDesc"
                                                )}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={
                                                settings.requireEmailVerification
                                            }
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    requireEmailVerification:
                                                        checked,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="minPassword">
                                            {t(
                                                "pages.settings.minPasswordLength"
                                            )}
                                        </Label>
                                        <Input
                                            id="minPassword"
                                            type="number"
                                            value={settings.minPasswordLength}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    minPasswordLength: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxAttempts">
                                            {t(
                                                "pages.settings.maxLoginAttempts"
                                            )}
                                        </Label>
                                        <Input
                                            id="maxAttempts"
                                            type="number"
                                            value={settings.maxLoginAttempts}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    maxLoginAttempts: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sessionTimeout">
                                        {t("pages.settings.sessionTimeout")}
                                    </Label>
                                    <Input
                                        id="sessionTimeout"
                                        type="number"
                                        value={settings.sessionTimeout}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                sessionTimeout: parseInt(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        {t("pages.settings.sessionTimeoutDesc")}
                                    </p>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>
                                            {t("pages.settings.enableAuditLog")}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {t(
                                                "pages.settings.enableAuditLogDesc"
                                            )}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.enableAuditLog}
                                        onCheckedChange={(checked) =>
                                            setSettings({
                                                ...settings,
                                                enableAuditLog: checked,
                                            })
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Settings */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t("pages.settings.notificationsSettings")}
                                </CardTitle>
                                <CardDescription>
                                    {t(
                                        "pages.settings.notificationsSettingsDesc"
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                {t(
                                                    "pages.settings.emailNotifications"
                                                )}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t(
                                                    "pages.settings.emailNotificationsDesc"
                                                )}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={
                                                settings.emailNotifications
                                            }
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    emailNotifications: checked,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>
                                                {t(
                                                    "pages.settings.smsNotifications"
                                                )}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t(
                                                    "pages.settings.smsNotificationsDesc"
                                                )}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={settings.smsNotifications}
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    smsNotifications: checked,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>
                                                {t(
                                                    "pages.settings.pushNotifications"
                                                )}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t(
                                                    "pages.settings.pushNotificationsDesc"
                                                )}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={settings.pushNotifications}
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    pushNotifications: checked,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <h3 className="font-semibold">
                                        {t("pages.settings.notificationTypes")}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t(
                                            "pages.settings.notificationTypesDesc"
                                        )}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>
                                            {t(
                                                "pages.settings.notifyOnEnrollment"
                                            )}
                                        </Label>
                                        <Switch
                                            checked={
                                                settings.notifyOnEnrollment
                                            }
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    notifyOnEnrollment: checked,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>
                                            {t(
                                                "pages.settings.notifyOnGradePosted"
                                            )}
                                        </Label>
                                        <Switch
                                            checked={
                                                settings.notifyOnGradePosted
                                            }
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    notifyOnGradePosted:
                                                        checked,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>
                                            {t(
                                                "pages.settings.notifyOnDropDeadline"
                                            )}
                                        </Label>
                                        <Switch
                                            checked={
                                                settings.notifyOnDropDeadline
                                            }
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    notifyOnDropDeadline:
                                                        checked,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Database Settings */}
                    <TabsContent value="database" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t("pages.settings.databaseInfo")}
                                </CardTitle>
                                <CardDescription>
                                    {t("pages.settings.databaseInfoDesc")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground mb-1">
                                            {t("pages.settings.databaseSize")}
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {stats.databaseSize}
                                        </div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground mb-1">
                                            {t("pages.settings.activeTerms")}
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {stats.activeTerms}
                                        </div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground mb-1">
                                            {t("pages.settings.lastBackup")}
                                        </div>
                                        <div className="text-sm font-medium">
                                            {stats.lastBackup ||
                                                t("pages.settings.noBackup")}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>
                                                {t("pages.settings.autoBackup")}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t(
                                                    "pages.settings.autoBackupDesc"
                                                )}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={settings.autoBackup}
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    autoBackup: checked,
                                                })
                                            }
                                        />
                                    </div>

                                    {settings.autoBackup && (
                                        <div className="space-y-2 mr-6">
                                            <Label htmlFor="backupFrequency">
                                                {t(
                                                    "pages.settings.backupFrequency"
                                                )}
                                            </Label>
                                            <Select
                                                value={settings.backupFrequency}
                                                onValueChange={(value) =>
                                                    setSettings({
                                                        ...settings,
                                                        backupFrequency: value,
                                                    })
                                                }>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hourly">
                                                        {t(
                                                            "pages.settings.frequencies.hourly"
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="daily">
                                                        {t(
                                                            "pages.settings.frequencies.daily"
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="weekly">
                                                        {t(
                                                            "pages.settings.frequencies.weekly"
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="monthly">
                                                        {t(
                                                            "pages.settings.frequencies.monthly"
                                                        )}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <h3 className="font-semibold">
                                        {t("pages.settings.databaseOperations")}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <Button
                                            onClick={handleBackupDatabase}
                                            variant="outline"
                                            className="w-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800">
                                            <Download className="h-4 w-4 mr-2" />
                                            {t("pages.settings.createBackup")}
                                        </Button>
                                        <Button
                                            onClick={handleRestoreDatabase}
                                            disabled={isRestoring}
                                            variant="outline"
                                            className="w-full bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 border-green-200 dark:border-green-800">
                                            <Upload className="h-4 w-4 mr-2" />
                                            {isRestoring
                                                ? t(
                                                      "pages.settings.restoreProgress.restoringInProgress"
                                                  )
                                                : t(
                                                      "pages.settings.restoreBackup"
                                                  )}
                                        </Button>
                                        <Button
                                            onClick={handleClearCache}
                                            variant="outline"
                                            className="w-full bg-orange-50 hover:bg-orange-100 dark:bg-orange-950 dark:hover:bg-orange-900 border-orange-200 dark:border-orange-800">
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            {t("pages.settings.clearCache")}
                                        </Button>
                                    </div>

                                    {/* Backup Progress Dialog */}
                                    <Dialog
                                        open={isCreatingBackup}
                                        onOpenChange={() => {}}>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <Database className="h-5 w-5" />
                                                    {t(
                                                        "pages.settings.backupProgress.title"
                                                    )}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    {t(
                                                        "pages.settings.backupProgress.description"
                                                    )}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4  p-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">
                                                            {
                                                                backupProgress.message
                                                            }
                                                        </span>
                                                        <span className="font-medium">
                                                            {
                                                                backupProgress.percent
                                                            }
                                                            %
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={
                                                            backupProgress.percent
                                                        }
                                                        className="h-2"
                                                    />
                                                </div>
                                                <Alert>
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        {t(
                                                            "pages.settings.backupProgress.warning"
                                                        )}
                                                    </AlertDescription>
                                                </Alert>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Restore Progress Dialog */}
                                    <Dialog
                                        open={isRestoring}
                                        onOpenChange={() => {}}>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <Upload className="h-5 w-5" />
                                                    {t(
                                                        "pages.settings.restoreProgress.title"
                                                    )}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    {t(
                                                        "pages.settings.restoreProgress.description"
                                                    )}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 p-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">
                                                            {
                                                                restoreProgress.message
                                                            }
                                                        </span>
                                                        <span className="font-medium">
                                                            {
                                                                restoreProgress.percent
                                                            }
                                                            %
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={
                                                            restoreProgress.percent
                                                        }
                                                        className="h-2"
                                                    />
                                                </div>
                                                <Alert>
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        {t(
                                                            "pages.settings.restoreProgress.warning"
                                                        )}
                                                    </AlertDescription>
                                                </Alert>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t("pages.settings.exportData")}
                                </CardTitle>
                                <CardDescription>
                                    {t("pages.settings.exportDataDesc")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="space-y-0.5">
                                        <Label>
                                            {t(
                                                "pages.settings.allowDataExport"
                                            )}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {t(
                                                "pages.settings.allowDataExportDesc"
                                            )}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.allowDataExport}
                                        onCheckedChange={(checked) =>
                                            setSettings({
                                                ...settings,
                                                allowDataExport: checked,
                                            })
                                        }
                                    />
                                </div>

                                {settings.allowDataExport && (
                                    <>
                                        <Separator className="my-4" />
                                        <div className="space-y-3">
                                            <h4 className="font-medium">
                                                {t(
                                                    "pages.settings.exportReports"
                                                )}
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    onClick={() =>
                                                        handleExportData(
                                                            "students"
                                                        )
                                                    }
                                                    variant="outline"
                                                    size="sm">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    {t(
                                                        "pages.settings.exportStudents"
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleExportData(
                                                            "faculty"
                                                        )
                                                    }
                                                    variant="outline"
                                                    size="sm">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    {t(
                                                        "pages.settings.exportFaculty"
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleExportData(
                                                            "courses"
                                                        )
                                                    }
                                                    variant="outline"
                                                    size="sm">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    {t(
                                                        "pages.settings.exportCourses"
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleExportData(
                                                            "grades"
                                                        )
                                                    }
                                                    variant="outline"
                                                    size="sm">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    {t(
                                                        "pages.settings.exportGrades"
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleExportData(
                                                            "attendance"
                                                        )
                                                    }
                                                    variant="outline"
                                                    size="sm">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    {t(
                                                        "pages.settings.exportAttendance"
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* System Settings */}
                    <TabsContent value="system" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t("pages.settings.advancedSystemSettings")}
                                </CardTitle>
                                <CardDescription>
                                    {t(
                                        "pages.settings.advancedSystemSettingsDesc"
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {t("pages.settings.systemWarning")}
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                        <div className="space-y-0.5">
                                            <Label className="flex items-center gap-2">
                                                <Lock className="h-4 w-4" />
                                                {t(
                                                    "pages.settings.maintenanceMode"
                                                )}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t(
                                                    "pages.settings.maintenanceModeDesc"
                                                )}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={settings.maintenanceMode}
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    maintenanceMode: checked,
                                                })
                                            }
                                        />
                                    </div>

                                    {settings.maintenanceMode && (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                {t(
                                                    "pages.settings.maintenanceModeActive"
                                                )}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <h3 className="font-semibold">
                                        {t("pages.settings.systemInfo")}
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {t(
                                                    "pages.settings.systemVersion"
                                                )}
                                            </span>
                                            <Badge variant="outline">
                                                v2.0.0
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {t(
                                                    "pages.settings.lastUpdateDate"
                                                )}
                                            </span>
                                            <span>2025-11-15</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {t(
                                                    "pages.settings.systemStatus"
                                                )}
                                            </span>
                                            <Badge
                                                variant="default"
                                                className="bg-green-500">
                                                {t(
                                                    "pages.settings.statusActive"
                                                )}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {t("pages.settings.uptime")}
                                            </span>
                                            <span>
                                                {t(
                                                    "pages.settings.uptimeValue"
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    {t("pages.settings.dangerZone")}
                                </CardTitle>
                                <CardDescription>
                                    {t("pages.settings.dangerZoneDesc")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="destructive"
                                    size="lg"
                                    className="w-full font-semibold"
                                    onClick={handleDeleteAllData}>
                                    <Trash2 className="h-5 w-5 mr-2" />
                                    {t("pages.settings.deleteAllData")}
                                </Button>
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        {t(
                                            "pages.settings.deleteAllDataWarning"
                                        )}
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
