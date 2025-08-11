import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HowItWorks } from "@/components/sections/how-it-works";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              How Leazo Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Renting premium items has never been easier. Our platform connects
              you with high-quality products while promoting sustainability and
              reducing waste.
            </p>
          </div>
        </div>
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
