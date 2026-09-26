-- ------------------------------------------------------------------------------
-- ADD FEATURED MOMENTS COLUMNS
-- ------------------------------------------------------------------------------
-- Adds support for selecting main/featured moments for the homepage and custom display ordering.

ALTER TABLE IF EXISTS public.moments 
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_upcoming boolean DEFAULT false;

-- Optional index for faster query performance on homepage
CREATE INDEX IF NOT EXISTS idx_moments_featured 
ON public.moments(is_featured, featured_order, is_upcoming);
