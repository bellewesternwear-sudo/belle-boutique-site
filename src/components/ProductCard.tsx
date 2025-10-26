import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  image: string;
  name: string;
  code: string;
  price: number;
}

const ProductCard = ({ image, name, code, price }: ProductCardProps) => {
  return (
    <Card className="group cursor-pointer border-none shadow-none overflow-hidden">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img 
            src={image} 
            alt={name}
            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground">Product Code: {code}</p>
          <p className="text-lg font-bold text-accent">PKR {price.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
