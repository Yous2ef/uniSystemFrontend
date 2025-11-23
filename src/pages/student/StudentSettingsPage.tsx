import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    User,
    Lock,
    Bell,
    Palette,
    Shield,
    Save,
    Eye,
    EyeOff,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { studentsService, authService } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";

interface StudentData {
    id: string;
    studentCode: string;
    nameAr: string;
    nameEn: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: "MALE" | "FEMALE";
    nationalId?: string;
    department?: {
        nameAr: string;
        nameEn: string;
    };
    batch?: {
        name: string;
    };
    status: string;
    enrollmentDate: string;
}

interface ProfileFormData {
    nameAr: string;
    nameEn: string;
    phone: string;
    dateOfBirth: string;
    gender: "MALE" | "FEMALE" | "";
}

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function StudentSettingsPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const { theme, setTheme } = useThemeStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [activeTab, setActiveTab] = useState("profile");

    // Profile form state
    const [profileForm, setProfileForm] = useState<ProfileFormData>({
        nameAr: "",
        nameEn: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
    });
    const [profileChanged, setProfileChanged] = useState(false);

    // Password form state
    const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Preferences state
    const [notifications, setNotifications] = useState({
        emailGrades: true,
        emailMaterials: true,
        emailSchedule: true,
        emailAnnouncements: true,
        inAppAlerts: true,
        sound: false,
    });

    const [privacy, setPrivacy] = useState({
        profileVisibility: "department",
        showEmail: false,
        showPhone: false,
        allowFacultyContact: true,
    });

    useEffect(() => {
        fetchStudentData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            console.log("🔧 Fetching student settings for user:", user?.id);

            const response = await studentsService.getByUserId(user?.id || "");
            if (response.success) {
                const data = response.data;
                setStudentData(data);

                // Populate profile form
                setProfileForm({
                    nameAr: data.nameAr || "",
                    nameEn: data.nameEn || "",
                    phone: data.phone || "",
                    dateOfBirth: data.dateOfBirth
                        ? data.dateOfBirth.split("T")[0]
                        : "",
                    gender: data.gender || "",
                });

                console.log("✅ Student data loaded:", data);
            }
        } catch (error) {
            console.error("❌ Error fetching student data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (
        field: keyof ProfileFormData,
        value: string
    ) => {
        setProfileForm((prev) => ({ ...prev, [field]: value }));
        setProfileChanged(true);
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            console.log("💾 Saving profile data:", profileForm);
            console.log("📝 Student ID:", studentData?.id);

            const payload: {
                nameAr: string;
                nameEn: string;
                phone?: string;
                dateOfBirth?: string;
                gender?: string;
            } = {
                nameAr: profileForm.nameAr,
                nameEn: profileForm.nameEn,
            };

            // Only include optional fields if they have values
            if (profileForm.phone) payload.phone = profileForm.phone;
            if (profileForm.dateOfBirth)
                payload.dateOfBirth = profileForm.dateOfBirth;
            if (profileForm.gender) payload.gender = profileForm.gender;

            console.log("📤 Sending payload:", payload);

            const response = await studentsService.update(
                studentData?.id || "",
                payload
            );

            if (response.success) {
                alert("✅ " + t("student.settings.saveSuccess"));
                setProfileChanged(false);
                fetchStudentData();
            }
        } catch (error: unknown) {
            console.error("❌ Error saving profile:", error);
            const errorObj = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                errorObj?.response?.data?.message || t("student.settings.saveFailed");
            alert("❌ " + message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelProfile = () => {
        if (studentData) {
            setProfileForm({
                nameAr: studentData.nameAr || "",
                nameEn: studentData.nameEn || "",
                phone: studentData.phone || "",
                dateOfBirth: studentData.dateOfBirth
                    ? studentData.dateOfBirth.split("T")[0]
                    : "",
                gender: studentData.gender || "",
            });
            setProfileChanged(false);
        }
    };

    const handleChangePassword = async () => {
        if (
            !passwordForm.currentPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword
        ) {
            alert("❌ " + t("student.settings.fillAllFields"));
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            alert("❌ " + t("student.settings.passwordMinLength"));
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("❌ " + t("student.settings.passwordMismatch"));
            return;
        }

        try {
            setSaving(true);
            console.log("🔒 Changing password...");

            const response = await authService.changePassword(
                passwordForm.currentPassword,
                passwordForm.newPassword
            );

            if (response.success) {
                // Reset form
                setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
                alert("✅ " + t("student.settings.passwordChangeSuccess"));
            }
        } catch (error: unknown) {
            console.error("❌ Error changing password:", error);
            const errorObj = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                errorObj?.response?.data?.message || t("student.settings.passwordChangeFailed");
            alert("❌ " + message);
        } finally {
            setSaving(false);
        }
    };

    const handleThemeChange = (newTheme: "light" | "dark") => {
        setTheme(newTheme);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            {t("student.settings.loadingSettings")}
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        ⚙️ {t("student.settings.title")}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t("student.settings.subtitle")}
                    </p>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger
                            value="profile"
                            className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {t("student.settings.tabs.profile")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            {t("student.settings.tabs.security")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            {t("student.settings.tabs.notifications")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="display"
                            className="flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            {t("student.settings.tabs.display")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="privacy"
                            className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            {t("student.settings.tabs.privacy")}
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("student.settings.personalInfo")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="nameAr">
                                            {t("student.settings.nameAr")} *
                                        </Label>
                                        <Input
                                            id="nameAr"
                                            value={profileForm.nameAr}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "nameAr",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="nameEn">
                                            {t("student.settings.nameEn")} *
                                        </Label>
                                        <Input
                                            id="nameEn"
                                            value={profileForm.nameEn}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "nameEn",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phone">
                                            {t("student.settings.phone")}
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={profileForm.phone}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "phone",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="+966XXXXXXXXX"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="dateOfBirth">
                                            {t("student.settings.dateOfBirth")}
                                        </Label>
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            value={profileForm.dateOfBirth}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "dateOfBirth",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="gender">{t("student.settings.gender")}</Label>
                                        <select
                                            id="gender"
                                            value={profileForm.gender}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "gender",
                                                    e.target.value
                                                )
                                            }
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                            <option value="">{t("student.settings.select")}</option>
                                            <option value="MALE">{t("student.settings.male")}</option>
                                            <option value="FEMALE">{t("student.settings.female")}</option>
                                        </select>
                                    </div>
                                </div>

                                {profileChanged && (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleSaveProfile}
                                            disabled={saving}>
                                            <Save className="w-4 h-4 me-2" />
                                            {t("student.settings.saveChanges")}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleCancelProfile}>
                                            {t("student.settings.cancel")}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Read-Only Academic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("student.settings.academicInfo")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t("student.settings.studentCode")}</Label>
                                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                                            {studentData?.studentCode}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>{t("student.settings.email")}</Label>
                                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                                            {studentData?.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t("student.settings.department")}</Label>
                                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                                            {studentData?.department?.nameAr ||
                                                t("student.settings.notSpecified")}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>{t("student.settings.batch")}</Label>
                                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                                            {studentData?.batch?.name ||
                                                t("student.settings.notSpecified")}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t("student.settings.academicStatus")}</Label>
                                        <Badge className="mt-2">
                                            {studentData?.status}
                                        </Badge>
                                    </div>
                                    {studentData?.nationalId && (
                                        <div>
                                            <Label>{t("student.settings.nationalId")}</Label>
                                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                                                {studentData.nationalId}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("student.settings.changePassword")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="currentPassword">
                                        {t("student.settings.currentPassword")} *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            type={
                                                showPasswords.current
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={passwordForm.currentPassword}
                                            onChange={(e) =>
                                                setPasswordForm({
                                                    ...passwordForm,
                                                    currentPassword:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPasswords({
                                                    ...showPasswords,
                                                    current:
                                                        !showPasswords.current,
                                                })
                                            }
                                            className="absolute left-3 top-1/2 -translate-y-1/2">
                                            {showPasswords.current ? (
                                                <EyeOff className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="newPassword">
                                        {t("student.settings.newPassword")} * ({t("student.settings.minChars")})
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={
                                                showPasswords.new
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={passwordForm.newPassword}
                                            onChange={(e) =>
                                                setPasswordForm({
                                                    ...passwordForm,
                                                    newPassword: e.target.value,
                                                })
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPasswords({
                                                    ...showPasswords,
                                                    new: !showPasswords.new,
                                                })
                                            }
                                            className="absolute left-3 top-1/2 -translate-y-1/2">
                                            {showPasswords.new ? (
                                                <EyeOff className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="confirmPassword">
                                        {t("student.settings.confirmPassword")} *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={
                                                showPasswords.confirm
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) =>
                                                setPasswordForm({
                                                    ...passwordForm,
                                                    confirmPassword:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPasswords({
                                                    ...showPasswords,
                                                    confirm:
                                                        !showPasswords.confirm,
                                                })
                                            }
                                            className="absolute left-3 top-1/2 -translate-y-1/2">
                                            {showPasswords.confirm ? (
                                                <EyeOff className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleChangePassword}
                                    disabled={saving}>
                                    <Lock className="w-4 h-4 me-2" />
                                    {t("student.settings.changePassword")}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("student.settings.emailNotifications")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {Object.entries({
                                    emailGrades: t("student.settings.notif.grades"),
                                    emailMaterials: t("student.settings.notif.materials"),
                                    emailSchedule: t("student.settings.notif.schedule"),
                                    emailAnnouncements: t("student.settings.notif.announcements"),
                                }).map(([key, label]) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between">
                                        <span>{label}</span>
                                        <input
                                            type="checkbox"
                                            checked={
                                                notifications[
                                                    key as keyof typeof notifications
                                                ]
                                            }
                                            onChange={(e) =>
                                                setNotifications({
                                                    ...notifications,
                                                    [key]: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4"
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("student.settings.appNotifications")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span>{t("student.settings.notif.alerts")}</span>
                                    <input
                                        type="checkbox"
                                        checked={notifications.inAppAlerts}
                                        onChange={(e) =>
                                            setNotifications({
                                                ...notifications,
                                                inAppAlerts: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>{t("student.settings.notif.sounds")}</span>
                                    <input
                                        type="checkbox"
                                        checked={notifications.sound}
                                        onChange={(e) =>
                                            setNotifications({
                                                ...notifications,
                                                sound: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Display Tab */}
                    <TabsContent value="display" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("student.settings.appearance")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>{t("student.settings.mode")}</Label>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        {[
                                            { value: "light", label: t("student.settings.light") },
                                            { value: "dark", label: t("student.settings.dark") },
                                        ].map((option) => (
                                            <Button
                                                key={option.value}
                                                variant={
                                                    theme === option.value
                                                        ? "default"
                                                        : "outline"
                                                }
                                                onClick={() =>
                                                    handleThemeChange(
                                                        option.value as
                                                            | "light"
                                                            | "dark"
                                                    )
                                                }
                                                className="w-full">
                                                {option.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Privacy Tab */}
                    <TabsContent value="privacy" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("student.settings.privacySettings")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>{t("student.settings.profileVisibility")}</Label>
                                    <select
                                        value={privacy.profileVisibility}
                                        onChange={(e) =>
                                            setPrivacy({
                                                ...privacy,
                                                profileVisibility:
                                                    e.target.value,
                                            })
                                        }
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm mt-2">
                                        <option value="public">
                                            {t("student.settings.visibility.public")}
                                        </option>
                                        <option value="department">
                                            {t("student.settings.visibility.department")}
                                        </option>
                                        <option value="private">
                                            {t("student.settings.visibility.private")}
                                        </option>
                                    </select>
                                </div>

                                <div className="space-y-3 mt-4">
                                    <div className="flex items-center justify-between">
                                        <span>
                                            {t("student.settings.privacy.showEmail")}
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={privacy.showEmail}
                                            onChange={(e) =>
                                                setPrivacy({
                                                    ...privacy,
                                                    showEmail: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>{t("student.settings.privacy.showPhone")}</span>
                                        <input
                                            type="checkbox"
                                            checked={privacy.showPhone}
                                            onChange={(e) =>
                                                setPrivacy({
                                                    ...privacy,
                                                    showPhone: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>{t("student.settings.privacy.allowFacultyContact")}</span>
                                        <input
                                            type="checkbox"
                                            checked={
                                                privacy.allowFacultyContact
                                            }
                                            onChange={(e) =>
                                                setPrivacy({
                                                    ...privacy,
                                                    allowFacultyContact:
                                                        e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
