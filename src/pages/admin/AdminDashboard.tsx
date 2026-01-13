import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Package, FolderTree, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Stats {
  totalProducts: number;
  totalCategories: number;
  recentProducts: Array<{
    id: string;
    name: string;
    created_at: string;
  }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalCategories: 0,
    recentProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all products to get stats
      const { data: products, error } = await supabase
        .from("products")
        .select("id, name, category, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const productList = products || [];
      
      // Count unique categories
      const uniqueCategories = new Set(
        productList.map((p) => p.category).filter((c): c is string => !!c)
      );

      setStats({
        totalProducts: productList.length,
        totalCategories: uniqueCategories.size,
        recentProducts: productList.slice(0, 5).map((p) => ({
          id: p.id,
          name: p.name,
          created_at: p.created_at || new Date().toISOString(),
        })),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your admin dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <Link to="/admin/products">
              <Button variant="link" className="px-0 text-accent">
                Manage Products →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <Link to="/admin/categories">
              <Button variant="link" className="px-0 text-accent">
                Manage Categories →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/admin/products">
              <Button variant="outline" size="sm" className="w-full justify-start">
                + Add New Product
              </Button>
            </Link>
            <Link to="/admin/categories">
              <Button variant="outline" size="sm" className="w-full justify-start">
                + Add New Category
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : stats.recentProducts.length === 0 ? (
            <p className="text-muted-foreground">No products yet</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentProducts.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="font-medium">{product.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(product.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
