
-- Insert admin user into auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@suppliedshield.com',
  crypt('Suppliedshield@123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Administrator", "role": "admin"}',
  '{"provider": "email", "providers": ["email"]}',
  false,
  '',
  '',
  '',
  ''
);
