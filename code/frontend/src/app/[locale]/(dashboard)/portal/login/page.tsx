"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useAuthStore } from "@/store/auth.store";
import { loginUser } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, LogIn, Lock, Mail } from "lucide-react";
import Image from "next/image";

export default function PortalLoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(false);

  const formSchema = zod.object({
    email: zod.string().email({ message: "Email không hợp lệ" }),
    password: zod.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  });

  type FormData = zod.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await loginUser({ email: data.email, password: data.password });
      
      const roleUpper = res.user.roleName?.toUpperCase();
      
      if (roleUpper === "CUSTOMER") {
        toast.error("Tài khoản khách hàng không có quyền truy cập cổng thông tin nội bộ!");
        logout();
        return;
      }
      
      login(res.user, res.accessToken);
      localStorage.setItem("lowlands_refresh_token", res.refreshToken);
      toast.success("Đăng nhập cổng quản trị thành công!");
      
      if (roleUpper === "ADMIN") {
        router.push(`/${locale}/admin/dashboard`);
      } else if (roleUpper === "MANAGER") {
        router.push(`/${locale}/manager/dashboard`);
      } else if (roleUpper === "STAFF") {
        router.push(`/${locale}/staff/pos`);
      } else {
        router.push(`/${locale}/staff/pos`);
      }
    } catch (err) {
      console.warn("Portal login failed", err);
      toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden px-4 select-none">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-amber-800/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 shadow-2xl z-10 flex flex-col gap-8">
        {/* Brand Logo & Heading */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="relative h-12 w-36 brightness-0 invert opacity-95">
            <Image
              src="/logo/logo.svg"
              alt="Lowlands Coffee"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-1.5 mt-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1 rounded-full">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Cổng quản trị nội bộ</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-left">
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tài khoản Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                <Mail className="h-4 w-4" />
              </span>
              <Input
                type="email"
                {...register("email")}
                placeholder="admin@lowlands.coffee"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 pl-10 focus:border-amber-500 focus:ring-amber-500/20 h-11 text-sm rounded-xl"
              />
            </div>
            {errors.email && (
              <span className="text-xs text-rose-500 font-semibold">{errors.email.message}</span>
            )}
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mật khẩu bảo mật</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                <Lock className="h-4 w-4" />
              </span>
              <Input
                type="password"
                {...register("password")}
                placeholder="••••••"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 pl-10 focus:border-amber-500 focus:ring-amber-500/20 h-11 text-sm rounded-xl"
              />
            </div>
            {errors.password && (
              <span className="text-xs text-rose-500 font-semibold">{errors.password.message}</span>
            )}
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm h-11 rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 mt-4 hover:scale-[1.01] transition-transform duration-200"
          >
            <LogIn className="h-4 w-4" />
            <span>{loading ? "Đang xác thực..." : "ĐĂNG NHẬP HỆ THỐNG"}</span>
          </Button>
        </form>

        <div className="text-center text-xs text-zinc-650 border-t border-zinc-800/80 pt-4">
          Hệ thống giám sát nội bộ Lowlands Coffee. Mọi hành vi truy cập trái phép sẽ bị xử lý.
        </div>
      </div>
    </div>
  );
}
