import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HowItWorks } from "@/components/sections/how-it-works";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
