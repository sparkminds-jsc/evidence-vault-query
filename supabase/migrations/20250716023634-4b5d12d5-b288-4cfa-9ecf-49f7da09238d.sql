
-- Update RLS policies to allow staff members to create other staff
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Create new policy that allows both admins and staff to insert profiles
CREATE POLICY "Admins and staff can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Update the existing policies to allow staff to view and manage other staff
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Create new policies that allow both admins and staff
CREATE POLICY "Admins and staff can view profiles" ON public.profiles
  FOR SELECT USING (
    public.is_admin(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'staff'
    )
  );

CREATE POLICY "Admins and staff can update profiles" ON public.profiles
  FOR UPDATE USING (
    public.is_admin(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'staff'
    )
  );

CREATE POLICY "Admins and staff can delete profiles" ON public.profiles
  FOR DELETE USING (
    public.is_admin(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'staff'
    )
  );
