import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PayPalButton from "@/components/PayPalButton";
import { JakiFooter } from "@/components/JakiFooter";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";

export default function Checkout() {
  const { items, total } = useCart();
  const totalInDollars = (total / 100).toFixed(2);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/shop">
              <Button variant="ghost" className="gap-2" data-testid="button-back-to-shop">
                <ArrowLeft className="w-4 h-4" />
                Back to Shop
              </Button>
            </Link>
            <h1 className="text-2xl font-brand font-bold" data-testid="text-checkout-title">
              Checkout
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Complete Your Order</h2>
            <p className="text-muted-foreground">
              Secure checkout powered by PayPal
            </p>
          </div>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.productTitle} ({item.quantity}x)
                        </span>
                        <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-lg border-t pt-2">
                    <span>Subtotal:</span>
                    <span data-testid="text-subtotal">${totalInDollars}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>Shipping:</span>
                    <span className="text-muted-foreground">Calculated at next step</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-2xl font-bold">
                    <span>Total:</span>
                    <span data-testid="text-total">${totalInDollars}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4" />
                <span>Secure payment processing</span>
              </div>

              {items.length > 0 ? (
                <div className="flex justify-center p-8 bg-muted/50 rounded-lg">
                  <PayPalButton
                    amount={totalInDollars}
                    currency="USD"
                    intent="CAPTURE"
                  />
                </div>
              ) : (
                <div className="text-center p-8 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">Add items to your cart to checkout</p>
                  <Link href="/shop">
                    <Button className="mt-4">Continue Shopping</Button>
                  </Link>
                </div>
              )}

              <p className="text-xs text-center text-muted-foreground">
                By completing your purchase you agree to these Terms of Service
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <JakiFooter />
    </div>
  );
}
