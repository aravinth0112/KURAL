-- ==============================================================================
-- DATABASE SECURITY & SCHEMA — ROW-LEVEL SECURITY (RLS) POLICIES
-- LPU Tamizhans & Kural Website
-- ==============================================================================
-- NO HARDCODED EMAILS OR PII:
-- Admin authorization is verified dynamically against public.admins (user_id UUID)
-- via the cached SECURITY DEFINER function public.is_admin().
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. ADMINS REGISTRY TABLE & HELPER FUNCTION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on admins table (Zero public access)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view their own record" ON public.admins;
CREATE POLICY "Admins can view their own record"
ON public.admins FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Secure, cached admin check function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
$$;

-- Automatically enroll the authorized admin account (first registered user in auth.users)
-- Alternatively, you can run: INSERT INTO public.admins (user_id) VALUES ('<YOUR_USER_UUID>');
INSERT INTO public.admins (user_id)
SELECT id FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 1. SITE_CONTENT TABLE (About, Home, Gallery, Join Us text copy)
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read-only access on site_content" ON public.site_content;
DROP POLICY IF EXISTS "Admin only insert on site_content" ON public.site_content;
DROP POLICY IF EXISTS "Admin only update on site_content" ON public.site_content;
DROP POLICY IF EXISTS "Admin only delete on site_content" ON public.site_content;

-- Public can ONLY READ
CREATE POLICY "Public read-only access on site_content"
ON public.site_content FOR SELECT
TO public
USING (true);

-- Admin can INSERT
CREATE POLICY "Admin only insert on site_content"
ON public.site_content FOR INSERT
TO authenticated
WITH CHECK (
  auth.role() = 'authenticated' AND public.is_admin()
);

-- Admin can UPDATE
CREATE POLICY "Admin only update on site_content"
ON public.site_content FOR UPDATE
TO authenticated
USING (
  auth.role() = 'authenticated' AND public.is_admin()
)
WITH CHECK (
  auth.role() = 'authenticated' AND public.is_admin()
);

-- Admin can DELETE
CREATE POLICY "Admin only delete on site_content"
ON public.site_content FOR DELETE
TO authenticated
USING (
  auth.role() = 'authenticated' AND public.is_admin()
);


-- ------------------------------------------------------------------------------
-- 2. MOMENTS TABLE (Events & Media Archive)
ALTER TABLE IF EXISTS public.moments 
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_order integer DEFAULT 0;

ALTER TABLE IF EXISTS public.moments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read-only access on moments" ON public.moments;
DROP POLICY IF EXISTS "Admin only insert on moments" ON public.moments;
DROP POLICY IF EXISTS "Admin only update on moments" ON public.moments;
DROP POLICY IF EXISTS "Admin only delete on moments" ON public.moments;

-- Public can ONLY READ
CREATE POLICY "Public read-only access on moments"
ON public.moments FOR SELECT
TO public
USING (true);

-- Admin can INSERT
CREATE POLICY "Admin only insert on moments"
ON public.moments FOR INSERT
TO authenticated
WITH CHECK (
  auth.role() = 'authenticated' AND public.is_admin()
);

-- Admin can UPDATE
CREATE POLICY "Admin only update on moments"
ON public.moments FOR UPDATE
TO authenticated
USING (
  auth.role() = 'authenticated' AND public.is_admin()
)
WITH CHECK (
  auth.role() = 'authenticated' AND public.is_admin()
);

-- Admin can DELETE
CREATE POLICY "Admin only delete on moments"
ON public.moments FOR DELETE
TO authenticated
USING (
  auth.role() = 'authenticated' AND public.is_admin()
);


-- ------------------------------------------------------------------------------
-- 3. TEAM_MEMBERS TABLE (Team Profiles & Roles)
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read-only access on team_members" ON public.team_members;
DROP POLICY IF EXISTS "Admin only insert on team_members" ON public.team_members;
DROP POLICY IF EXISTS "Admin only update on team_members" ON public.team_members;
DROP POLICY IF EXISTS "Admin only delete on team_members" ON public.team_members;

-- Public can ONLY READ
CREATE POLICY "Public read-only access on team_members"
ON public.team_members FOR SELECT
TO public
USING (true);

-- Admin can INSERT
CREATE POLICY "Admin only insert on team_members"
ON public.team_members FOR INSERT
TO authenticated
WITH CHECK (
  auth.role() = 'authenticated' AND public.is_admin()
);

-- Admin can UPDATE
CREATE POLICY "Admin only update on team_members"
ON public.team_members FOR UPDATE
TO authenticated
USING (
  auth.role() = 'authenticated' AND public.is_admin()
)
WITH CHECK (
  auth.role() = 'authenticated' AND public.is_admin()
);

-- Admin can DELETE
CREATE POLICY "Admin only delete on team_members"
ON public.team_members FOR DELETE
TO authenticated
USING (
  auth.role() = 'authenticated' AND public.is_admin()
);


-- ------------------------------------------------------------------------------
-- 4. CONTACT_MESSAGES TABLE (Inquiries & Team Join Requests)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin can delete contact messages" ON public.contact_messages;

-- Public / Anonymous can INSERT only (submit inquiry)
CREATE POLICY "Public can insert contact messages"
ON public.contact_messages FOR INSERT
TO public
WITH CHECK (true);

-- Only authenticated admin can VIEW messages
CREATE POLICY "Admin can read contact messages"
ON public.contact_messages FOR SELECT
TO authenticated
USING (
  auth.role() = 'authenticated' AND public.is_admin()
);

-- Only authenticated admin can DELETE messages
CREATE POLICY "Admin can delete contact messages"
ON public.contact_messages FOR DELETE
TO authenticated
USING (
  auth.role() = 'authenticated' AND public.is_admin()
);


-- ------------------------------------------------------------------------------
-- 5. STORAGE OBJECTS (Moments & Profile uploads)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read-only access on storage moments" ON storage.objects;
DROP POLICY IF EXISTS "Admin only insert on storage moments" ON storage.objects;
DROP POLICY IF EXISTS "Admin only update on storage moments" ON storage.objects;
DROP POLICY IF EXISTS "Admin only delete on storage moments" ON storage.objects;

-- Public can ONLY READ
CREATE POLICY "Public read-only access on storage moments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'moments');

-- Admin can UPLOAD
CREATE POLICY "Admin only insert on storage moments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'moments' 
  AND auth.role() = 'authenticated' 
  AND public.is_admin()
);

-- Admin can UPDATE
CREATE POLICY "Admin only update on storage moments"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'moments' 
  AND auth.role() = 'authenticated' 
  AND public.is_admin()
);

-- Admin can DELETE
CREATE POLICY "Admin only delete on storage moments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'moments' 
  AND auth.role() = 'authenticated' 
  AND public.is_admin()
);
