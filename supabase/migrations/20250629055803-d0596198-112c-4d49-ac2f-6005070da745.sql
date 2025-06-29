
-- Add customer_id column to questions table to link questions to customers
ALTER TABLE public.questions 
ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE;
