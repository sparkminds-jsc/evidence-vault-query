
-- Create user profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  role text check (role in ('admin', 'staff')) default 'staff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  primary key (id)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create RLS policies
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert profiles" on public.profiles
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete profiles" on public.profiles
  for delete using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data ->> 'full_name', ''), 
    coalesce(new.raw_user_meta_data ->> 'role', 'staff')
  );
  return new;
end;
$$;

-- Create trigger for new users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create admin user (you'll need to set the password manually in Supabase Auth)
-- Note: This creates the profile, but you need to create the auth user separately
-- The admin user will need to be created through Supabase Auth with email: admin@suppliedshield.com
