import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";

interface Category {
  id: string;
  name: string;
  productCount: number;
}

const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(100),
});

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Fetch categories from the categories table
      const { data: categoriesData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (catError) throw catError;

      // Fetch product counts per category
      const { data: productsData, error: prodError } = await supabase
        .from("products")
        .select("category");

      if (prodError) throw prodError;

      // Count products per category
      const productCounts = new Map<string, number>();
      (productsData || []).forEach((product) => {
        if (product.category) {
          productCounts.set(product.category, (productCounts.get(product.category) || 0) + 1);
        }
      });

      // Merge categories with product counts
      const categoryList: Category[] = (categoriesData || []).map((cat) => ({
        id: cat.id,
        name: cat.name,
        productCount: productCounts.get(cat.name) || 0,
      }));

      setCategories(categoryList);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setCategoryName("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);

    try {
      const validation = categorySchema.safeParse({ name: categoryName });

      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      const trimmedName = categoryName.trim();

      if (editingCategory) {
        // Update category in the categories table
        const { error: updateCatError } = await supabase
          .from("categories")
          .update({ name: trimmedName })
          .eq("id", editingCategory.id);

        if (updateCatError) {
          if (updateCatError.message.includes("duplicate key") || updateCatError.message.includes("unique constraint")) {
            throw new Error("Category name already exists");
          }
          throw updateCatError;
        }

        // Also update all products with the old category name
        if (editingCategory.name !== trimmedName) {
          const { error: updateProdError } = await supabase
            .from("products")
            .update({ category: trimmedName })
            .eq("category", editingCategory.name);

          if (updateProdError) throw updateProdError;
        }

        toast({ title: "Success", description: "Category updated!" });
      } else {
        // Insert new category
        const { error } = await supabase
          .from("categories")
          .insert({ name: trimmedName });

        if (error) {
          if (error.message.includes("duplicate key") || error.message.includes("unique constraint")) {
            throw new Error("Category name already exists");
          }
          throw error;
        }

        toast({ title: "Success", description: "Category created!" });
      }

      setIsDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (category.productCount > 0) {
      if (!confirm(`This category has ${category.productCount} product(s). Deleting will set their category to "Uncategorized". Continue?`)) {
        return;
      }
    } else {
      if (!confirm("Are you sure you want to delete this category?")) return;
    }

    setDeletingId(category.id);
    try {
      // Set all products with this category to null
      const { error: prodError } = await supabase
        .from("products")
        .update({ category: null })
        .eq("category", category.name);

      if (prodError) throw prodError;

      // Delete the category from the categories table
      const { error: catError } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (catError) throw catError;

      toast({ title: "Success", description: "Category deleted!" });
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            {categories.length} categories total
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No categories yet. Add your first category!
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.productCount} products</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(category)}
                        disabled={deletingId === category.id}
                      >
                        {deletingId === category.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update category name below. All products in this category will be updated."
                : "Enter a name for the new category."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., Kurtis"
                maxLength={100}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingCategory ? (
                "Save Changes"
              ) : (
                "Add Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
