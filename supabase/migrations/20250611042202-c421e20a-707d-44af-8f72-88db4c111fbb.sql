
-- Create a table for storing individual answers/evidence pieces
CREATE TABLE public.answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  page_content TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for better query performance
CREATE INDEX idx_answers_question_id ON public.answers(question_id);
