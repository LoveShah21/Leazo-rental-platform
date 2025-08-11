import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sustainability } from "@/components/sections/sustainability";

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Sustainability />
      </main>
      <Footer />
    </div>
  );
}
