
-- Update RLS policies to allow staff to view, update, and delete all customers
DROP POLICY IF EXISTS "Staff can view own customers" ON public.customers;
DROP POLICY IF EXISTS "Staff can update own customers" ON public.customers;
DROP POLICY IF EXISTS "Staff can delete own customers" ON public.customers;

-- Create new policies that allow staff and admin to manage all customers
CREATE POLICY "Staff can view all customers" ON public.customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff can update all customers" ON public.customers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff can delete all customers" ON public.customers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );
