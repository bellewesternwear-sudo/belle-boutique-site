import { Search, ShoppingBag, Menu, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
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
            
            <h1 className="text-2xl font-bold tracking-wider">BELLE</h1>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
