// client/src/App.tsx
import { Switch, Route, Redirect, Link, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Settings, ArrowLeft } from "lucide-react";

import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Builder from "@/pages/Builder";
import Shop from "@/pages/Shop";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import Site from "@/pages/Site";

/* ---------- Floating gear (Admin) button ---------- */
function AdminFab() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Hide on login page
  if (location === "/login") return null;

  // If already in the builder, show "Back to Site"
  if (location.startsWith("/builder")) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Link href="/">
          <Button variant="outline" className="rounded-full p-2 shadow-lg" aria-label="Back to Site">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    );
  }

  // Everywhere else: subtle gear
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link href={isAuthenticated ? "/builder" : "/login"}>
        <Button
          variant="outline"
          className="rounded-full p-2 shadow-lg hover:bg-muted transition"
          aria-label={isAuthenticated ? "Open Builder" : "Admin Login"}
          title={isAuthenticated ? "Open Builder" : "Admin Login"}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </Link>
    </div>
  );
}

/* ---------- Protected route wrapper (for /builder) ---------- */
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  return <Component />;
}

/* ---------- Router ---------- */
function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      {/* Public site */}
      <Route path="/" component={Site} />
      <Route path="/shop" component={Shop} />
      <Route path="/checkout" component={Checkout} />

      {/* Auth */}
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/builder" /> : <Login />}
      </Route>

      {/* Admin / Builder (protected) */}
      <Route path="/builder">
        <ProtectedRoute component={Builder} />
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

/* ---------- App Providers ---------- */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <CartProvider>
            <Toaster />
            <AdminFab />
            <Router />
          </CartProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
