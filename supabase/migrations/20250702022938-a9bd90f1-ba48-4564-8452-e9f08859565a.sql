
-- Fix the insert policy to allow creating customers with created_by set to current user
DROP POLICY IF EXISTS "Staff can insert customers" ON public.customers;

CREATE POLICY "Staff can insert customers" ON public.customers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    ) AND (created_by IS NULL OR created_by = auth.uid())
  );
