
-- Add RLS policy to allow UPDATE operations on correct_answers table
CREATE POLICY "Users can update correct answers" ON public.correct_answers
    FOR UPDATE USING (true);
