
-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Staff can insert customers" ON public.customers;

-- Create a new policy that allows any authenticated user to insert customers
CREATE POLICY "Authenticated users can insert customers" ON public.customers
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );
