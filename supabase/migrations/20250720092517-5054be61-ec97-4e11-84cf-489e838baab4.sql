-- Add new columns to ai_commands table for remediation guidance and control rating
ALTER TABLE public.ai_commands 
ADD COLUMN remediation_guidance_command TEXT,
ADD COLUMN control_rating_command TEXT;