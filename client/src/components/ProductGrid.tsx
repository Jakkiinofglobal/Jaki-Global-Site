import { useQuery } from "@tanstack/react-query";
import { PrintifyProduct } from "@shared/schema";
import { ProductCard } from "./ProductCard";
import { ProductDetailModal } from "./ProductDetailModal";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

export function ProductGrid() {
  const { data: products, isLoading } = useQuery<PrintifyProduct[]>({
    queryKey: ["/api/products"],
  });

  const [selectedProduct, setSelectedProduct] = useState<PrintifyProduct | null>(null);
  const { addItem } = useCart();

  const handleAddToCart = (productId: string, variantId: number) => {
    if (!selectedProduct) return;
    
    const variant = selectedProduct.variants.find(v => v.id === variantId);
    if (!variant) return;

    addItem({
      productId,
      variantId,
      productTitle: selectedProduct.title,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      image: selectedProduct.images[0] || 'https://via.placeholder.com/100x100?text=No+Image',
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-muted rounded-t-lg" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products available at this time.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetails={setSelectedProduct}
          />
        ))}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
