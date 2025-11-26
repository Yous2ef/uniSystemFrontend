import { Formik, Form, Field } from "formik";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/api";
import { useAuthStore } from "@/store/auth";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [error, setError] = useState("");

    const handleLogin = async (
        values: LoginForm,
        { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
    ) => {
        try {
            setError("");

            console.log("🔐 Attempting login...");
            const response = await authService.login(
                values.email,
                values.password
            );
            console.log("✅ Login response:", response);

            if (response.success) {
                console.log("👤 User:", response.data.user);
                console.log("🔑 Access Token:", response.data.accessToken);

                // Update auth state
                login(response.data.user, response.data.accessToken);

                // Check auth state immediately after login
                const authState = useAuthStore.getState();
                console.log("📦 Auth State after login:", {
                    isAuthenticated: authState.isAuthenticated,
                    user: authState.user,
                    hasToken: !!authState.accessToken,
                });

                // Navigate using React Router to preserve state
                console.log("🚀 Navigating to dashboard...");
                if (response.data.user.role === "STUDENT") {
                    navigate("/student/dashboard", { replace: true });
                } else {
                    navigate("/dashboard", { replace: true });
                }
            } else {
                setError(response.message || "Login failed");
            }
        } catch (err: unknown) {
            console.error("❌ Login error:", err);
            const errorMessage =
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (err as any).response?.data?.message ||
                "Invalid email or password";
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const validate = (values: LoginForm) => {
        const errors: Record<string, string> = {};

        try {
            loginSchema.parse(values);
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.issues.forEach((err) => {
                    const path = err.path[0];
                    if (path && typeof path === "string") {
                        errors[path] = err.message;
                    }
                });
            }
        }

        return errors;
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <GraduationCap className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {t("auth.welcome")}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t("auth.loginSubtitle")}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Login Form with Formik */}
                    <Formik
                        initialValues={{ email: "", password: "" }}
                        validate={validate}
                        onSubmit={handleLogin}>
                        {({ isSubmitting }) => (
                            <Form className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t("common.email")}
                                    </label>
                                    <Field name="email">
                                        {({
                                            field,
                                            meta,
                                        }: {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            field: any;
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            meta: any;
                                        }) => (
                                            <>
                                                <Input
                                                    {...field}
                                                    id="email"
                                                    type="email"
                                                    placeholder={t(
                                                        "auth.emailPlaceholder"
                                                    )}
                                                    className={
                                                        meta.touched &&
                                                        meta.error
                                                            ? "border-red-500"
                                                            : ""
                                                    }
                                                />
                                                {meta.touched && meta.error && (
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                        {meta.error}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </Field>
                                </div>

                                {/* Password */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t("common.password")}
                                    </label>
                                    <Field name="password">
                                        {({
                                            field,
                                            meta,
                                        }: {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            field: any;
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            meta: any;
                                        }) => (
                                            <>
                                                <Input
                                                    {...field}
                                                    id="password"
                                                    type="password"
                                                    placeholder={t(
                                                        "auth.passwordPlaceholder"
                                                    )}
                                                    className={
                                                        meta.touched &&
                                                        meta.error
                                                            ? "border-red-500"
                                                            : ""
                                                    }
                                                />
                                                {meta.touched && meta.error && (
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                        {meta.error}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </Field>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}>
                                    {isSubmitting
                                        ? t("common.loading")
                                        : t("auth.loginButton")}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
}
