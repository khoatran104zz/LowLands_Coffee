"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Coffee, ArrowRight } from "lucide-react";

export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(197,168,128,0.25),transparent_60%)]" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/15 px-4 py-1.5 text-xs sm:text-sm font-semibold text-accent backdrop-blur-sm"
            >
              <Coffee className="h-4 w-4" />
              <span>{t("heroTitle")}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight"
            >
              {t("heroTitle")}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg text-primary-foreground/80 max-w-xl leading-relaxed"
            >
              {t("heroSubtitle")}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link 
                href="/menu" 
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground shadow-lg hover:bg-accent/90 transition-all hover:translate-x-1"
              >
                <span>{t("exploreMenu")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>

          {/* Right Illustration Column */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-72 h-72 sm:w-96 sm:h-96"
            >
              {/* Steaming Coffee Cup Graphic */}
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
                {/* Steam lines */}
                <path d="M75 50 Q 80 40, 75 30 T 75 10" stroke="url(#steam-grad)" stroke-width="3" stroke-linecap="round" opacity="0.7" />
                <path d="M100 45 Q 105 32, 100 20 T 100 5" stroke="url(#steam-grad)" stroke-width="4" stroke-linecap="round" opacity="0.8" />
                <path d="M125 50 Q 130 40, 125 30 T 125 10" stroke="url(#steam-grad)" stroke-width="3" stroke-linecap="round" opacity="0.7" />

                {/* Cup Body */}
                <path d="M 50 65 L 150 65 C 150 120, 135 150, 100 150 C 65 150, 50 120, 50 65 Z" fill="url(#cup-grad)" stroke="#C5A880" stroke-width="1.5" />
                
                {/* Cup handle */}
                <path d="M 150 80 C 175 80, 175 120, 150 120" fill="none" stroke="#C5A880" stroke-width="8" stroke-linecap="round" />
                
                {/* Plate / Saucer */}
                <ellipse cx="100" cy="155" rx="75" ry="12" fill="url(#saucer-grad)" stroke="#C5A880" stroke-width="1.5" />
                
                {/* Gradients definitions */}
                <defs>
                  <linearGradient id="cup-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#4A2C2A" />
                    <stop offset="100%" stop-color="#2D1A19" />
                  </linearGradient>
                  <linearGradient id="saucer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#C5A880" />
                    <stop offset="100%" stop-color="#AA7C11" />
                  </linearGradient>
                  <linearGradient id="steam-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="rgba(247, 243, 233, 0.9)" />
                    <stop offset="100%" stop-color="rgba(247, 243, 233, 0)" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
