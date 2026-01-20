import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Search, Upload } from "lucide-react";
import { z } from "zod";

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  original_price: number | null;
  description: string | null;
  category: string | null;
  image_url: string | null;
  sizes: string[] | null;
  is_best_seller: boolean;
  is_featured: boolean;
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200),
  code: z.string().trim().min(1, "Product code is required").max(50),
  price: z.number().positive("Price must be greater than 0").max(10000000),
  original_price: z.number().positive().max(10000000).optional().nullable(),
  description: z.string().trim().max(1000).optional(),
  category: z.string().trim().max(100).optional().nullable(),
});

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    price: "",
    original_price: "",
    description: "",
    category: "",
    sizes: [] as string[],
    is_best_seller: false,
    is_featured: false,
  });
  const [image, setImage] = useState<File | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

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
      toast({ title: "Error", description: "Failed to load products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("name").order("name");
      if (error) throw error;
      setCategories((data || []).map((c) => c.name));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter || (!p.category && categoryFilter === "uncategorized");
    return matchesSearch && matchesCategory;
  });

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData({ name: "", code: "", price: "", original_price: "", description: "", category: "", sizes: [], is_best_seller: false, is_featured: false });
    setImage(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      description: product.description || "",
      category: product.category || "",
      sizes: product.sizes || [],
      is_best_seller: product.is_best_seller || false,
      is_featured: product.is_featured || false,
    });
    setImage(null);
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "Image size must be less than 5MB", variant: "destructive" });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({ title: "Error", description: "Please upload an image file", variant: "destructive" });
        return;
      }
      setImage(file);
    }
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const priceNum = parseFloat(formData.price);
      const originalPriceNum = formData.original_price ? parseFloat(formData.original_price) : null;
      
      const validation = productSchema.safeParse({
        name: formData.name.trim(),
        code: formData.code.trim(),
        price: priceNum,
        original_price: originalPriceNum,
        description: formData.description.trim() || undefined,
        category: formData.category.trim() || null,
      });

      if (!validation.success) {
        toast({ title: "Validation Error", description: validation.error.errors[0].message, variant: "destructive" });
        setSaving(false);
        return;
      }

      let imageUrl = editingProduct?.image_url || null;

      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, image);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const productData = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        price: priceNum,
        original_price: originalPriceNum,
        description: formData.description.trim() || null,
        category: formData.category.trim() || null,
        image_url: imageUrl,
        sizes: formData.sizes.length > 0 ? formData.sizes : null,
        is_best_seller: formData.is_best_seller,
        is_featured: formData.is_featured,
      };

      if (editingProduct) {
        const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id);
        if (error) throw error;
        toast({ title: "Success", description: "Product updated!" });
      } else {
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
        toast({ title: "Success", description: "Product added!" });
      }

      setIsDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save product", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Product deleted!" });
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete product", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">{products.length} products total</p>
        </div>
        <Button onClick={openAddDialog}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
            {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No products found</TableCell></TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image_url ? <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded" /> : <div className="w-12 h-12 bg-muted rounded flex items-center justify-center"><Upload className="h-4 w-4 text-muted-foreground" /></div>}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.code}</TableCell>
                  <TableCell>{product.category || "—"}</TableCell>
                  <TableCell>
                    <div>PKR {product.price.toLocaleString()}</div>
                    {product.original_price && <div className="text-sm text-muted-foreground line-through">PKR {product.original_price.toLocaleString()}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {product.is_best_seller && <Badge variant="secondary" className="text-xs">Best Seller</Badge>}
                      {product.is_featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(product)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)} disabled={deletingId === product.id}>
                        {deletingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>{editingProduct ? "Update product details below." : "Fill in the details to add a new product."}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="name">Product Name *</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Embroidered Kurti" maxLength={200} /></div>
              <div className="space-y-2"><Label htmlFor="code">Product Code *</Label><Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., BW-001" maxLength={50} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="price">Price (PKR) *</Label><Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="e.g., 4500" min="0" step="0.01" /></div>
              <div className="space-y-2"><Label htmlFor="original_price">Original Price (for discount)</Label><Input id="original_price" type="number" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: e.target.value })} placeholder="e.g., 6000" min="0" step="0.01" /></div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category || "none"} onValueChange={(value) => setFormData({ ...formData, category: value === "none" ? "" : value })}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Available Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SIZES.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox id={`size-${size}`} checked={formData.sizes.includes(size)} onCheckedChange={() => toggleSize(size)} />
                    <label htmlFor={`size-${size}`} className="text-sm cursor-pointer">{size}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Product description..." rows={3} maxLength={1000} /></div>

            <div className="flex gap-6">
              <div className="flex items-center space-x-2"><Switch id="is_best_seller" checked={formData.is_best_seller} onCheckedChange={(checked) => setFormData({ ...formData, is_best_seller: checked })} /><Label htmlFor="is_best_seller">Best Seller</Label></div>
              <div className="flex items-center space-x-2"><Switch id="is_featured" checked={formData.is_featured} onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })} /><Label htmlFor="is_featured">Featured (New Arrival)</Label></div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
              <p className="text-xs text-muted-foreground">Max 5MB. Recommended: 800x800px</p>
              {image && <p className="text-sm text-accent">Selected: {image.name}</p>}
              {editingProduct?.image_url && !image && <div className="mt-2"><p className="text-xs text-muted-foreground mb-1">Current image:</p><img src={editingProduct.image_url} alt="Current" className="w-24 h-24 object-cover rounded" /></div>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>{saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : editingProduct ? "Save Changes" : "Add Product"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
