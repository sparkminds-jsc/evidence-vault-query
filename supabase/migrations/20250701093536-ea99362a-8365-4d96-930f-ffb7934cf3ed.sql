
-- Add created_by column to customers table to track which staff created each customer
ALTER TABLE public.customers 
ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Update RLS policies to only show customers created by the current user
DROP POLICY IF EXISTS "Staff can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Staff can update customers" ON public.customers;
DROP POLICY IF EXISTS "Staff can delete customers" ON public.customers;

-- Create new policies that only allow staff to see their own customers
CREATE POLICY "Staff can view own customers" ON public.customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    ) AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ))
  );

CREATE POLICY "Staff can update own customers" ON public.customers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    ) AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ))
  );

CREATE POLICY "Staff can delete own customers" ON public.customers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    ) AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ))
  );

-- Update insert policy to automatically set created_by
DROP POLICY IF EXISTS "Staff can insert customers" ON public.customers;
CREATE POLICY "Staff can insert customers" ON public.customers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    ) AND created_by = auth.uid()
  );
