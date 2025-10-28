// client/src/App.tsx
import { Switch, Route, Redirect, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

import Builder from "@/pages/Builder";
import Shop from "@/pages/Shop";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import Site from "@/pages/Site";

// Floating gear/button for Admin / Builder access
function AdminFab() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Hide on the login page
  if (location === "/login") return null;

  // If you're already in the builder, show "Back to Site"
  if (location.startsWith("/builder")) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Link href="/">
          <Button className="shadow-lg">Back to Site</Button>
        </Link>
      </div>
    );
  }

  // Everywhere else
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link href={isAuthenticated ? "/builder" : "/login"}>
        <Button className="shadow-lg">
          {isAuthenticated ? "Open Builder" : "Admin Login"}
        </Button>
      </Link>
    </div>
  );
}

// Protect specific routes (only for /builder)
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
      {/* Public pages */}
      <Route path="/" component={Site} />
      <Route path="/shop" component={Shop} />
      <Route path="/checkout" component={Checkout} />

      {/* Auth page */}
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/builder" /> : <Login />}
      </Route>

      {/* Admin/Builder (protected) */}
      <Route path="/builder">
        <ProtectedRoute component={Builder} />
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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

export default App; // <-- IMPORTANT: default export
