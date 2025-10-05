-- Create the offers table
CREATE TABLE public.offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  image_url TEXT,
  sales_page_link TEXT,
  checkout_link TEXT,
  upsell_1_link TEXT,
  upsell_2_link TEXT,
  upsell_3_link TEXT,
  thank_you_page_link TEXT,
  platform TEXT,
  drive_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on the table
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Create policies to protect user data
CREATE POLICY "Users can only see their own offers" ON public.offers
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own offers" ON public.offers
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own offers" ON public.offers
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own offers" ON public.offers
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create a storage bucket for offer images
INSERT INTO storage.buckets (id, name, public)
VALUES ('offer_images', 'offer_images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for the storage bucket
CREATE POLICY "Authenticated users can upload offer images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'offer_images');

CREATE POLICY "Anyone can view offer images" ON storage.objects
FOR SELECT USING (bucket_id = 'offer_images');