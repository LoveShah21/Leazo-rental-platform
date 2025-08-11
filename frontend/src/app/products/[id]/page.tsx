import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { fetchProductById } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingForm } from "@/components/booking/booking-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Package,
  MapPin,
  Calendar,
  CheckCircle,
  Shield,
  Tag,
  Info,
  User,
  Star
} from "lucide-react";

interface Props {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: Props) {
  const { product } = await fetchProductById(params.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Back Navigation */}
          <div className="flex items-center gap-4">
            <Link href="/product-grid">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              {product.subcategory && (
                <Badge variant="outline">{product.subcategory}</Badge>
              )}
              {product.specifications?.condition && (
                <Badge variant="outline">{product.specifications.condition}</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Images Section */}
            <div className="lg:col-span-2">
              <div className="aspect-[4/3] bg-muted rounded-xl overflow-hidden mb-4 border">
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.slice(0, 5).map((img, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-muted rounded overflow-hidden border cursor-pointer hover:border-primary transition-colors"
                    >
                      <img
                        src={img.url}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Product Details */}
              <div className="mt-8 space-y-6">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-base leading-relaxed">{product.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Specifications */}
                {product.specifications && Object.keys(product.specifications).some(key => 
                  product.specifications && 
                  key in product.specifications && 
                  product.specifications[key as keyof typeof product.specifications] && 
                  key !== 'customFields'
                ) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Specifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.specifications.brand && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Brand</span>
                            <span className="font-medium">{product.specifications.brand}</span>
                          </div>
                        )}
                        {product.specifications.model && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Model</span>
                            <span className="font-medium">{product.specifications.model}</span>
                          </div>
                        )}
                        {product.specifications.color && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Color</span>
                            <span className="font-medium">{product.specifications.color}</span>
                          </div>
                        )}
                        {product.specifications.weight && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Weight</span>
                            <span className="font-medium">{product.specifications.weight}</span>
                          </div>
                        )}
                        {product.specifications.dimensions && (
                          <div className="flex justify-between col-span-2">
                            <span className="text-muted-foreground">Dimensions</span>
                            <span className="font-medium">
                              {product.specifications.dimensions.length} × {product.specifications.dimensions.width} × {product.specifications.dimensions.height} {product.specifications.dimensions.unit}
                            </span>
                          </div>
                        )}
                        {product.specifications.condition && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Condition</span>
                            <Badge variant="secondary" className="ml-auto">{product.specifications.condition}</Badge>
                          </div>
                        )}
                        {product.specifications.yearOfManufacture && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Year</span>
                            <span className="font-medium">{product.specifications.yearOfManufacture}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="space-y-6">
              {/* Basic Info */}
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>
                    
                    {product.shortDescription && (
                      <p className="text-muted-foreground">{product.shortDescription}</p>
                    )}
                    
                    {/* Rating */}
                    {product.rating && product.rating?.average && product.rating.average > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 font-medium">{product.rating?.average?.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({product.rating.count} reviews)
                        </span>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(product.pricing?.basePrice?.daily || product.pricing?.daily || 0)}
                        <span className="text-lg text-muted-foreground ml-2">/ day</span>
                      </div>
                      
                      {(product.pricing?.basePrice?.weekly || product.pricing?.weekly) && (
                        <div className="text-lg">
                          {formatCurrency(product.pricing?.basePrice?.weekly || product.pricing?.weekly || 0)}
                          <span className="text-sm text-muted-foreground ml-2">/ week</span>
                        </div>
                      )}
                      
                      {(product.pricing?.basePrice?.monthly || product.pricing?.monthly) && (
                        <div className="text-lg">
                          {formatCurrency(product.pricing?.basePrice?.monthly || product.pricing?.monthly || 0)}
                          <span className="text-sm text-muted-foreground ml-2">/ month</span>
                        </div>
                      )}

                      {product.pricing?.deposit?.required && (
                        <div className="flex items-center gap-2 text-sm border-t pt-3">
                          <Shield className="h-4 w-4 text-orange-500" />
                          <span>Security Deposit: {formatCurrency(product.pricing.deposit.amount || 0)}</span>
                        </div>
                      )}
                    </div>

                    {/* Availability & Terms */}
                    <div className="space-y-3 text-sm border-t pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{product.inventory?.[0]?.quantity || 0} available</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>Min {product.rentalTerms?.minRentalDays || 1} days rental</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {product.rentalTerms?.requiresApproval ? (
                          <>
                            <Info className="h-4 w-4 text-yellow-500" />
                            <span>Requires approval</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Instant booking</span>
                          </>
                        )}
                      </div>
                      
                      {product.inventory?.[0]?.locationId && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>Location available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Form */}
              <BookingForm product={product} />

              {/* Provider Info */}
              {product.owner && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Provider
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">
                        {product.owner.firstName} {product.owner.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{product.owner.email}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
