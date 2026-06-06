-- Add images jsonb column to public.items
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS images jsonb;
