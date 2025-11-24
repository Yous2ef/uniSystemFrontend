import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Bell, Mail, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    sendNotification: boolean;
    sendEmail: boolean;
}

export default function AnnouncementsTab({ sectionId }: { sectionId: string }) {
    const { t } = useTranslation();
    const [announcements, setAnnouncements] = useState<Announcement[]>([
        {
            id: "1",
            title: "إلغاء محاضرة الغد",
            content: "عزيزي الطالب، نعتذر عن إلغاء محاضرة الغد لظروف طارئة. سيتم تعويضها يوم الخميس في نفس الموعد.",
            date: "2025-11-20",
            sendNotification: true,
            sendEmail: true,
        },
    ]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: "",
        content: "",
        sendNotification: true,
        sendEmail: true,
    });

    const createAnnouncement = () => {
        if (!newAnnouncement.title || !newAnnouncement.content) {
            toast.error(t('announcementsTab.errors.enterTitleContent'));
            return;
        }

        const announcement: Announcement = {
            id: Date.now().toString(),
            ...newAnnouncement,
            date: new Date().toISOString().split("T")[0],
        };

        setAnnouncements([announcement, ...announcements]);
        setDialogOpen(false);
        setNewAnnouncement({
            title: "",
            content: "",
            sendNotification: true,
            sendEmail: true,
        });
        toast.success(t('announcementsTab.success.announcementPublished'));
    };

    const deleteAnnouncement = (id: string) => {
        setAnnouncements(announcements.filter((a) => a.id !== id));
        toast.success(t('announcementsTab.success.announcementDeleted'));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('announcementsTab.title')}</h3>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    {t('announcementsTab.newAnnouncement')}
                </Button>
            </div>

            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center text-gray-500">
                            {t('announcementsTab.noAnnouncements')}
                        </CardContent>
                    </Card>
                ) : (
                    announcements.map((announcement) => (
                        <Card key={announcement.id}>
                            <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                📅 {announcement.date}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteAnnouncement(announcement.id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {announcement.content}
                                </p>
                                <div className="mt-4 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    {announcement.sendNotification && (
                                        <div className="flex items-center gap-1">
                                            <Bell className="w-4 h-4" />
                                            {t('announcementsTab.inSystem')}
                                        </div>
                                    )}
                                    {announcement.sendEmail && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-4 h-4" />
                                            {t('announcementsTab.email')}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Announcement Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('announcementsTab.createAnnouncement')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>{t('announcementsTab.announcementTitle')}</Label>
                            <Input
                                value={newAnnouncement.title}
                                onChange={(e) =>
                                    setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                                }
                                placeholder={t('common.enterTitle')}
                            />
                        </div>
                        <div>
                            <Label>{t('announcementsTab.content')}</Label>
                            <Textarea
                                value={newAnnouncement.content}
                                onChange={(e) =>
                                    setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
                                }
                                placeholder={t('common.enterContent')}
                                rows={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>🔔 {t('common.sendNotification')}:</Label>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={newAnnouncement.sendNotification}
                                    onCheckedChange={(checked) =>
                                        setNewAnnouncement({...newAnnouncement,
                                            sendNotification: checked as boolean,
                                        })
                                    }
                                />
                                <label className="text-sm">{t('announcementsTab.sendNotification')}</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={newAnnouncement.sendEmail}
                                    onCheckedChange={(checked) =>
                                        setNewAnnouncement({
                                            ...newAnnouncement,
                                            sendEmail: checked as boolean,
                                        })
                                    }
                                />
                                <label className="text-sm">{t('announcementsTab.sendEmail')}</label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={createAnnouncement}>
                            <MessageSquare className="w-4 h-4 ml-2" />
                            {t('announcementsTab.publish')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
