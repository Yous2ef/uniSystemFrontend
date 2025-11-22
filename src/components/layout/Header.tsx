import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Globe, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/api";

export default function Header() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            logout();
            navigate("/login");
        }
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === "ar" ? "en" : "ar";
        i18n.changeLanguage(newLang);
        localStorage.setItem("language", newLang);
    };

    return (
        <header className="fixed top-0 end-0 start-0 lg:start-64 z-40 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
            <div className="flex items-center justify-between h-full px-4 sm:px-6">
                {/* User Info */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user?.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.role}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {/* Language Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleLanguage}
                        className="h-8 w-8 sm:h-10 sm:w-10"
                        title={i18n.language === "ar" ? "English" : "العربية"}>
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="h-8 w-8 sm:h-10 sm:w-10"
                        title={theme === "light" ? "Dark Mode" : "Light Mode"}>
                        {theme === "light" ? (
                            <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                            <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                    </Button>

                    {/* Logout */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="h-8 w-8 sm:h-10 sm:w-10"
                        title={t("common.logout")}>
                        <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
