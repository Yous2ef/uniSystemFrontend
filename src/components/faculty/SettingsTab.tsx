import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface TA {
    id: string;
    name: string;
    email: string;
    section: string;
}

export default function SettingsTab({ sectionId }: { sectionId: string }) {
    const { t } = useTranslation();
    const [settings, setSettings] = useState({
        minAttendance: 75,
        allowExcuses: true,
        maxExcuses: 3,
        lateSubmission: "allowed",
        lateSubmissionPenalty: 10,
    });

    const [tas, setTas] = useState<TA[]>([
        { id: "1", name: "م. علي محمد", email: "ali@university.edu", section: "معمل A" },
        { id: "2", name: "م. فاطمة حسن", email: "fatima@university.edu", section: "معمل B" },
    ]);

    const saveSettings = () => {
        toast.success(t('settingsTab.success.settingsSaved'));
    };

    const removeTA = (id: string) => {
        setTas(tas.filter((ta) => ta.id !== id));
        toast.success(t('settingsTab.success.taRemoved'));
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    {t('settingsTab.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('settingsTab.subtitle')}
                </p>
            </div>

            {/* Course Info */}
            <Card>
                <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                    <CardTitle>{t('settingsTab.generalInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>{t('settingsTab.courseName')}</Label>
                            <Input value="هياكل البيانات" disabled />
                        </div>
                        <div>
                            <Label>{t('settingsTab.courseCode')}</Label>
                            <Input value="CS301" disabled />
                        </div>
                        <div>
                            <Label>{t('settingsTab.creditHours')}</Label>
                            <Input value="3" disabled />
                        </div>
                        <div>
                            <Label>{t('settingsTab.section')}</Label>
                            <Input value="1" disabled />
                        </div>
                        <div>
                            <Label>{t('settingsTab.semester')}</Label>
                            <Input value="خريف 2025" disabled />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Policy */}
            <Card>
                <CardHeader className="bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                    <CardTitle>{t('settingsTab.attendancePolicy')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div>
                        <Label>{t('settingsTab.minAttendance')}</Label>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={settings.minAttendance}
                            onChange={(e) =>
                                setSettings({ ...settings, minAttendance: Number(e.target.value) })
                            }
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('settingsTab.minAttendanceDesc')}
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label>{t('settingsTab.allowExcuses')}</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('settingsTab.allowExcusesDesc')}
                            </p>
                        </div>
                        <Switch
                            checked={settings.allowExcuses}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, allowExcuses: checked })
                            }
                        />
                    </div>

                    {settings.allowExcuses && (
                        <div>
                            <Label>{t('settingsTab.maxExcuses')}</Label>
                            <Input
                                type="number"
                                min="0"
                                value={settings.maxExcuses}
                                onChange={(e) =>
                                    setSettings({ ...settings, maxExcuses: Number(e.target.value) })
                                }
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Late Submission Policy */}
            <Card>
                <CardHeader className="bg-linear-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30">
                    <CardTitle>{t('settingsTab.lateSubmissionPolicy')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div>
                        <Label>{t('settingsTab.lateSubmissionLabel')}</Label>
                        <Select
                            value={settings.lateSubmission}
                            onValueChange={(v) => setSettings({ ...settings, lateSubmission: v })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="allowed">● {t('settingsTab.allowed')}</SelectItem>
                                <SelectItem value="not_allowed">○ {t('settingsTab.notAllowed')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {settings.lateSubmission === "allowed" && (
                        <div>
                            <Label>{t('settingsTab.penalty')}</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={settings.lateSubmissionPenalty}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        lateSubmissionPenalty: Number(e.target.value),
                                    })
                                }
                            />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {t('settingsTab.penaltyPerDay').replace('%', settings.lateSubmissionPenalty + '%')}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Teaching Assistants */}
            <Card>
                <CardHeader className="bg-linear-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30">
                    <div className="flex items-center justify-between">
                        <CardTitle>{t('settingsTab.teachingAssistants')}</CardTitle>
                        <Button size="sm" variant="outline">
                            <UserPlus className="w-4 h-4 ml-2" />
                            {t('settingsTab.addTA')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-3">
                        {tas.map((ta) => (
                            <div
                                key={ta.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div>
                                    <p className="font-medium">{ta.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {ta.email} | {ta.section}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeTA(ta.id)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={saveSettings} size="lg">
                    {t('settingsTab.saveSettings')}
                </Button>
            </div>
        </div>
    );
}
