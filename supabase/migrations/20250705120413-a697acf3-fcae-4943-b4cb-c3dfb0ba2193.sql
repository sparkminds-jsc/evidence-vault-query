
-- Add answer_id column to correct_answers table
ALTER TABLE public.correct_answers 
ADD COLUMN answer_id uuid REFERENCES public.answers(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_correct_answers_answer_id ON public.correct_answers(answer_id);
