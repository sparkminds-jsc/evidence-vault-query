-- Add new columns for control rating and feedback control rating in feedback_history table
ALTER TABLE public.feedback_history 
ADD COLUMN control_rating text,
ADD COLUMN feedback_control_rating text;