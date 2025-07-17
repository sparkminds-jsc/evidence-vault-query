-- Manually create profile for the user since trigger is not working
INSERT INTO profiles (id, full_name, email, role) 
VALUES ('73dd7eb0-50b9-4931-a285-928a983eba50', 'an@sparkminds.net', 'an@sparkminds.net', 'staff')
ON CONFLICT (id) DO NOTHING;

-- Check if trigger exists and recreate it if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();