-- Step 1: Delete existing offers that were created without a user_id.
-- This is necessary because we cannot make the user_id column NOT NULL while it contains NULL values.
DELETE FROM public.offers WHERE user_id IS NULL;

-- Step 2: Now, make the user_id column required again.
ALTER TABLE public.offers ALTER COLUMN user_id SET NOT NULL;

-- Step 3: Re-enable Row Level Security on the 'offers' table.
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Step 4: Re-create user-based policies for the 'offers' table (ensuring a clean state).
DROP POLICY IF EXISTS "Users can only see their own offers" ON public.offers;
CREATE POLICY "Users can only see their own offers" ON public.offers
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own offers" ON public.offers;
CREATE POLICY "Users can only insert their own offers" ON public.offers
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own offers" ON public.offers;
CREATE POLICY "Users can only update their own offers" ON public.offers
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own offers" ON public.offers;
CREATE POLICY "Users can only delete their own offers" ON public.offers
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Step 5: Re-create user-based policies for storage (ensuring a clean state).
DROP POLICY IF EXISTS "Authenticated users can upload offer images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;

CREATE POLICY "Authenticated users can upload offer images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'offer_images');

CREATE POLICY "Users can view their own images" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'offer_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);