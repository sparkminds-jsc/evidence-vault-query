
-- Create a table to store security questions
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for security
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access (since this is a demo)
CREATE POLICY "Allow public access to questions" 
  ON public.questions 
  FOR ALL 
  USING (true);

-- Create an index for better performance
CREATE INDEX idx_questions_created_at ON public.questions(created_at DESC);
