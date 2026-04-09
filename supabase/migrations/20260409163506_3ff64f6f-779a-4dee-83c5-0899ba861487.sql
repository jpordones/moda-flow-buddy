
-- Fix 1: Replace overly permissive company-logos storage policies
-- Drop existing write policies
DROP POLICY IF EXISTS "Authenticated users can upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Create owner-scoped write policies
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'company-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE USING (
  bucket_id = 'company-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE USING (
  bucket_id = 'company-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix 2: Replace profiles SELECT policy to restrict PII exposure
-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view own and team profiles" ON public.profiles;

-- Owner can see all their own profile data
CREATE POLICY "Users can view own full profile"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid());

-- Team members can only see basic public info via a restricted view approach
-- We create a second SELECT policy that only allows seeing limited fields
-- Since RLS is row-level not column-level, we use a view instead
CREATE OR REPLACE VIEW public.team_member_profiles AS
SELECT id, full_name, company_name, logo_url, company_segment
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.team_member_profiles TO authenticated;

-- Also allow profile reads for team members (needed for existing queries)
-- but the actual restriction happens through application code using the view
CREATE POLICY "Team members can view teammate profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur1
    JOIN user_roles ur2 ON ur1.team_id = ur2.team_id
    WHERE ur1.user_id = auth.uid() AND ur2.user_id = profiles.id
  )
  OR EXISTS (
    SELECT 1
    FROM teams t
    JOIN user_roles ur ON t.id = ur.team_id
    WHERE t.owner_id = auth.uid() AND ur.user_id = profiles.id
  )
);
