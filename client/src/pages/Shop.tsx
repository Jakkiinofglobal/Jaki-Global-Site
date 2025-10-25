import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PrintifyProduct } from "@shared/schema";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { CartDrawer } from "@/components/CartDrawer";
import { JakiFooter } from "@/components/JakiFooter";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";

export default function Shop() {
  const [, navigate] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<PrintifyProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items, addItem, removeItem, itemCount } = useCart();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<PrintifyProduct[]>({
    queryKey: ['/api/products'],
  });

  const handleAddToCart = (productId: string, variantId: number) => {
    const product = products?.find(p => p.id === productId);
    if (!product) return;

    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) return;

    addItem({
      productId,
      productTitle: product.title,
      variantId,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      image: product.images[0] || 'https://via.placeholder.com/100',
    });

    toast({
      title: "Added to cart!",
      description: `${product.title} has been added to your cart`,
    });
  };

  const handleRemoveFromCart = (productId: string, variantId: number) => {
    removeItem(productId, variantId);
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="gap-2" data-testid="button-back-to-builder">
                <ArrowLeft className="w-4 h-4" />
                Builder
              </Button>
            </Link>
            <h1 className="text-3xl font-brand font-bold" data-testid="text-shop-title">Jaki Global</h1>
          </div>
          <Button
            variant="outline"
            className="gap-2 relative"
            onClick={() => setIsCartOpen(true)}
            data-testid="button-open-cart"
          >
            <ShoppingCart className="w-5 h-5" />
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {itemCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-3">Our Products</h2>
          <p className="text-lg text-muted-foreground">
            Discover our collection of high-quality products
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products available</h3>
            <p className="text-muted-foreground">
              Products from your Printify store will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <JakiFooter />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
