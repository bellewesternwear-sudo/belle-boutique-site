import ProductCard from "./ProductCard";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const products = [
  { id: 1, image: product1, name: "Aurora", code: "BLE23301", price: 12500 },
  { id: 2, image: product2, name: "Eclipse", code: "BLE23302", price: 9500 },
  { id: 3, image: product3, name: "Celeste", code: "BLE23303", price: 4500 },
  { id: 4, image: product4, name: "Dakota", code: "BLE23304", price: 7500 },
  { id: 5, image: product1, name: "Savannah", code: "BLE23305", price: 11000 },
  { id: 6, image: product3, name: "Phoenix", code: "BLE23306", price: 4750 },
  { id: 7, image: product2, name: "Sierra", code: "BLE23307", price: 8750 },
  { id: 8, image: product4, name: "Montana", code: "BLE23308", price: 7250 },
];

const BestSellers = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">Best Sellers</h2>
          <p className="text-lg text-muted-foreground">
            The latest from our studio and workshop.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
