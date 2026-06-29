"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Link } from "@/i18n/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Coffee, ArrowRight, ChevronDown } from "lucide-react";

export function Hero() {
  const { t } = useTranslation();
  const { scrollY } = useScroll();

  // Parallax effects
  const yBg = useTransform(scrollY, [0, 600], [0, 100]);
  const yText = useTransform(scrollY, [0, 600], [0, 50]);
  const yCup = useTransform(scrollY, [0, 600], [0, -30]);
  const opacityScroll = useTransform(scrollY, [0, 300], [1, 0]);

  // Title Stagger Animation Variants
  const titleText = t("landing.hero.title");
  const titleWords = titleText.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 110,
      },
    },
  };

  return (
    <section className="relative overflow-hidden bg-primary py-24 lg:py-32 text-primary-foreground min-h-[90vh] flex items-center">
      {/* Decorative Background Elements with Parallax */}
      <motion.div 
        style={{ y: yBg }} 
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(197,168,128,0.25),transparent_60%)] pointer-events-none" 
      />
      <motion.div 
        style={{ y: yBg }} 
        className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" 
      />
      
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <motion.div 
            style={{ y: yText }}
            className="lg:col-span-7 flex flex-col items-start gap-6 text-left"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/15 px-4 py-1.5 text-xs sm:text-sm font-semibold text-accent backdrop-blur-sm"
            >
              <Coffee className="h-4 w-4" />
              <span>{t("common.brandName")}</span>
            </motion.div>

            {/* Staggered Title */}
            <motion.h1 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight flex flex-wrap gap-x-3 gap-y-1"
            >
              {titleWords.map((word, wIdx) => (
                <span key={wIdx} className="whitespace-nowrap inline-block">
                  {word.split("").map((char, cIdx) => (
                    <motion.span 
                      key={cIdx} 
                      variants={letterVariants} 
                      className="inline-block origin-bottom"
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              ))}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-base sm:text-lg text-primary-foreground/80 max-w-xl leading-relaxed font-medium"
            >
              {t("landing.hero.subtitle")}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link href="/menu">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative overflow-hidden group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-extrabold text-accent-foreground shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <span className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 origin-center pointer-events-none" />
                  <span>{t("landing.button.exploreMenu")}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </Link>

              <Link href="/menu">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:bg-white/10 px-6 py-3.5 text-sm font-extrabold text-white transition-all duration-300 cursor-pointer"
                >
                  <span>{t("landing.button.orderNow")}</span>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column: Premium Iced Coffee Image Stack */}
          <div className="lg:col-span-5 flex justify-center relative select-none">
            {/* Background Glow Halo */}
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-[80px] scale-90 pointer-events-none" />

            <motion.div
              style={{ y: yCup }}
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 60, delay: 0.3 }}
              className="relative z-10 w-72 h-72 sm:w-[380px] sm:h-[380px]"
            >
              {/* Decorative gold background border rotated */}
              <div className="absolute inset-0 border border-accent/40 rounded-[36px] -rotate-3 scale-[1.02] pointer-events-none" />
              
              <div className="w-full h-full rounded-[36px] overflow-hidden border-4 border-accent/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] bg-neutral-900">
                <img 
                  src="/images/hero-coffee.png" 
                  alt="Lowlands Signature Phin Sua Da" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                />
              </div>

              {/* Floating Badge 1: 100% Coffee */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-6 z-20 bg-[#2D1A19]/95 border border-accent/40 backdrop-blur-md px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-lg"
              >
                <div className="h-6 w-6 rounded-full bg-accent/25 flex items-center justify-center text-accent">
                  <Coffee className="h-3 w-3" fill="currentColor" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-none">Cà Phê Việt</p>
                  <p className="text-[11px] text-white font-black leading-none mt-1">100% Mộc Mạc</p>
                </div>
              </motion.div>

              {/* Floating Badge 2: Product info */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-4 -right-6 z-20 bg-white/95 text-neutral-800 p-3.5 rounded-2xl flex flex-col gap-1 shadow-2xl min-w-[170px] border border-border/40"
              >
                <div className="flex justify-between items-center gap-3">
                  <span className="text-xs font-black text-primary uppercase tracking-wider">Phin Sữa Đá</span>
                  <span className="inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-[8px] font-black text-[#AA7C11] tracking-wide">BEST SELLER</span>
                </div>
                <p className="text-[9px] text-zinc-500 font-medium text-left leading-tight">Đậm đà hương vị truyền thống Việt</p>
                <div className="flex justify-between items-center mt-1 border-t border-zinc-100 pt-1.5">
                  <span className="text-[9px] text-zinc-400 font-bold">Giá chỉ từ</span>
                  <span className="text-xs font-black text-[#C8510A] font-outfit">29.000đ</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity: opacityScroll }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer pointer-events-none z-10"
      >
        <span className="text-[10px] uppercase font-bold tracking-widest text-primary-foreground/50">{t("common.scrollDown")}</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5 text-accent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
