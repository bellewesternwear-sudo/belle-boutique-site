import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Package } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_code: string;
  size: string | null;
  quantity: number;
  price: number;
}

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !user) return;

      try {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (orderError) throw orderError;
        
        if (!orderData) {
          navigate("/");
          return;
        }

        setOrder(orderData);

        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderId);

        if (itemsError) throw itemsError;
        setOrderItems(itemsData || []);
      } catch (error) {
        console.error("Error fetching order:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchOrder();
    } else if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [orderId, user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We'll deliver it soon!
            </p>
          </div>

          {/* Order Details Card */}
          <div className="border rounded-lg p-6 bg-card mb-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <Package className="h-6 w-6 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-medium">{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <h2 className="font-bold mb-4">Order Items</h2>
            <div className="space-y-3 mb-6">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Code: {item.product_code}
                      {item.size && ` • Size: ${item.size}`}
                      {` • Qty: ${item.quantity}`}
                    </p>
                  </div>
                  <p className="font-medium">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-accent">PKR {order.total_amount.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Payment: Cash on Delivery
              </p>
            </div>
          </div>

          {/* Delivery Details Card */}
          <div className="border rounded-lg p-6 bg-card mb-8">
            <h2 className="font-bold mb-4">Delivery Details</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Name:</span>{" "}
                {order.customer_name}
              </p>
              <p>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {order.customer_phone}
              </p>
              <p>
                <span className="text-muted-foreground">City:</span>{" "}
                {order.customer_city}
              </p>
              <p>
                <span className="text-muted-foreground">Address:</span>{" "}
                {order.customer_address}
              </p>
            </div>
          </div>

          {/* Continue Shopping Button */}
          <div className="text-center">
            <Link to="/">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
