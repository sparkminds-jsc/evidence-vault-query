
-- Add status column to customers table
ALTER TABLE public.customers 
ADD COLUMN status text NOT NULL DEFAULT 'available';

-- Add check constraint for status values
ALTER TABLE public.customers 
ADD CONSTRAINT customers_status_check 
CHECK (status IN ('available', 'in_use'));
