import { Hero } from "@/components/sections/hero";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Sustainability } from "@/components/sections/sustainability";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <FeaturedProducts />
        <HowItWorks />
        <Sustainability />
      </main>
      <Footer />
    </div>
  );
}
