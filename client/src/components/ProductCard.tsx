import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrintifyProduct } from "@shared/schema";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: PrintifyProduct;
  onViewDetails: (product: PrintifyProduct) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const minPrice = Math.min(...product.variants.filter(v => v.is_enabled).map(v => v.price)) / 100;
  const mainImage = product.images[0] || 'https://via.placeholder.com/400x400?text=No+Image';

  return (
    <Card 
      className="overflow-hidden hover-elevate transition-all group cursor-pointer h-full flex flex-col"
      onClick={() => onViewDetails(product)}
      data-testid={`product-card-${product.id}`}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        {product.variants.filter(v => v.is_enabled).length > 1 && (
          <p className="text-xs text-muted-foreground">
            {product.variants.filter(v => v.is_enabled).length} variants available
          </p>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 pt-0">
        <div className="text-2xl font-bold">${minPrice.toFixed(2)}</div>
        <Button size="sm" className="gap-2" data-testid={`button-view-${product.id}`}>
          <ShoppingCart className="w-4 h-4" />
          View
        </Button>
      </CardFooter>
    </Card>
  );
}
