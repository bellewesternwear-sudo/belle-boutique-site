-- Make user_id nullable to support guest orders
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Add customer_email column
ALTER TABLE public.orders ADD COLUMN customer_email TEXT;

-- Drop existing RLS policies for orders that require auth
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

-- Create new policies that support guest orders
CREATE POLICY "Anyone can insert orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own orders by user_id" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- Drop existing RLS policies for order_items that require auth
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;

-- Create new policies that support guest order items
CREATE POLICY "Anyone can insert order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);