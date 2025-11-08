import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import product1 from "@/assets/product-1.jpg";

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  image_url: string | null;
}

const BestSellers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">Best Sellers</h2>
          <p className="text-lg text-muted-foreground">
            The latest from our studio and workshop.
          </p>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                image={product.image_url || product1}
                name={product.name}
                code={product.code}
                price={product.price}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;
