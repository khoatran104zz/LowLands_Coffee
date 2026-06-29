"use client";

import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Coffee, MapPin, Sparkles, Award } from "lucide-react";
import { motion, useInView } from "framer-motion";

interface CounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

function Counter({ value, suffix = "", duration = 2.5 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      if (start === end) return;

      const totalMiliseconds = duration * 1000;
      // Calculate delay based on target count
      const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 25);
      
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) {
          clearInterval(timer);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref} className="font-outfit font-black text-3xl sm:text-4xl text-[#C8510A]">{count}{suffix}</span>;
}

export function AboutBrand() {
  const { t } = useTranslation();

  // Animations variants
  const textVariants = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const paragraphVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="py-20 bg-secondary/30 relative overflow-hidden">
      <style>{`
        .flip-card {
          background-color: transparent;
          perspective: 1000px;
          height: 180px;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: left;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          flex-col: true;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .flip-card-front {
          background-color: var(--card, #ffffff);
          border: 1px solid rgba(228, 228, 231, 0.8);
          z-index: 2;
        }
        .flip-card-back {
          background-color: #2D1A19;
          color: #FAF8F5;
          border: 1px solid #C5A880/30;
          transform: rotateY(180deg);
          z-index: 1;
        }
      `}</style>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Story Copy with stagger entrance */}
          <motion.div 
            variants={textVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-6 flex flex-col items-start gap-5 text-left"
          >
            <motion.h2 
              variants={paragraphVariants}
              className="font-heading font-extrabold text-3xl sm:text-4xl text-primary tracking-tight"
            >
              {t("landing.about.title")}
            </motion.h2>
            <motion.div 
              variants={paragraphVariants}
              className="w-16 h-1 bg-[#C8510A] rounded-full" 
            />
            
            <motion.p 
              variants={paragraphVariants}
              className="text-sm sm:text-base text-muted-foreground leading-relaxed text-justify mt-2"
            >
              {t("landing.about.desc")}
            </motion.p>

            {/* Counters grid */}
            <motion.div 
              variants={paragraphVariants}
              className="grid grid-cols-3 gap-4 w-full mt-6 border-t border-border/50 pt-6"
            >
              <div className="flex flex-col gap-1">
                <Counter value={5} suffix="+" />
                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("landing.about.yearsExp")}</span>
              </div>
              <div className="flex flex-col gap-1">
                <Counter value={50} suffix="+" />
                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("landing.about.stores")}</span>
              </div>
              <div className="flex flex-col gap-1">
                <Counter value={100} suffix="K+" /> {/* Representing 1 million dynamically as 1000K+ or similar, value=100 for 100K+ registered members or 1M+ cups */}
                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("landing.about.customers")}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side: Media Container (Visual content) & 3D Cards */}
          <div className="lg:col-span-6 flex flex-col gap-6 w-full">
            
            {/* Visual Brand Image Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full h-48 sm:h-60 rounded-2xl overflow-hidden relative shadow-md shrink-0 border border-border"
            >
              <img 
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=800" 
                alt="Lowlands Brand Story" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                <div className="flex items-center gap-2.5 text-white">
                  <Award className="h-5 w-5 text-accent animate-pulse" />
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest font-outfit">{t("landing.about.heritage")}</span>
                </div>
              </div>
            </motion.div>

            {/* 3D Flip cards container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: 100% Robusta & Arabica */}
              <div className="flip-card">
                <div className="flip-card-inner">
                  {/* Front */}
                  <div className="flip-card-front shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-1">
                      <Coffee className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-black text-primary uppercase tracking-wide">{t("landing.about.card1.title")}</h4>
                    <p className="text-[11px] text-muted-foreground leading-normal text-left">
                      {t("landing.about.card1.desc")}
                    </p>
                  </div>
                  {/* Back */}
                  <div className="flip-card-back">
                    <h4 className="text-xs font-black text-accent uppercase tracking-wider">{t("landing.about.card1.backTitle")}</h4>
                    <p className="text-[10px] leading-relaxed opacity-90 text-justify">
                      {t("landing.about.card1.backDesc")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Pha Phin Truyền Thống */}
              <div className="flip-card">
                <div className="flip-card-inner">
                  {/* Front */}
                  <div className="flip-card-front shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground mb-1">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-black text-primary uppercase tracking-wide">{t("landing.about.card2.title")}</h4>
                    <p className="text-[11px] text-muted-foreground leading-normal text-left">
                      {t("landing.about.card2.desc")}
                    </p>
                  </div>
                  {/* Back */}
                  <div className="flip-card-back">
                    <h4 className="text-xs font-black text-accent uppercase tracking-wider">{t("landing.about.card2.backTitle")}</h4>
                    <p className="text-[10px] leading-relaxed opacity-90 text-justify">
                      {t("landing.about.card2.backDesc")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Không Gian Kết Nối (Full-width style on mobile) */}
              <div className="flip-card sm:col-span-2">
                <div className="flip-card-inner">
                  {/* Front */}
                  <div className="flip-card-front shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-black text-primary uppercase tracking-wide">{t("landing.about.card3.title")}</h4>
                    <p className="text-[11px] text-muted-foreground leading-normal text-left">
                      {t("landing.about.card3.desc")}
                    </p>
                  </div>
                  {/* Back */}
                  <div className="flip-card-back">
                    <h4 className="text-xs font-black text-accent uppercase tracking-wider">{t("landing.about.card3.backTitle")}</h4>
                    <p className="text-[10px] leading-relaxed opacity-90 text-justify">
                      {t("landing.about.card3.backDesc")}
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
