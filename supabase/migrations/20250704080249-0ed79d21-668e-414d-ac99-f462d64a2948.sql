
-- Add the missing document_evaluation_by_ai column to the questions table
ALTER TABLE public.questions 
ADD COLUMN document_evaluation_by_ai TEXT;
