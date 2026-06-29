"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Link } from "@/i18n/navigation";
import { Coffee, UserPlus, Award, Gift, ArrowRight, Sparkles } from "lucide-react";

export function LoyaltyProgramBanner() {
  const { t } = useTranslation();

  // Coffee beans drifting in the background for visual depth
  const beans = [
    { id: 1, size: 28, top: "12%", left: "8%", rotate: 35, delay: 0 },
    { id: 2, size: 20, top: "72%", left: "18%", rotate: -45, delay: 1.2 },
    { id: 3, size: 24, top: "20%", left: "85%", rotate: 95, delay: 0.6 },
    { id: 4, size: 16, top: "78%", left: "75%", rotate: 20, delay: 2.0 },
    { id: 5, size: 22, top: "50%", left: "45%", rotate: -65, delay: 1.5 }
  ];

  return (
    <section className="py-24 relative overflow-hidden text-white bg-gradient-to-br from-[#201110] via-[#2D1A19] to-[#1A0D0C]">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#C5A880]/5 blur-[120px] pointer-events-none" />

      {/* Drifting Coffee Beans */}
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
            opacity: 0.08,
            pointerEvents: "none"
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [bean.rotate, bean.rotate + 360],
          }}
          transition={{
            duration: 10 + bean.size,
            repeat: Infinity,
            ease: "easeInOut",
            delay: bean.delay
          }}
        >
          <Coffee className="w-full h-full text-accent" fill="currentColor" />
        </motion.div>
      ))}

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Loyalty Info & Steps */}
          <div className="lg:col-span-7 flex flex-col items-start gap-8 text-left">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-accent backdrop-blur-md"
              >
                <Sparkles className="h-4 w-4" />
                <span>LOWLANDS CLUB MEMBER</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight uppercase animate-fade-in"
              >
                {t("landing.loyalty.title").split("\n").map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < t("landing.loyalty.title").split("\n").length - 1 && <br />}
                  </React.Fragment>
                ))}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-base text-zinc-300 max-w-2xl leading-relaxed font-medium"
              >
                {t("landing.loyalty.desc")}
              </motion.p>
            </div>

            {/* Steps Container */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pt-2">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/40 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300 mb-4">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-sm uppercase text-white mb-2">{t("landing.loyalty.step1Title")}</h4>
                <p className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed font-medium">
                  {t("landing.loyalty.step1Desc")}
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/40 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300 mb-4">
                  <Award className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-sm uppercase text-white mb-2">{t("landing.loyalty.step2Title")}</h4>
                <p className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed font-medium">
                  {t("landing.loyalty.step2Desc")}
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/40 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300 mb-4">
                  <Gift className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-sm uppercase text-white mb-2">{t("landing.loyalty.step3Title")}</h4>
                <p className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed font-medium">
                  {t("landing.loyalty.step3Desc")}
                </p>
              </motion.div>
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3.5 rounded-full shadow-lg transition-all cursor-pointer font-extrabold text-sm"
                >
                  <span>{t("landing.loyalty.joinNow")}</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </Link>

              <Link href="/about">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 border border-white/20 hover:bg-white/5 text-white px-6 py-3.5 rounded-full transition-all cursor-pointer font-extrabold text-sm"
                >
                  <span>{t("landing.loyalty.viewBenefits")}</span>
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Glassmorphic Membership Card Visual */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.2 }}
              whileHover={{ rotateY: -10, rotateX: 5, scale: 1.03 }}
              className="relative w-full max-w-[400px] aspect-[1.58/1] rounded-[24px] bg-gradient-to-br from-[#AA7C11]/25 via-white/5 to-black/30 border border-white/25 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] p-6 flex flex-col justify-between overflow-hidden backdrop-blur-md select-none group"
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            >
              {/* Shimmer overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />

              {/* Card Background Branding Logo (large & semi-transparent) */}
              <div className="absolute -bottom-6 -right-6 text-accent/10 opacity-30 select-none pointer-events-none transform -rotate-12 group-hover:scale-110 transition-transform duration-500">
                <Coffee className="w-48 h-48" fill="currentColor" />
              </div>

              {/* Top Row: Brand & Premium Tag */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 text-accent">
                    <Coffee className="h-4 w-4" fill="currentColor" />
                  </div>
                  <span className="font-heading font-black tracking-widest text-sm text-white">LOWLANDS</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 border border-accent/40 text-[9px] font-black uppercase text-accent tracking-widest">
                  <span>{t("landing.loyalty.cardTier")}</span>
                </div>
              </div>

              {/* Chip Visual */}
              <div className="w-10 h-8 rounded-md bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 border border-yellow-800 opacity-80 shadow-inner z-10 mt-4 self-start" />

              {/* Middle Row: Card Number & Details */}
              <div className="flex flex-col gap-1 z-10 mt-6 text-left">
                <span className="font-mono text-base tracking-[0.2em] font-bold text-white/90 drop-shadow-sm select-all">
                  {t("landing.loyalty.cardNumber")}
                </span>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Card Holder</span>
                    <span className="text-xs font-black uppercase text-white tracking-widest">{t("landing.loyalty.cardHolder")}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Points</span>
                    <span className="text-xs font-black text-accent tracking-wider">{t("landing.loyalty.pointsBalance")}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
