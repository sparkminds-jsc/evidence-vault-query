
-- Add status column to correct_answers table
ALTER TABLE public.correct_answers 
ADD COLUMN status text NOT NULL DEFAULT 'active';

-- Create index for better performance when filtering by status
CREATE INDEX idx_correct_answers_status ON public.correct_answers(status);
