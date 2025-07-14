
-- Add control_rating_by_ai column to the questions table
ALTER TABLE public.questions 
ADD COLUMN control_rating_by_ai TEXT;
