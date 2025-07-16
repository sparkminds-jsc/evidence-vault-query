-- Fix infinite recursion by creating a security definer function for staff role checking
CREATE OR REPLACE FUNCTION public.is_admin_or_staff(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'staff')
  );
$$;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins and staff can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins and staff can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins and staff can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins and staff can insert profiles" ON public.profiles;

-- Create new policies using the security definer function
CREATE POLICY "Admins and staff can view profiles" ON public.profiles
  FOR SELECT USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can update profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin_or_staff(auth.uid()));