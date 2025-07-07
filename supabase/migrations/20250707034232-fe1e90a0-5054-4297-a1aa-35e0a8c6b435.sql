
-- Remove the foreign key constraint on answer_id column
ALTER TABLE public.correct_answers 
DROP CONSTRAINT IF EXISTS correct_answers_answer_id_fkey;

-- Drop the index that was created for the foreign key
DROP INDEX IF EXISTS idx_correct_answers_answer_id;
