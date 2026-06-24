import { getMessages } from "next-intl/server";
import { Hero } from "@/components/features/home/Hero";
import { AboutBrand } from "@/components/features/home/AboutBrand";
import { StoreLocator } from "@/components/features/home/StoreLocator";


export async function generateMetadata() {
  const messages = (await getMessages()) as unknown as {
    seo?: { homeTitle?: string; homeDesc?: string };
  };
  const tSeo = messages.seo;

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

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      <h1 className="sr-only">Lowlands Coffee - Modern Vietnamese Coffee Shop</h1>
      <Hero />
      <AboutBrand />
      <StoreLocator />
    </div>
  );
}
