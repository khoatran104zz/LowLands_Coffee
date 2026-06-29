"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Apple, Play, Coffee } from "lucide-react";

export function AppDownloadBanner() {
  const { t } = useTranslation();
  // Coffee beans absolute coordinates for drift effect
  const beans = [
    { id: 1, size: 28, top: "15%", left: "12%", rotate: 45, delay: 0 },
    { id: 2, size: 20, top: "70%", left: "22%", rotate: -25, delay: 1.5 },
    { id: 3, size: 24, top: "25%", left: "80%", rotate: 110, delay: 0.8 },
    { id: 4, size: 16, top: "75%", left: "70%", rotate: 15, delay: 2.2 },
    { id: 5, size: 22, top: "45%", left: "48%", rotate: -80, delay: 1.2 }
  ];

  return (
    <section className="py-20 relative overflow-hidden text-white" style={{ background: "linear-gradient(135deg, #2D1A19 0%, #1A0D0C 100%)" }}>
      {/* Drifting Coffee Beans background */}
      {beans.map((bean) => (
        <motion.div
          key={bean.id}
          style={{
            position: "absolute",
            top: bean.top,
            left: bean.left,
            width: bean.size,
            height: bean.size,
            rotate: bean.rotate,
            opacity: 0.15,
            pointerEvents: "none"
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [bean.rotate, bean.rotate + 360],
          }}
          transition={{
            duration: 12 + bean.size,
            repeat: Infinity,
            ease: "easeInOut",
            delay: bean.delay
          }}
        >
          <Coffee className="w-full h-full text-accent" fill="currentColor" />
        </motion.div>
      ))}

      {/* Main Grid */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text & Store badges */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight uppercase"
            >
              {t("landing.app.title").split("\n").map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  {idx < t("landing.app.title").split("\n").length - 1 && <br />}
                </React.Fragment>
              ))}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-sm sm:text-base opacity-80 max-w-xl leading-relaxed font-semibold"
            >
              {t("landing.app.desc")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2 w-full"
            >
              {/* App Store button */}
              <motion.a
                href="https://apple.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 bg-white text-[#2D1A19] hover:bg-neutral-100 px-5 py-3 rounded-2xl shadow-md transition-all cursor-pointer font-bold border border-white/20"
              >
                <Apple className="h-6 w-6 shrink-0 fill-current" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] uppercase font-bold opacity-60">{t("landing.app.downloadOn")}</div>
                  <div className="text-sm font-black font-outfit">App Store</div>
                </div>
              </motion.a>

              {/* Google Play button */}
              <motion.a
                href="https://play.google.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 bg-transparent text-white border border-white/30 hover:bg-white/10 px-5 py-3 rounded-2xl shadow-md transition-all cursor-pointer font-bold"
              >
                <Play className="h-6 w-6 shrink-0 fill-current" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] uppercase font-bold opacity-60">{t("landing.app.downloadOnGoogle")}</div>
                  <div className="text-sm font-black font-outfit">Google Play</div>
                </div>
              </motion.a>
            </motion.div>
          </div>

          {/* Right Column: Phone Mockup floating */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <motion.div
              animate={{
                y: [0, -15, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-60 h-[420px] bg-[#2A1815] border-[6px] border-neutral-800 rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden shrink-0 flex flex-col justify-between items-center p-3 select-none"
            >
              {/* Speaker Notch */}
              <div className="w-24 h-4 bg-neutral-800 rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2 z-20 flex justify-center items-start">
                <div className="w-12 h-1 bg-neutral-900 rounded-full mt-1"></div>
              </div>

              {/* Screen Content Wrapper */}
              <div className="w-full h-full bg-[#FAF8F5] rounded-[28px] overflow-hidden relative flex flex-col pt-5 text-neutral-800 select-none pointer-events-none">
                {/* Simulated Header */}
                <div className="px-4 py-2 border-b border-border/40 flex items-center justify-between">
                  <img src="/logo/logo.svg" alt="App Logo" className="h-5 object-contain" />
                  <div className="w-5 h-5 rounded-full bg-accent/25 flex items-center justify-center">
                    <span className="text-[8px] font-black text-[#C8510A]">N</span>
                  </div>
                </div>

                {/* Simulated Content */}
                <div className="flex-grow p-3 space-y-3 overflow-hidden text-left">
                  <div className="h-2.5 w-16 bg-neutral-300 rounded"></div>
                  <div className="text-[10px] font-black leading-tight text-neutral-900 uppercase">{t("landing.app.hello")}</div>

                  {/* Banner inside Phone */}
                  <div className="h-16 bg-[#2D1A19] text-white p-2 rounded-xl flex flex-col justify-center gap-0.5" style={{ background: "linear-gradient(135deg, #2D1A19 0%, #AA7C11 100%)" }}>
                    <div className="text-[7px] font-bold text-accent uppercase tracking-widest leading-none">{t("landing.app.promoToday")}</div>
                    <div className="text-[9px] font-black leading-tight uppercase">{t("landing.app.promoFreeDrink")}</div>
                    <div className="text-[7px] opacity-75 leading-none">{t("landing.app.promoMinOrder")}</div>
                  </div>

                  {/* Menu items inside Phone */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">{t("landing.app.recommendedMenu")}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="border border-border/60 rounded-xl p-1.5 flex flex-col gap-1 bg-white">
                        <div className="w-full aspect-[4/3] rounded-lg bg-neutral-200 overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=150" alt="" className="object-cover w-full h-full" />
                        </div>
                        <div className="text-[8px] font-black text-neutral-800 truncate leading-none">Phin Sữa Đá</div>
                        <div className="text-[7px] font-bold text-[#C8510A] leading-none">29.000đ</div>
                      </div>
                      <div className="border border-border/60 rounded-xl p-1.5 flex flex-col gap-1 bg-white">
                        <div className="w-full aspect-[4/3] rounded-lg bg-neutral-200 overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=150" alt="" className="object-cover w-full h-full" />
                        </div>
                        <div className="text-[8px] font-black text-neutral-800 truncate leading-none">Trà Sen Vàng</div>
                        <div className="text-[7px] font-bold text-[#C8510A] leading-none">39.000đ</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Bottom Nav */}
                <div className="bg-white border-t border-border/40 p-2.5 grid grid-cols-4 gap-1 text-center text-[7px] font-bold text-neutral-400">
                  <div className="text-[#C8510A]">{t("landing.app.navHome")}</div>
                  <div>{t("landing.app.navMenu")}</div>
                  <div>{t("landing.app.navWallet")}</div>
                  <div>{t("landing.app.navSettings")}</div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
