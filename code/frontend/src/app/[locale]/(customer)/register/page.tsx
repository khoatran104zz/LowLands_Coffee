"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useAuthStore } from "@/store/auth.store";
import { registerUser } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const formSchema = zod.object({
    fullName: zod.string().min(1, { message: "Full name is required" }),
    email: zod.string().email({ message: "Invalid email" }),
    phone: zod.string().regex(/^0[0-9]{9}$/, { message: "Phone must have 10 digits and start with 0" }),
    password: zod.string().min(6, { message: "Password must be at least 6 characters" }),
  });

  type FormData = zod.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await registerUser({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      login(res.user, res.accessToken, res.refreshToken);
      toast.success(t("registerButton") + " success");
      router.push("/");
    } catch (err) {
      console.warn("Registration failed", err);
      toast.error(t("registerFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 bg-background min-h-[80vh] flex items-center justify-center text-left">
      <div className="container mx-auto px-4 flex justify-center w-full">
        <div className="w-full max-w-md border border-border/80 rounded-2xl p-8 bg-card shadow-sm flex flex-col gap-6">
          <div className="text-center">
            <h1 className="font-heading font-extrabold text-2xl text-primary tracking-tight">
              {t("registerTitle")}
            </h1>
            <div className="w-12 h-1 bg-accent rounded-full mx-auto mt-3" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">{t("fullName")}</label>
              <Input
                {...register("fullName")}
                placeholder="Nguyen Van A"
                className="border-border text-xs sm:text-sm h-10"
              />
              {errors.fullName && (
                <span className="text-xs text-destructive font-semibold">{errors.fullName.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">{t("email")}</label>
              <Input
                type="email"
                {...register("email")}
                placeholder="customer@example.com"
                className="border-border text-xs sm:text-sm h-10"
              />
              {errors.email && (
                <span className="text-xs text-destructive font-semibold">{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">{t("phone")}</label>
              <Input
                {...register("phone")}
                placeholder="0987654321"
                className="border-border text-xs sm:text-sm h-10"
              />
              {errors.phone && (
                <span className="text-xs text-destructive font-semibold">{errors.phone.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">{t("password")}</label>
              <Input
                type="password"
                {...register("password")}
                placeholder="******"
                className="border-border text-xs sm:text-sm h-10"
              />
              {errors.password && (
                <span className="text-xs text-destructive font-semibold">{errors.password.message}</span>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full rounded-full gap-2 mt-2 h-10 font-bold text-sm">
              <UserPlus className="h-4 w-4" />
              <span>{loading ? tCommon("loading") : t("registerButton")}</span>
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground border-t border-border/50 pt-4">
            <Link href="/login" className="hover:text-primary hover:underline font-semibold">
              {t("hasAccount")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
