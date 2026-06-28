"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
  ctaText: string;
  link: string;
  bgClass: string;
  style?: React.CSSProperties;
}

export function PromoBannerCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const banners: Banner[] = [
    {
      id: 1,
      title: "HAPPY HOUR 14:00 – 17:00",
      subtitle: "GIẢM 20% TOÀN BỘ ĐỒ UỐNG",
      desc: "Nạp năng lượng buổi chiều cùng hương vị đậm đà nguyên bản của phin cà phê và trà thanh mát tại Lowlands.",
      ctaText: "Đặt ngay",
      link: "/menu",
      bgClass: "bg-[#2D1A19] text-white border-y border-[#C5A880]/20",
      style: {
        background: "radial-gradient(circle at 80% 50%, rgba(197, 168, 128, 0.15), transparent 60%), #2A1815"
      }
    },
    {
      id: 2,
      title: "COMBO BUỔI SÁNG",
      subtitle: "PHIN SỮA ĐÁ + BÁNH MÌ CHỈ 49.000Đ",
      desc: "Bữa sáng trọn vẹn kiểu Việt: bánh mì giòn tan kết hợp cùng ly Phin Sữa Đá truyền thống thơm ngon đậm đà.",
      ctaText: "Xem combo",
      link: "/menu?search=Combo",
      bgClass: "bg-[#F7F3E9] text-[#2D1A19] border-y border-border/40",
      style: {
        background: "radial-gradient(circle at 10% 50%, rgba(200, 81, 10, 0.05), transparent 50%), #F7F3E9"
      }
    },
    {
      id: 3,
      title: "ƯU ĐÃI THÀNH VIÊN MỚI",
      subtitle: "TÍCH ĐIỂM X2 CHO LẦN ORDER ĐẦU TIÊN",
      desc: "Trở thành hội viên Lowlands Club hôm nay để hưởng hàng ngàn ưu đãi đặc quyền, freeship và tích lũy điểm thưởng.",
      ctaText: "Đăng ký ngay",
      link: "/register",
      bgClass: "text-white border-y border-[#C5A880]/30",
      style: {
        background: "linear-gradient(135deg, #2D1A19 0%, #4A2C2A 40%, #AA7C11 100%)"
      }
    }
  ];

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      handleNext();
    }, 4000);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index]);

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Drag handlers for mobile swipe
  const dragThreshold = 50;
  const onDragEnd = (event: any, info: any) => {
    const offset = info.offset.x;
    if (offset < -dragThreshold) {
      handleNext();
    } else if (offset > dragThreshold) {
      handlePrev();
    }
  };

  // Variants for slide+fade transitions
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 }
      }
    })
  };

  return (
    <section className="py-10 bg-background relative overflow-hidden select-none">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        
        {/* Navigation Arrow buttons */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 hidden md:block">
          <button 
            onClick={handlePrev}
            className="p-2.5 rounded-full bg-white/85 dark:bg-black/50 text-[#2D1A19] dark:text-white border border-border shadow-xs hover:bg-[#C8510A] hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden md:block">
          <button 
            onClick={handleNext}
            className="p-2.5 rounded-full bg-white/85 dark:bg-black/50 text-[#2D1A19] dark:text-white border border-border shadow-xs hover:bg-[#C8510A] hover:text-white transition-all cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Carousel Window */}
        <div className="h-[270px] sm:h-[220px] rounded-3xl overflow-hidden shadow-md relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={onDragEnd}
              style={banners[index].style}
              className={`absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-16 text-left h-full ${banners[index].bgClass} cursor-grab active:cursor-grabbing`}
            >
              <div className="max-w-3xl flex flex-col gap-2">
                <motion.span 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="text-[10px] sm:text-xs font-black tracking-widest text-[#C8510A] dark:text-accent uppercase"
                >
                  {banners[index].title}
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="font-heading font-black text-lg sm:text-xl md:text-2xl tracking-tight leading-tight uppercase"
                >
                  {banners[index].subtitle}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-xs sm:text-sm opacity-80 leading-relaxed font-semibold max-w-2xl"
                >
                  {banners[index].desc}
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="pt-2"
                >
                  <Link href={banners[index].link}>
                    <motion.div
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center gap-1.5 bg-[#C8510A] text-white hover:bg-[#B04308] text-xs font-extrabold px-4.5 py-2.5 rounded-full shadow-md transition-all cursor-pointer uppercase tracking-wider"
                    >
                      <span>{banners[index].ctaText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center space-x-2.5 mt-5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > index ? 1 : -1);
                setIndex(idx);
              }}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-350 cursor-pointer ${
                idx === index ? "bg-[#C8510A] w-6" : "bg-muted hover:bg-muted-foreground/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
