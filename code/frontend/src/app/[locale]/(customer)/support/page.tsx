"use client";

import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, ShoppingCart, CreditCard, Truck, Users, MessageSquare, 
  ChevronDown, Phone, Mail, MessageCircle, MapPin 
} from "lucide-react";
import { toast } from "sonner";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface Category {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export default function SupportPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const categories: Category[] = [
    { icon: <ShoppingCart className="h-6 w-6 text-[#C8510A]" />, title: t("landing.supportPage.categories.c1.title"), desc: t("landing.supportPage.categories.c1.desc") },
    { icon: <CreditCard className="h-6 w-6 text-[#C8510A]" />, title: t("landing.supportPage.categories.c2.title"), desc: t("landing.supportPage.categories.c2.desc") },
    { icon: <Truck className="h-6 w-6 text-[#C8510A]" />, title: t("landing.supportPage.categories.c3.title"), desc: t("landing.supportPage.categories.c3.desc") },
    { icon: <Users className="h-6 w-6 text-[#C8510A]" />, title: t("landing.supportPage.categories.c4.title"), desc: t("landing.supportPage.categories.c4.desc") },
    { icon: <MessageSquare className="h-6 w-6 text-[#C8510A]" />, title: t("landing.supportPage.categories.c5.title"), desc: t("landing.supportPage.categories.c5.desc") }
  ];

  const faqs: FAQ[] = [
    { 
      id: 1, 
      question: t("landing.supportPage.faqs.f1.q"), 
      answer: t("landing.supportPage.faqs.f1.a") 
    },
    { 
      id: 2, 
      question: t("landing.supportPage.faqs.f2.q"), 
      answer: t("landing.supportPage.faqs.f2.a") 
    },
    { 
      id: 3, 
      question: t("landing.supportPage.faqs.f3.q"), 
      answer: t("landing.supportPage.faqs.f3.a") 
    },
    { 
      id: 4, 
      question: t("landing.supportPage.faqs.f4.q"), 
      answer: t("landing.supportPage.faqs.f4.a") 
    },
    { 
      id: 5, 
      question: t("landing.supportPage.faqs.f5.q"), 
      answer: t("landing.supportPage.faqs.f5.a") 
    }
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleLiveChatClick = () => {
    toast.success(t("landing.supportPage.toastConnecting"));
  };

  return (
    <div className="flex flex-col w-full bg-[#FAF8F5] dark:bg-[#120A09] text-foreground">
      
      {/* 1. SEARCH HEADER */}
      <section className="relative py-20 bg-[#2D1A19] text-white overflow-hidden text-center flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-radial-gradient(circle_at_50%_120%,rgba(197,168,128,0.1),transparent_60%) pointer-events-none" />
        
        <div className="container relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 z-10 space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading font-black text-3xl sm:text-4xl uppercase tracking-tight"
          >
            {t("landing.supportPage.heroTitle")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            className="text-xs sm:text-sm font-semibold max-w-lg mx-auto"
          >
            {t("landing.supportPage.heroDesc")}
          </motion.p>

          {/* Search bar inside Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative max-w-lg mx-auto w-full"
          >
            <input
              type="text"
              placeholder={t("landing.supportPage.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs p-3.5 pl-11 border border-white/20 bg-white/10 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all font-semibold"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          </motion.div>
        </div>
      </section>

      {/* 2. SUPPORT CATEGORIES GRID */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading font-extrabold text-2xl text-primary uppercase tracking-tight">{t("landing.supportPage.sectionTitle")}</h2>
            <div className="w-12 h-0.5 bg-accent mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {categories.map((cat) => (
              <motion.div
                key={cat.title}
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-card border border-border/80 rounded-2xl p-5 flex gap-4 text-left shadow-xs transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center border border-border/40 shrink-0">
                  {cat.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-sm sm:text-base text-foreground leading-tight">{cat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed text-justify">{cat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. FAQ ACCORDION */}
      <section className="py-16 bg-secondary/25">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading font-extrabold text-2xl text-primary uppercase tracking-tight">{t("landing.supportPage.faqTitle")}</h2>
            <div className="w-12 h-0.5 bg-accent mx-auto mt-3 rounded-full" />
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div 
                    key={faq.id} 
                    className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs text-left transition-colors duration-200"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-6 py-4 flex items-center justify-between font-heading font-bold text-sm text-foreground hover:text-[#C8510A] transition-colors gap-4 cursor-pointer"
                    >
                      <span className="leading-tight text-left">{faq.question}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="shrink-0"
                      >
                        <ChevronDown className="h-4 w-4 opacity-70" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40 text-justify">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm font-semibold">
                {t("landing.supportPage.noFaq")}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 4. CONTACT INFRASTRUCTURE */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading font-extrabold text-2xl text-primary uppercase tracking-tight">{t("landing.supportPage.directContactTitle")}</h2>
            <div className="w-12 h-0.5 bg-accent mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Hotline card */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 text-center shadow-xs flex flex-col items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#FAF8F5] border border-border/40 flex items-center justify-center text-[#C8510A]">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider leading-none">{t("landing.supportPage.hotlineTitle")}</h3>
              <p className="text-base font-black text-[#C8510A] mt-1">1900 xxxx</p>
              <span className="text-[10px] text-muted-foreground leading-none">{t("landing.supportPage.hotlineHours")}</span>
            </div>

            {/* Email card */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 text-center shadow-xs flex flex-col items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#FAF8F5] border border-border/40 flex items-center justify-center text-[#C8510A]">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider leading-none">{t("landing.supportPage.emailTitle")}</h3>
              <p className="text-sm font-extrabold text-primary truncate max-w-full mt-1">contact@lowlands.com</p>
              <span className="text-[10px] text-muted-foreground leading-none">{t("landing.supportPage.emailReplyTime")}</span>
            </div>

            {/* Live Chat card */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 text-center shadow-xs flex flex-col items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#FAF8F5] border border-border/40 flex items-center justify-center text-[#C8510A]">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider leading-none">{t("landing.supportPage.liveChatTitle")}</h3>
              <button
                onClick={handleLiveChatClick}
                className="mt-1 bg-[#C8510A] hover:bg-[#B04308] text-white text-[10px] font-black uppercase tracking-wider px-4.5 py-2.5 rounded-full transition-all cursor-pointer shadow-xs"
              >
                {t("landing.supportPage.liveChatButton")}
              </button>
              <span className="text-[10px] text-muted-foreground leading-none">{t("landing.supportPage.liveChatDesc")}</span>
            </div>
          </div>

        </div>
      </section>

      {/* 5. MAP SECTION */}
      <section className="py-16 bg-secondary/15 border-t border-border/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading font-extrabold text-2xl text-primary uppercase tracking-tight">{t("landing.supportPage.storesTitle")}</h2>
            <div className="w-12 h-0.5 bg-accent mx-auto mt-3 rounded-full" />
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden border border-border/80 bg-card shadow-md flex flex-col md:flex-row items-stretch">
            {/* Map metadata on the left */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-start text-left gap-4 shrink-0 bg-[#FAF8F5] dark:bg-[#1C1211]">
              <h3 className="font-heading font-black text-sm text-primary uppercase tracking-wider">{t("landing.supportPage.featuredStores")}</h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#C8510A] shrink-0" />
                    Lowlands Hồ Con Rùa
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-5 leading-normal">
                    Hồ Con Rùa, Q.3, TP. Hồ Chí Minh <br />
                    {t("landing.supportPage.openTime")}: 7:00 - 22:30
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#C8510A] shrink-0" />
                    Lowlands Nhà Thờ Lớn
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-5 leading-normal">
                    Nhà Thờ Lớn, Q. Hoàn Kiếm, Hà Nội <br />
                    {t("landing.supportPage.openTime")}: 7:00 - 23:00
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#C8510A] shrink-0" />
                    Lowlands Bạch Đằng
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-5 leading-normal">
                    Bạch Đằng, Q. Hải Châu, Đà Nẵng <br />
                    {t("landing.supportPage.openTime")}: 6:30 - 22:00
                  </p>
                </div>
              </div>
            </div>

            {/* Map Canvas Mock (using dynamic styling & beautiful graphics or simulated map layout) */}
            <div className="flex-grow min-h-[300px] relative bg-neutral-200 overflow-hidden flex items-center justify-center text-muted-foreground">
              {/* Simulated Map layout illustration */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.460232422312!2d106.69438907604313!3d10.776019489373243!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m3!1d3000!2d106.6963!3d10.778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full grayscale opacity-80"
              />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
