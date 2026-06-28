"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Coffee, ArrowRight, ChevronDown } from "lucide-react";

export function Hero() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const { scrollY } = useScroll();

  // Parallax effects
  const yBg = useTransform(scrollY, [0, 600], [0, 100]);
  const yText = useTransform(scrollY, [0, 600], [0, 50]);
  const yCup = useTransform(scrollY, [0, 600], [0, -30]);
  const opacityScroll = useTransform(scrollY, [0, 300], [1, 0]);

  // Title Stagger Animation Variants
  const titleText = t("heroTitle");
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
              <span>{tCommon("brandName")}</span>
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
              {t("heroSubtitle")}
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
                  {/* Ripple overlay effect */}
                  <span className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 origin-center pointer-events-none" />
                  <span>{t("exploreMenu")}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Illustration Column */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              style={{ y: yCup }}
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring" as const, damping: 18, stiffness: 80, delay: 0.2 }}
              className="relative w-72 h-72 sm:w-96 sm:h-96"
            >
              <style>{`
                @keyframes rise-steam {
                  0% {
                    stroke-dashoffset: 0;
                    opacity: 0;
                    transform: translateY(12px) scaleX(0.85);
                  }
                  30% {
                    opacity: 0.75;
                  }
                  100% {
                    stroke-dashoffset: -80;
                    opacity: 0;
                    transform: translateY(-24px) scaleX(1.2);
                  }
                }
                .steam-line {
                  animation: rise-steam 4.5s ease-in-out infinite;
                  transform-origin: bottom center;
                }
                .steam-line-1 { animation-delay: 0s; }
                .steam-line-2 { animation-delay: 1.6s; }
                .steam-line-3 { animation-delay: 0.8s; }
              `}</style>

              {/* Steaming Coffee Cup Graphic */}
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]">
                {/* Steaming lines */}
                <path d="M75 50 Q 80 40, 75 30 T 75 10" stroke="url(#steam-grad)" strokeWidth="3" strokeLinecap="round" className="steam-line steam-line-1" />
                <path d="M100 45 Q 105 32, 100 20 T 100 5" stroke="url(#steam-grad)" strokeWidth="4.5" strokeLinecap="round" className="steam-line steam-line-2" />
                <path d="M125 50 Q 130 40, 125 30 T 125 10" stroke="url(#steam-grad)" strokeWidth="3" strokeLinecap="round" className="steam-line steam-line-3" />

                {/* Cup Body */}
                <path d="M 50 65 L 150 65 C 150 120, 135 150, 100 150 C 65 150, 50 120, 50 65 Z" fill="url(#cup-grad)" stroke="#C5A880" strokeWidth="1.5" />
                
                {/* Cup handle */}
                <path d="M 150 80 C 175 80, 175 120, 150 120" fill="none" stroke="#C5A880" strokeWidth="8" strokeLinecap="round" />
                
                {/* Plate / Saucer */}
                <ellipse cx="100" cy="155" rx="75" ry="12" fill="url(#saucer-grad)" stroke="#C5A880" strokeWidth="1.5" />
                
                {/* Gradients definitions */}
                <defs>
                  <linearGradient id="cup-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4A2C2A" />
                    <stop offset="100%" stopColor="#2D1A19" />
                  </linearGradient>
                  <linearGradient id="saucer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C5A880" />
                    <stop offset="100%" stopColor="#AA7C11" />
                  </linearGradient>
                  <linearGradient id="steam-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="rgba(247, 243, 233, 0)" />
                    <stop offset="30%" stopColor="rgba(247, 243, 233, 0.75)" />
                    <stop offset="100%" stopColor="rgba(247, 243, 233, 0)" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity: opacityScroll }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer pointer-events-none z-10"
      >
        <span className="text-[10px] uppercase font-bold tracking-widest text-primary-foreground/50">Cuộn xuống</span>
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
