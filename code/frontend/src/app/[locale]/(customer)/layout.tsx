import { Header } from "@/components/features/layout/Header";
import { Footer } from "@/components/features/layout/Footer";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
