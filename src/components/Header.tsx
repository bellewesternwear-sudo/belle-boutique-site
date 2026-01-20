import { Link } from "react-router-dom";
import { Search, ShoppingBag, Menu, User, Package, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { isAdmin } = useAdminCheck();
  const { getCartCount } = useCart();
  const { user } = useAuth();

  const cartCount = getCartCount();

  return (
    <>
      <div className="bg-accent text-background py-2 text-center text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <Package className="w-4 h-4" />
          <span>Cash on Delivery Available Nationwide</span>
        </div>
      </div>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-medium hover:text-accent transition-colors">New Arrivals</a>
              <a href="#" className="text-sm font-medium hover:text-accent transition-colors">Collections</a>
              <a href="#" className="text-sm font-medium hover:text-accent transition-colors">Best Sellers</a>
            </nav>
            
            <Link to="/">
              <h1 className="text-2xl font-bold tracking-wider">BELLE</h1>
            </Link>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Link to={user ? "/auth" : "/auth"}>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="icon" title="Admin Portal">
                    <Shield className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
