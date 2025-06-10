
-- Create a storage bucket for uploaded documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true);

-- Create policy to allow anyone to upload files
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents');

-- Create policy to allow anyone to view files
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');
