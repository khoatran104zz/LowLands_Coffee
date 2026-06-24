import { useTranslations } from "next-intl";
import { Coffee, MapPin, Sparkles } from "lucide-react";

export function AboutBrand() {
  const t = useTranslations("home");

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Story Copy */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary tracking-tight">
              {t("aboutTitle")}
            </h2>
            <div className="w-16 h-1 bg-accent rounded-full" />
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-justify">
              {t("aboutDesc")}
            </p>
          </div>

          {/* Right Side: Visual highlights card grid */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Coffee className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-primary uppercase tracking-wide">100% Robusta &amp; Arabica</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hạt cà phê được thu hoạch thủ công tại những nông hộ nhỏ của vùng đất đỏ bazan Lâm Đồng, Gia Lai.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-primary uppercase tracking-wide">Pha Phin Truyền Thống</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Từng tách cà phê được chắt lọc qua phin nhôm truyền thống, giữ trọn hương vị đậm đặc, quyến rũ.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-shadow sm:col-span-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-primary uppercase tracking-wide">Không Gian Kết Nối</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Thiết kế không gian cửa hàng lấy cảm hứng từ sự mộc mạc của thiên nhiên và văn hóa cộng đồng gắn kết của người Việt.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
