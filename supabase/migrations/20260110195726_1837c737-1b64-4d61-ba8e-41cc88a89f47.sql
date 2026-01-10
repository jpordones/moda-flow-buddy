-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for viewing logos (public)
CREATE POLICY "Anyone can view company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

-- Policy for uploading logos (authenticated users only for their own folder)
CREATE POLICY "Users can upload their own logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos' AND
  auth.uid() IS NOT NULL
);

-- Policy for updating logos
CREATE POLICY "Users can update their own logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company-logos' AND
  auth.uid() IS NOT NULL
);

-- Policy for deleting logos
CREATE POLICY "Users can delete their own logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-logos' AND
  auth.uid() IS NOT NULL
);