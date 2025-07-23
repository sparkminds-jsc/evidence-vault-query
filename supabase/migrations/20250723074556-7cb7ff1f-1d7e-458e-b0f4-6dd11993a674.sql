-- Add new column for feedback to AI for control rating
ALTER TABLE public.questions 
ADD COLUMN feedback_for_control_rating text;