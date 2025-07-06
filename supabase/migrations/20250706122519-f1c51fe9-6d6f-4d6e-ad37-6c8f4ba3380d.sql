
-- Create feedback_history table to track changes made by staff
CREATE TABLE public.feedback_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id TEXT NOT NULL,
  description TEXT,
  question TEXT,
  document_evaluation TEXT,
  feedback_evaluation TEXT,
  from_audit TEXT,
  control_evaluation TEXT,
  remediation_guidance TEXT,
  feedback_remediation TEXT,
  staff_email TEXT NOT NULL,
  last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for better performance on question_id lookups
CREATE INDEX IF NOT EXISTS idx_feedback_history_question_id ON public.feedback_history(question_id);

-- Add index for staff_email lookups
CREATE INDEX IF NOT EXISTS idx_feedback_history_staff_email ON public.feedback_history(staff_email);

-- Enable Row Level Security
ALTER TABLE public.feedback_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read and write
CREATE POLICY "Authenticated users can manage feedback history" 
  ON public.feedback_history 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
