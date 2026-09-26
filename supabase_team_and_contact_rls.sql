-- =========================================================================
-- KURAL LPU - SUPABASE RLS PERMISSIONS FOR TEAM & CONTACT FORMS
-- Run this in your Supabase Dashboard -> SQL Editor -> Click 'Run'
-- =========================================================================

-- 1. Ensure team_applications table exists
CREATE TABLE IF NOT EXISTS public.team_applications (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  batch TEXT NOT NULL,
  interest_area TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.team_applications ENABLE ROW LEVEL SECURITY;

-- Allow public users (anon) and authenticated users to submit team applications
DROP POLICY IF EXISTS "Anyone can apply" ON public.team_applications;
CREATE POLICY "Anyone can apply" ON public.team_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated admins to view and manage team applications
DROP POLICY IF EXISTS "Admins can read applications" ON public.team_applications;
CREATE POLICY "Admins can read applications" ON public.team_applications
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can delete applications" ON public.team_applications;
CREATE POLICY "Admins can delete applications" ON public.team_applications
  FOR DELETE TO authenticated
  USING (true);


-- 2. Ensure contact_messages table permissions allow public message sending
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public users (anon) to submit contact messages
DROP POLICY IF EXISTS "Anyone can send a message" ON public.contact_messages;
CREATE POLICY "Anyone can send a message" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated admins to view and manage contact messages
DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact_messages;
CREATE POLICY "Admins can read contact messages" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages
  FOR DELETE TO authenticated
  USING (true);
