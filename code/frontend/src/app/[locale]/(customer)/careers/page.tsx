"use client";

import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, MapPin, Clock, Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: number;
  title: string;
  location: "Hà Nội" | "TP.HCM" | "Đà Nẵng";
  type: "Full-time" | "Part-time" | "Intern";
  salary: string;
}

export default function CareersPage() {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState<string>("All");
  const [filterLoc, setFilterLoc] = useState<string>("All");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    resume: null as File | null
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const jobs: Job[] = [
    { id: 1, title: t("landing.careersPage.jobs.j1"), location: "TP.HCM", type: "Full-time", salary: `12 - 15 ${t("landing.careersPage.jobs.million")}` },
    { id: 2, title: t("landing.careersPage.jobs.j2"), location: "Hà Nội", type: "Full-time", salary: `7 - 9 ${t("landing.careersPage.jobs.million")}` },
    { id: 3, title: t("landing.careersPage.jobs.j3"), location: "Đà Nẵng", type: "Part-time", salary: t("landing.careersPage.jobs.hourly") },
    { id: 4, title: t("landing.careersPage.jobs.j4"), location: "TP.HCM", type: "Intern", salary: t("landing.careersPage.jobs.negotiable") },
    { id: 5, title: t("landing.careersPage.jobs.j5"), location: "TP.HCM", type: "Full-time", salary: `8 - 10 ${t("landing.careersPage.jobs.million")}` },
    { id: 6, title: t("landing.careersPage.jobs.j6"), location: "Hà Nội", type: "Part-time", salary: t("landing.careersPage.jobs.hourly") },
    { id: 7, title: t("landing.careersPage.jobs.j7"), location: "Đà Nẵng", type: "Full-time", salary: `6.5 - 8 ${t("landing.careersPage.jobs.million")}` }
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchType = filterType === "All" || job.type === filterType;
    const matchLoc = filterLoc === "All" || job.location === filterLoc;
    return matchType && matchLoc;
  });

  const handleApplyClick = (jobTitle: string) => {
    setFormData((prev) => ({ ...prev, position: jobTitle }));
    const formElement = document.getElementById("apply-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.position) {
      toast.error(t("landing.careersPage.validationError"));
      return;
    }
    // Simulate submission
    setIsSubmitted(true);
    toast.success(t("landing.careersPage.successToast"));
  };

  const handleResetForm = () => {
    setFormData({ name: "", email: "", position: "", resume: null });
    setIsSubmitted(false);
  };

  return (
    <div className="flex flex-col w-full bg-[#FAF8F5] dark:bg-[#120A09] text-foreground">
      
      {/* 1. HERO SECTION */}
      <section className="relative py-24 bg-[#2D1A19] text-white overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-black/45 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" 
          alt="Careers at Lowlands" 
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />
        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-20 text-left max-w-3xl">
          <motion.span 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block text-xs font-black uppercase tracking-widest text-accent bg-accent/15 px-4 py-1.5 rounded-full border border-accent/20 backdrop-blur-xs mb-4"
          >
            {t("landing.careersPage.badge")}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="font-heading font-black text-4xl sm:text-5xl uppercase tracking-tight leading-tight"
          >
            {t("landing.careersPage.heroTitle").split("\n").map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx < t("landing.careersPage.heroTitle").split("\n").length - 1 && <br />}
              </React.Fragment>
            ))}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-xs sm:text-sm font-semibold opacity-90 max-w-xl leading-relaxed mt-4"
          >
            {t("landing.careersPage.heroDesc")}
          </motion.p>
        </div>
      </section>

      {/* 2. FILTERS & JOB LIST */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading font-extrabold text-3xl text-primary uppercase tracking-tight">{t("landing.careersPage.sectionTitle")}</h2>
            <div className="w-12 h-0.5 bg-accent mx-auto mt-3 rounded-full" />
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10 w-full max-w-3xl mx-auto">
            {/* Type filter buttons */}
            <div className="flex bg-secondary/35 p-1 rounded-xl w-full sm:w-auto border border-border/40 overflow-x-auto scrollbar-none justify-center">
              {["All", "Full-time", "Part-time", "Intern"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-350 cursor-pointer ${
                    filterType === type ? "bg-[#C8510A] text-white shadow-xs" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {type === "All" ? t("landing.careersPage.allTypes") : type}
                </button>
              ))}
            </div>

            {/* Location filter dropdown/buttons */}
            <div className="flex bg-secondary/35 p-1 rounded-xl w-full sm:w-auto border border-border/40 overflow-x-auto scrollbar-none justify-center">
              {["All", "TP.HCM", "Hà Nội", "Đà Nẵng"].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setFilterLoc(loc)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-350 cursor-pointer ${
                    filterLoc === loc ? "bg-[#C8510A] text-white shadow-xs" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {loc === "All" ? t("landing.careersPage.allLocs") : loc}
                </button>
              ))}
            </div>
          </div>

          {/* Job List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <AnimatePresence mode="popLayout">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="bg-card border border-border/80 rounded-2xl p-5 flex flex-col justify-between text-left shadow-xs hover:border-[#C5A880]/50 hover:shadow-md transition-all duration-350"
                  >
                    <div>
                      <h3 className="font-heading font-bold text-sm sm:text-base text-foreground leading-tight">{job.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#C8510A]" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#C8510A]" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-[#C8510A]" />
                          {job.salary}
                        </span>
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-border/40 flex justify-end">
                      <button
                        onClick={() => handleApplyClick(job.title)}
                        className="bg-[#C8510A] hover:bg-[#B04308] text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-full transition-all cursor-pointer shadow-xs"
                      >
                        {t("landing.careersPage.applyNow")}
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center py-10 text-muted-foreground text-sm font-semibold">
                  {t("landing.careersPage.noJobs")}
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* 3. CULTURE SECTION (MASONRY LAYOUT) */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading font-extrabold text-3xl text-primary uppercase tracking-tight">{t("landing.careersPage.cultureTitle")}</h2>
            <div className="w-12 h-0.5 bg-accent mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Image 1 */}
            <div className="md:col-span-4 rounded-2xl overflow-hidden relative min-h-[220px] shadow-sm border border-border">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400" alt="Teamwork" className="w-full h-full object-cover" />
            </div>
            {/* Highlight copy block */}
            <div className="md:col-span-4 bg-[#2D1A19] text-white p-8 rounded-2xl flex flex-col justify-center text-left border border-[#C5A880]/20">
              <h3 className="font-heading font-extrabold text-lg text-accent uppercase leading-snug">{t("landing.careersPage.cultureSub")}</h3>
              <p className="text-xs opacity-80 leading-relaxed mt-2 text-justify">
                {t("landing.careersPage.cultureDesc")}
              </p>
            </div>
            {/* Image 2 */}
            <div className="md:col-span-4 rounded-2xl overflow-hidden relative min-h-[220px] shadow-sm border border-border">
              <img src="https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?auto=format&fit=crop&q=80&w=400" alt="Barista brewing" className="w-full h-full object-cover" />
            </div>
            {/* Image 3 */}
            <div className="md:col-span-8 rounded-2xl overflow-hidden relative min-h-[260px] shadow-sm border border-border">
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800" alt="Customer Service" className="w-full h-full object-cover" />
            </div>
            {/* Image 4 */}
            <div className="md:col-span-4 rounded-2xl overflow-hidden relative min-h-[260px] shadow-sm border border-border">
              <img src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400" alt="Roaster" className="w-full h-full object-cover" />
            </div>
          </div>

        </div>
      </section>

      {/* 4. APPLICATION FORM SECTION */}
      <section id="apply-form-section" className="py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-xl mx-auto bg-card border border-border/80 shadow-md p-6 sm:p-8 rounded-3xl text-left">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="text-center pb-2">
                  <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-primary uppercase">{t("landing.careersPage.formTitle")}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{t("landing.careersPage.formDesc")}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t("landing.careersPage.labelName")}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nguyễn Văn A"
                    required
                    className="w-full text-xs p-3 border border-border bg-white text-foreground rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C8510A] focus:border-[#C8510A] transition-all font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t("landing.careersPage.labelEmail")}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="nguyenvana@gmail.com"
                    required
                    className="w-full text-xs p-3 border border-border bg-white text-foreground rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C8510A] focus:border-[#C8510A] transition-all font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t("landing.careersPage.labelPosition")}</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder={t("landing.careersPage.jobs.negotiable").replace("Thỏa thuận", "VD: Cửa Hàng Trưởng, Barista...")}
                    required
                    className="w-full text-xs p-3 border border-border bg-white text-foreground rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C8510A] focus:border-[#C8510A] transition-all font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t("landing.careersPage.labelResume")}</label>
                  <div className="relative border-2 border-dashed border-border/80 hover:border-[#C5A880]/80 transition-colors rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      required
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="h-8 w-8 text-[#C8510A] mb-2 opacity-80" />
                    <span className="text-xs font-bold text-muted-foreground">
                      {formData.resume ? formData.resume.name : t("landing.careersPage.resumePlaceholder")}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 mt-1">{t("landing.careersPage.resumeHint")}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#C8510A] hover:bg-[#B04308] text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    {t("landing.careersPage.submitButton")}
                  </button>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-200">
                  <CheckCircle className="h-8 w-8 text-emerald-600 animate-pulse" />
                </div>
                <h3 className="font-heading font-extrabold text-xl text-emerald-800 uppercase">{t("landing.careersPage.successTitle")}</h3>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  {t("landing.careersPage.successDesc").replace("{name}", formData.name).replace("{position}", formData.position)}
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleResetForm}
                    className="bg-secondary hover:bg-secondary/80 text-foreground font-black text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl border border-border/50 transition-all cursor-pointer"
                  >
                    {t("landing.careersPage.applyOtherButton")}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
