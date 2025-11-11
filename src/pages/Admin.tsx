import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, LogOut } from "lucide-react";
import Header from "@/components/Header";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200),
  code: z.string().trim().min(1, "Product code is required").max(50),
  price: z.number().positive("Price must be greater than 0").max(10000000),
  description: z.string().trim().max(1000).optional(),
  category: z.string().trim().max(100).optional(),
});

const Admin = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { toast } = useToast();

  useEffect(() => {
    if (adminLoading) return;

    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    if (user && !isAdmin) {
      toast({
        title: "Admin access required",
        description: "Please sign in with an admin account to continue.",
        variant: "destructive",
      });
      // Force logout then redirect to auth so the login form appears instead of bouncing back home
      (async () => {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          // ignore
        } finally {
          navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`);
        }
      })();
    }
  }, [user, isAdmin, adminLoading, navigate, location, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }
      setImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Validate input
      const priceNum = parseFloat(price);
      const validation = productSchema.safeParse({
        name: name.trim(),
        code: code.trim(),
        price: priceNum,
        description: description.trim() || undefined,
        category: category.trim() || undefined,
      });

      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      let imageUrl = null;

      // Upload image if provided
      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, image);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Insert product
      const { error: insertError } = await supabase.from("products").insert({
        name: name.trim(),
        code: code.trim(),
        price: priceNum,
        description: description.trim() || null,
        category: category.trim() || null,
        image_url: imageUrl,
      });

      if (insertError) {
        if (insertError.message.includes("duplicate key")) {
          throw new Error("Product code already exists");
        }
        throw insertError;
      }

      toast({
        title: "Success",
        description: "Product uploaded successfully!",
      });

      // Reset form
      setName("");
      setCode("");
      setPrice("");
      setDescription("");
      setCategory("");
      setImage(null);
      const fileInput = document.getElementById("image-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload product",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-32 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-serif text-4xl">Admin Portal</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/manage-products")}>
                Manage Products
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-lg border">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Embroidered Kurti"
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Product Code *</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., BW-001"
                required
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (PKR) *</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 4500"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Kurtis, Suits, Accessories"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description..."
                rows={4}
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-upload">Product Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
                {image && (
                  <div className="text-sm text-muted-foreground">
                    {image.name}
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Product
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Admin;
