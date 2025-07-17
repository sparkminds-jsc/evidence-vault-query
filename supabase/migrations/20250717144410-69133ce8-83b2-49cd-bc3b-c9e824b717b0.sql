-- Update RLS policy to allow staff to insert profiles for any user
DROP POLICY IF EXISTS "Admins and staff can insert profiles" ON profiles;

CREATE POLICY "Admins and staff can insert profiles" ON profiles
FOR INSERT 
WITH CHECK (
  is_admin_or_staff(auth.uid())
);