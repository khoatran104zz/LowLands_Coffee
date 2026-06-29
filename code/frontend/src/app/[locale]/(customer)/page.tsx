import { getMessages, getTranslations } from "next-intl/server";
import { Hero } from "@/components/features/home/Hero";
import { PromoBannerCarousel } from "@/components/features/home/PromoBannerCarousel";
import { FeaturedProducts } from "@/components/features/home/FeaturedProducts";
import { AboutBrand } from "@/components/features/home/AboutBrand";
import { AppDownloadBanner } from "@/components/features/home/AppDownloadBanner";
import { StoreLocator } from "@/components/features/home/StoreLocator";


export async function generateMetadata() {
  const messages = (await getMessages()) as any;
  const tSeo = messages.common?.seo;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: tSeo?.homeTitle || "Lowlands Coffee",
    description: tSeo?.homeDesc || "",
    openGraph: {
      title: tSeo?.homeTitle || "Lowlands Coffee",
      description: tSeo?.homeDesc || "",
      images: [
        {
          url: "/logo/logo.svg",
          width: 800,
          height: 600,
          alt: "Lowlands Coffee Logo",
        },
      ],
    },
  };
}

export default async function HomePage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col w-full">
      <h1 className="sr-only">{t("common.brandName")} - {t("common.seo.homeTitle")}</h1>
      <Hero />
      <PromoBannerCarousel />
      <FeaturedProducts />
      <AboutBrand />
      <AppDownloadBanner />
      <StoreLocator />
    </div>
  );
}
