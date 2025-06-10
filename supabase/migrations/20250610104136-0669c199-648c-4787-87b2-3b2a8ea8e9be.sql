
-- Add question_id column to store the ID from Excel file
ALTER TABLE public.questions 
ADD COLUMN question_id TEXT;

-- Add answer column to store the API response
ALTER TABLE public.questions 
ADD COLUMN answer TEXT;

-- Add source column for tracking
ALTER TABLE public.questions 
ADD COLUMN source TEXT DEFAULT 'api';

-- Add evidence column for additional data
ALTER TABLE public.questions 
ADD COLUMN evidence TEXT;
