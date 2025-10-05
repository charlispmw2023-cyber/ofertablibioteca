-- Drop all existing user-based policies for the 'offers' table
DROP POLICY IF EXISTS "Users can only see their own offers" ON public.offers;
DROP POLICY IF EXISTS "Users can only insert their own offers" ON public.offers;
DROP POLICY IF EXISTS "Users can only update their own offers" ON public.offers;
DROP POLICY IF EXISTS "Users can only delete their own offers" ON public.offers;

-- Disable Row Level Security on the 'offers' table
ALTER TABLE public.offers DISABLE ROW LEVEL SECURITY;

-- Make the user_id column optional as it will no longer be used
ALTER TABLE public.offers ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing user-based policies for the 'offer_images' storage
DROP POLICY IF EXISTS "Authenticated users can upload offer images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view offer images" ON storage.objects;

-- Create new public policies for storage
CREATE POLICY "Anyone can view offer images" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'offer_images');

CREATE POLICY "Anyone can upload offer images" ON storage.objects
FOR INSERT TO public WITH CHECK (bucket_id = 'offer_images');