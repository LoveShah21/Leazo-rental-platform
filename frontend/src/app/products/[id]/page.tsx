import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { fetchProductById } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface Props {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: Props) {
  const { product } = await fetchProductById(params.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="aspect-[4/3] bg-muted rounded-xl overflow-hidden" />
            <div className="mt-4 grid grid-cols-5 gap-2">
              {product.images?.slice(0, 5).map((img, i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {product.shortDescription && (
              <p className="text-muted-foreground">{product.shortDescription}</p>
            )}
            <div className="text-2xl font-semibold">
              {formatCurrency(product.pricing?.basePrice?.daily || 0)}
              <span className="text-base text-muted-foreground ml-2">/ day</span>
            </div>
            {product.pricing?.deposit?.amount ? (
              <div className="text-sm text-muted-foreground">
                Deposit: {formatCurrency(product.pricing?.deposit?.amount)}
              </div>
            ) : null}
            <div className="prose dark:prose-invert max-w-none">
              <p>{product.description}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
