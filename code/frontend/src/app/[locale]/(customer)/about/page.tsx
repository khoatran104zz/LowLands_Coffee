"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Shield, Sparkles, Heart, Users, ArrowRight } from "lucide-react";

interface TimelineEvent {
  year: string;
  title: string;
  desc: string;
}

interface ValueCard {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface Founder {
  name: string;
  role: string;
  img: string;
}

export default function AboutPage() {
  const timeline: TimelineEvent[] = [
    { year: "2021", title: "Khởi Nguồn Ý Tưởng", desc: "Lowlands Coffee được nhen nhóm từ tình yêu hạt cà phê phin mộc mạc và mong muốn mang hương vị bazan Tây Nguyên xuống phố thị." },
    { year: "2022", title: "Cửa Hàng Đầu Tiên", desc: "Khai trương chi nhánh đầu tiên tại Hồ Con Rùa, Quận 3, TP.HCM - mở ra không gian kết nối ấm cúng cho giới trẻ." },
    { year: "2024", title: "Hành Trình Mở Rộng", desc: "Chạm mốc 30 cửa hàng tại TP.HCM, Hà Nội và Đà Nẵng, đồng thời xây dựng chuỗi cung ứng khép kín trực tiếp từ nông hộ." },
    { year: "2026", title: "Chuyển Đổi Hiện Đại", desc: "Ra mắt hệ thống App đặt hàng tiện lợi cùng mô hình POS tại quầy thông minh, nâng tầm trải nghiệm của khách hàng." }
  ];

  const values: ValueCard[] = [
    { 
      icon: <Shield className="h-6 w-6 text-[#C8510A]" />, 
      title: "Chất Lượng Nguyên Bản", 
      desc: "Cam kết sử dụng hạt Robusta và Arabica chín đỏ, được rang xay mộc mạc không pha tạp." 
    },
    { 
      icon: <Sparkles className="h-6 w-6 text-[#C8510A]" />, 
      title: "Trải Nghiệm Hiện Đại", 
      desc: "Ứng dụng công nghệ để khách hàng đặt món và thanh toán nhanh chóng nhưng vẫn trọn vẹn văn hoá phin." 
    },
    { 
      icon: <Heart className="h-6 w-6 text-[#C8510A]" />, 
      title: "Trách Nhiệm Nông Hộ", 
      desc: "Thu mua trực tiếp với giá cao hơn thị trường để cải thiện đời sống cho nông dân các vùng đất đỏ." 
    },
    { 
      icon: <Users className="h-6 w-6 text-[#C8510A]" />, 
      title: "Kết Nối Cộng Đồng", 
      desc: "Mỗi cửa hàng là một không gian tụ hội gần gũi, nơi chia sẻ niềm vui và năng lượng tích cực mỗi ngày." 
    }
  ];

  const founders: Founder[] = [
    { name: "Trần Thanh Sơn", role: "CEO & Founder", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300" },
    { name: "Lê Minh Hằng", role: "Co-Founder & Head of R&D", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300" },
    { name: "Phạm Hoàng Nam", role: "Chief Operations Officer", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300" }
  ];

  return (
    <div className="flex flex-col w-full bg-[#FAF8F5] dark:bg-[#120A09] text-foreground">
      
      {/* 1. HERO PARALLAX */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden bg-[#2D1A19]">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200" 
          alt="About Lowlands Background" 
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none scale-105"
        />
        
        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-20 text-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight uppercase"
          >
            Về Lowlands Coffee
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-1 bg-accent rounded-full mx-auto mt-4" 
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xs sm:text-sm md:text-base font-semibold mt-4 max-w-xl mx-auto tracking-wide"
          >
            Nơi kết nối văn hoá cà phê phin mộc mạc và nhịp sống đô thị hiện đại.
          </motion.p>
        </div>
      </section>

      {/* 2. TIMELINE SECTION */}
      <section className="py-20 bg-[#FAF8F5] dark:bg-[#120A09]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading font-extrabold text-3xl text-primary uppercase tracking-tight">Hành Trình Thương Hiệu</h2>
            <div className="w-12 h-0.5 bg-accent mx-auto mt-3 rounded-full" />
          </div>

          <div className="relative border-l border-[#C5A880]/30 md:border-l-0 md:before:absolute md:before:left-1/2 md:before:top-0 md:before:bottom-0 md:before:w-0.5 md:before:bg-[#C5A880]/30 space-y-12">
            {timeline.map((event, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={event.year} className="relative flex flex-col md:flex-row items-start md:items-center">
                  
                  {/* Timeline point */}
                  <div className="absolute left-[-6px] md:left-1/2 md:-translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#C8510A] border-[3px] border-white shadow-xs z-10"></div>
                  
                  {/* Left or Right container */}
                  <div className={`w-full md:w-1/2 pl-6 md:pl-0 flex ${isEven ? "md:justify-end md:pr-10" : "md:justify-start md:pl-10 md:order-2"}`}>
                    <motion.div 
                      initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.55 }}
                      className="bg-card border border-border/80 p-6 rounded-2xl shadow-xs text-left max-w-md"
                    >
                      <span className="font-outfit font-black text-2xl text-[#C8510A]">{event.year}</span>
                      <h3 className="font-heading font-bold text-base text-foreground mt-1.5 leading-tight">{event.title}</h3>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed text-justify">{event.desc}</p>
                    </motion.div>
                  </div>

                  {/* Spacer for other side on desktop */}
                  <div className="hidden md:block w-1/2"></div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. CORE VALUES SECTION WITH COPPER GLOW */}
      <section className="py-20 bg-secondary/20 relative">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading font-extrabold text-3xl text-primary uppercase tracking-tight">Giá Trị Cốt Lõi</h2>
            <div className="w-12 h-0.5 bg-accent mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val) => (
              <motion.div
                key={val.title}
                whileHover={{ y: -5 }}
                className="bg-card border border-border/85 rounded-2xl p-6 shadow-xs flex flex-col text-left transition-all duration-300 relative overflow-hidden group hover:border-[#C5A880]/50"
              >
                {/* Copper glow overlay */}
                <div className="absolute inset-0 bg-radial-gradient(circle_at_50%_0%,rgba(197,168,128,0.06),transparent_60%) opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="h-12 w-12 rounded-xl bg-[#FAF8F5] dark:bg-[#201514] flex items-center justify-center border border-border/40 shrink-0">
                  {val.icon}
                </div>
                
                <h3 className="font-heading font-bold text-base text-foreground mt-4 leading-tight group-hover:text-[#C8510A] transition-colors">{val.title}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. FOUNDERS SECTION */}
      <section className="py-20 bg-[#FAF8F5] dark:bg-[#120A09]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading font-extrabold text-3xl text-primary uppercase tracking-tight">Đội Ngũ Sáng Lập</h2>
            <div className="w-12 h-0.5 bg-accent mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {founders.map((founder, idx) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md text-center transition-all duration-300"
              >
                <div className="w-full aspect-[4/5] bg-muted relative overflow-hidden">
                  <img 
                    src={founder.img} 
                    alt={founder.name} 
                    className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="p-5 text-left">
                  <h3 className="font-heading font-bold text-base text-foreground leading-tight">{founder.name}</h3>
                  <p className="text-xs text-[#C8510A] font-bold mt-1 font-outfit uppercase tracking-wider">{founder.role}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. bottom CTA recruitment */}
      <section className="py-16 text-white border-t border-border/20 text-center" style={{ background: "linear-gradient(135deg, #2D1A19 0%, #1A0D0C 100%)" }}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4">
          <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight">Gia nhập đội ngũ Lowlands</h2>
          <p className="text-xs sm:text-sm opacity-80 max-w-xl leading-relaxed">
            Chúng tôi luôn tìm kiếm những con người nhiệt huyết, đam mê cà phê và có tinh thần gắn kết để cùng nhau lan tỏa di sản hương vị Việt.
          </p>
          <div className="pt-2">
            <Link href="/careers">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-1.5 bg-[#C8510A] hover:bg-[#B04308] text-white font-extrabold text-xs px-5 py-3 rounded-full shadow-md cursor-pointer transition-all uppercase tracking-wider"
              >
                <span>Xem cơ hội việc làm</span>
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
