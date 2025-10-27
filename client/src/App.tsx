import { Switch, Route, Redirect, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Site from "@/pages/Site";
import Builder from "@/pages/Builder";
import Shop from "@/pages/Shop";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import { Settings } from "lucide-react";

// Floating gear icon for Admin / Builder access
function AdminFab() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Hide on the login page
  if (location === "/login") return null;

  const to = isAuthenticated ? "/builder" : "/login";
  const tooltip = isAuthenticated ? "Open Builder" : "Admin Login";

  return (
    <Link href={to}>
      <button
        title={tooltip}
        className="fixed bottom-4 right-4 z-[9999] bg-white/80 hover:bg-white p-2 rounded-full shadow-lg border border-gray-300 transition"
      >
        <Settings className="w-5 h-5 text-gray-700" />
      </button>
    </Link>
  );
}

// Protect specific routes (used for /builder)
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
