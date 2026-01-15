-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert categories"
ON public.categories FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update categories"
ON public.categories FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();