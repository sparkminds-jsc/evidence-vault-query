-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create ai_commands table
CREATE TABLE public.ai_commands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  evaluation_command TEXT,
  control_command TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_commands ENABLE ROW LEVEL SECURITY;

-- Create policies for staff and admin access
CREATE POLICY "Staff and admin can view all ai_commands" 
ON public.ai_commands 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('staff', 'admin')
  )
);

CREATE POLICY "Staff and admin can insert ai_commands" 
ON public.ai_commands 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('staff', 'admin')
  )
);

CREATE POLICY "Staff and admin can update ai_commands" 
ON public.ai_commands 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('staff', 'admin')
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_commands_updated_at
BEFORE UPDATE ON public.ai_commands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();