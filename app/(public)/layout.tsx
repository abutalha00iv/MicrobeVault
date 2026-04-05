import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main id="main-content" className="relative z-10">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}

