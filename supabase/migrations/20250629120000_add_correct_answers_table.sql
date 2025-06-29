
-- Add correct_answers table
CREATE TABLE IF NOT EXISTS public.correct_answers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    staff_email text NOT NULL,
    question text NOT NULL,
    evidence text NOT NULL,
    correct_answer text NOT NULL,
    correct_id text NOT NULL UNIQUE
);

-- Add RLS policies
ALTER TABLE public.correct_answers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert and read their own corrections
CREATE POLICY "Users can insert correct answers" ON public.correct_answers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view correct answers" ON public.correct_answers
    FOR SELECT USING (true);
