
-- Recreate view with SECURITY INVOKER to respect RLS
CREATE OR REPLACE VIEW public.team_member_profiles
WITH (security_invoker = true) AS
SELECT id, full_name, company_name, logo_url, company_segment
FROM public.profiles;
