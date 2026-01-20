import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  code: string;
  price: number;
  originalPrice?: number | null;
  sizes?: string[] | null;
}

const ProductCard = ({ id, image, name, code, price, originalPrice, sizes }: ProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const discountPercent = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate(`/auth?redirect=/product/${id}`);
      return;
    }

    // If product has sizes, show size selector
    if (sizes && sizes.length > 0) {
      setShowSizeDialog(true);
      return;
    }

    // No sizes, add directly
    setAdding(true);
    await addToCart(id, null);
    setAdding(false);
  };

  const handleSizeSelect = async (size: string) => {
    setSelectedSize(size);
    setAdding(true);
    await addToCart(id, size);
    setAdding(false);
    setShowSizeDialog(false);
    setSelectedSize(null);
  };

  return (
    <>
      <Card className="group cursor-pointer border-none shadow-none overflow-hidden">
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-lg mb-4">
            <img 
              src={image} 
              alt={name}
              className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
            
            {discountPercent && (
              <span className="absolute top-3 left-3 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                -{discountPercent}%
              </span>
            )}

            {/* Add to Cart Button - appears on hover */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                className="w-full"
                onClick={handleAddToCart}
                disabled={adding}
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">Product Code: {code}</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-accent">PKR {price.toLocaleString()}</p>
              {originalPrice && originalPrice > price && (
                <p className="text-sm text-muted-foreground line-through">
                  PKR {originalPrice.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Size Selection Dialog */}
      <Dialog open={showSizeDialog} onOpenChange={setShowSizeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Size</DialogTitle>
            <DialogDescription>
              Choose a size for {name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 py-4">
            {sizes?.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeSelect(size)}
                disabled={adding && selectedSize === size}
                className={`px-4 py-2 border rounded-md transition-colors hover:border-accent hover:bg-accent/10 ${
                  adding && selectedSize === size ? "opacity-50" : ""
                }`}
              >
                {adding && selectedSize === size ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  size
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
