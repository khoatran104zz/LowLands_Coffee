import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmProvider } from "@/providers/ConfirmProvider";
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export async function generateStaticParams() {
  return [{ locale: "vi" }, { locale: "en" }];
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  // Retrieve messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
          <Toaster position="top-right" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
