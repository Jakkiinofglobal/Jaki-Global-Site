import { Switch, Route, Redirect, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

import Builder from "@/pages/Builder";
import Shop from "@/pages/Shop";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import Site from "@/pages/Site";

/** Floating admin gear */
function AdminFab() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Hide on login page only
  if (location === "/login") return null;

  // If already inside builder, offer a “Back to Site”
  if (location.startsWith("/builder")) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <Link href="/">
          <Button className="shadow-lg">Back to Site</Button>
        </Link>
      </div>
    );
  }

  // Everywhere else: small round gear
  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <Link href={isAuthenticated ? "/builder" : "/login"}>
        <Button
          variant="outline"
          className="h-12 w-12 p-0 rounded-full shadow-lg"
          aria-label={isAuthenticated ? "Open Builder" : "Admin Login"}
          title={isAuthenticated ? "Open Builder" : "Admin Login"}
        >
          <Settings className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}

/** Protect /builder only */
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

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Site} />
      <Route path="/shop" component={Shop} />
      <Route path="/checkout" component={Checkout} />

      {/* Auth */}
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/builder" /> : <Login />}
      </Route>

      {/* Admin (protected) */}
      <Route path="/builder">
        <ProtectedRoute component={Builder} />
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <CartProvider>
            <Toaster />
            {/* Put the gear at top-level so it overlays every route */}
            <AdminFab />
            <Router />
          </CartProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
