"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Coffee, ArrowRight, ChevronDown } from "lucide-react";

const SLIDES = [
  {
    image: "/images/hero-coffee.png",
    nameKey: "landing.hero.slide0Name",
    badgeKey: "landing.hero.slide0Badge",
    descKey: "landing.hero.slide0Desc",
    priceKey: "landing.hero.slide0Price",
  },
  {
    image: "/images/hero-bac-xiu.png",
    nameKey: "landing.hero.slide1Name",
    badgeKey: "landing.hero.slide1Badge",
    descKey: "landing.hero.slide1Desc",
    priceKey: "landing.hero.slide1Price",
  },
  {
    image: "/images/hero-tra-sen.png",
    nameKey: "landing.hero.slide2Name",
    badgeKey: "landing.hero.slide2Badge",
    descKey: "landing.hero.slide2Desc",
    priceKey: "landing.hero.slide2Price",
  },
];

export function Hero() {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
            {/* Tagline Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/15 px-4 py-1.5 text-xs sm:text-sm font-semibold text-accent backdrop-blur-sm"
            >
              <Coffee className="h-4 w-4" />
              <span>{t("landing.hero.tagline")}</span>
            </motion.div>

            {/* Staggered Title */}
            <div className="flex flex-col gap-3 items-start w-full">
              <motion.h1 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight flex flex-wrap gap-x-3 gap-y-1"
              >
                {titleWords.map((word, wIdx) => {
                  const isCoffee = word.toLowerCase().includes("coffee");
                  return (
                    <span 
                      key={wIdx} 
                      className={`whitespace-nowrap inline-block ${isCoffee ? "text-accent" : "text-white"}`}
                    >
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
                  );
                })}
              </motion.h1>
              
              {/* Gold Underline Accent */}
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="h-[2px] w-24 bg-accent origin-left"
              />
            </div>

            {/* Subtitle Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-base sm:text-lg text-primary-foreground/80 max-w-xl leading-relaxed font-medium w-full text-balance"
            >
              {t("landing.hero.subtitle")}
            </motion.p>

            {/* Social Proof */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-primary-foreground/75"
            >
              <div className="flex items-center gap-1.5">
                <div className="flex text-[#FFC72C]">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4.5 w-4.5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-bold text-white">4.9/5</span>
                <span className="text-primary-foreground/70 font-medium">({t("landing.hero.socialProofReviews")})</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-accent">{t("landing.hero.socialProofStores")}</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              {/* Primary: Order Now */}
              <Link href="/menu">
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative overflow-hidden group inline-flex items-center gap-2.5 rounded-full bg-accent hover:bg-accent/90 px-8 py-3.5 text-sm font-extrabold text-[#2D1A19] shadow-lg hover:shadow-[0_8px_30px_rgba(197,168,128,0.4)] transition-all duration-300 cursor-pointer animate-none"
                >
                  <span className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 origin-center pointer-events-none" />
                  <span>{t("landing.button.orderNow")}</span>
                </motion.div>
              </Link>

              {/* Secondary: Explore Menu */}
              <Link href="/menu">
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/25 hover:border-white/50 bg-transparent px-8 py-3.5 text-sm font-extrabold text-white transition-all duration-300 cursor-pointer"
                >
                  <span>{t("landing.button.exploreMenu")}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
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
              
              {/* Main Product Image with Crossfade */}
              <div className="w-full h-full rounded-[36px] overflow-hidden border-4 border-accent/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] bg-neutral-900 relative">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentSlide}
                    src={SLIDES[currentSlide].image}
                    alt={t(SLIDES[currentSlide].nameKey)}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                </AnimatePresence>
              </div>

              {/* Slider Dots */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? "w-6 bg-accent" : "w-2.5 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Floating Badge 1: 100% Coffee (Glassmorphic) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-6 z-20 bg-white/10 border border-white/20 backdrop-blur-md px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-lg"
              >
                <div className="h-6 w-6 rounded-full bg-accent/30 flex items-center justify-center text-accent">
                  <Coffee className="h-3.5 w-3.5" fill="currentColor" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] text-white/80 font-bold uppercase tracking-wider leading-none">Cà Phê Việt</p>
                  <p className="text-[11px] text-accent font-black leading-none mt-1">100% Mộc Mạc</p>
                </div>
              </motion.div>

              {/* Floating Card 2: Dynamic Product Info */}
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute -bottom-4 -right-6 z-20 bg-[#F5EFE6]/95 text-[#2D1A19] p-3.5 rounded-2xl flex flex-col gap-1 shadow-2xl min-w-[180px] border border-accent/25 backdrop-blur-sm"
              >
                <div className="flex justify-between items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-wider">{t(SLIDES[currentSlide].nameKey)}</span>
                  <span className="inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-[8px] font-black text-[#AA7C11] tracking-wide">
                    {t(SLIDES[currentSlide].badgeKey)}
                  </span>
                </div>
                <p className="text-[9px] text-stone-600 font-medium text-left leading-tight">
                  {t(SLIDES[currentSlide].descKey)}
                </p>
                <div className="flex justify-between items-center mt-1 border-t border-stone-200 pt-1.5">
                  <span className="text-[9px] text-stone-500 font-bold">Giá chỉ từ</span>
                  <span className="text-xs font-black text-[#C8510A] font-outfit">
                    {t(SLIDES[currentSlide].priceKey)}
                  </span>
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
