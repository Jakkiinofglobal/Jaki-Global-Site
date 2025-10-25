import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrintifyProduct, PrintifyVariant } from "@shared/schema";
import { ShoppingCart, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailModalProps {
  product: PrintifyProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: string, variantId: number) => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const { toast } = useToast();

  if (!product) return null;

  const enabledVariants = product.variants.filter(v => v.is_enabled);
  const selectedVariant = enabledVariants.find(v => v.id === selectedVariantId);
  
  // Get unique option types (e.g., "color", "size")
  const optionTypes = enabledVariants.length > 0 
    ? Object.keys(enabledVariants[0].options || {})
    : [];

  // Get unique values for each option type
  const getOptionValues = (optionType: string) => {
    const values = new Set<string>();
    enabledVariants.forEach(variant => {
      if (variant.options?.[optionType]) {
        values.add(variant.options[optionType]);
      }
    });
    return Array.from(values);
  };

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Find matching variant based on selected options
  const findMatchingVariant = (options: Record<string, string>) => {
    return enabledVariants.find(variant => {
      return Object.entries(options).every(([key, value]) => {
        return variant.options?.[key] === value;
      });
    });
  };

  const handleOptionChange = (optionType: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionType]: value };
    setSelectedOptions(newOptions);
    
    // Try to find a matching variant
    const matchingVariant = findMatchingVariant(newOptions);
    if (matchingVariant) {
      setSelectedVariantId(matchingVariant.id);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariantId) {
      toast({
        title: "Please select options",
        description: "Choose all product options before adding to cart",
        variant: "destructive",
      });
      return;
    }

    onAddToCart(product.id, selectedVariantId);
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      onClose();
      setSelectedOptions({});
      setSelectedVariantId(null);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="product-detail-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.title}</DialogTitle>
          {product.description && (
            <DialogDescription className="text-base mt-2">
              {product.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8 mt-4">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={product.images[0] || 'https://via.placeholder.com/600x600?text=No+Image'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, idx) => (
                  <div key={idx} className="aspect-square bg-muted rounded overflow-hidden">
                    <img
                      src={image}
                      alt={`${product.title} ${idx + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-3xl font-bold">
                {selectedVariant ? `$${(selectedVariant.price / 100).toFixed(2)}` : `From $${(Math.min(...enabledVariants.map(v => v.price)) / 100).toFixed(2)}`}
              </p>
            </div>

            {/* Variant Selectors */}
            {optionTypes.length > 0 && (
              <div className="space-y-4">
                {optionTypes.map((optionType) => (
                  <div key={optionType} className="space-y-2">
                    <Label className="text-sm font-medium capitalize">{optionType}</Label>
                    <Select
                      value={selectedOptions[optionType] || ''}
                      onValueChange={(value) => handleOptionChange(optionType, value)}
                    >
                      <SelectTrigger data-testid={`select-${optionType}`}>
                        <SelectValue placeholder={`Select ${optionType}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {getOptionValues(optionType).map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {selectedVariant && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Selected Variant:</p>
                <p className="text-sm text-muted-foreground">{selectedVariant.title}</p>
              </div>
            )}

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleAddToCart}
              disabled={!selectedVariantId || addedToCart}
              data-testid="button-add-to-cart"
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
