
-- Create a table to store deleted files information
CREATE TABLE public.deleted_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL UNIQUE,
  file_url TEXT NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id TEXT DEFAULT '001'
);

-- Add Row Level Security (RLS)
ALTER TABLE public.deleted_files ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since we're using a fixed user_id)
CREATE POLICY "Anyone can manage deleted files" 
  ON public.deleted_files 
  FOR ALL 
  USING (true);
