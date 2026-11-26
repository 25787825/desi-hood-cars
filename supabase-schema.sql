-- ============================================================================
-- Desi Hood Cars by AHMAD RAZA - Manual Supabase PostgreSQL Schema
-- Run this script once in your Supabase Dashboard -> SQL Editor
-- Project URL: https://rktpglykpwxydaqrurom.supabase.co
-- ============================================================================

-- 1. DEALERS TABLE
CREATE TABLE IF NOT EXISTS public.dealers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'US',
  address TEXT DEFAULT '',
  license TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  description TEXT DEFAULT '',
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.0,
  reviews_count INTEGER NOT NULL DEFAULT 1,
  verified BOOLEAN NOT NULL DEFAULT true,
  banned BOOLEAN NOT NULL DEFAULT false,
  ban_reason TEXT DEFAULT '',
  banned_at TIMESTAMPTZ,
  total_cars_sold INTEGER NOT NULL DEFAULT 0,
  total_sales_volume NUMERIC NOT NULL DEFAULT 0,
  member_since TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. DEALER REQUESTS BOX (Pending -> Approved / Rejected by Owner)
CREATE TABLE IF NOT EXISTS public.dealer_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  country_name TEXT DEFAULT '',
  city TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  address TEXT NOT NULL,
  license TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_note TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- 3. VEHICLES / CARS INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.cars (
  id TEXT PRIMARY KEY,
  dealer_id TEXT REFERENCES public.dealers(id) ON DELETE CASCADE,
  country TEXT NOT NULL DEFAULT 'US',
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  mileage INTEGER NOT NULL DEFAULT 0,
  body_style TEXT NOT NULL DEFAULT 'Sedan',
  fuel_type TEXT NOT NULL DEFAULT 'Petrol',
  transmission TEXT NOT NULL DEFAULT 'Automatic',
  condition TEXT NOT NULL DEFAULT 'Used',
  horsepower INTEGER,
  vin TEXT DEFAULT '',
  image TEXT DEFAULT '',
  description TEXT DEFAULT '',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold')),
  sold_date TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. BUYER ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
  id TEXT PRIMARY KEY,
  auth_user_id UUID,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  dob TEXT DEFAULT '',
  id_number TEXT DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT DEFAULT '',
  address TEXT NOT NULL,
  preferred_currency TEXT NOT NULL DEFAULT 'USD',
  budget_range TEXT DEFAULT '',
  preferred_vehicle_type TEXT DEFAULT '',
  payment_method TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  verified_buyer BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. SPARE PARTS TABLE
CREATE TABLE IF NOT EXISTS public.spare_parts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  part_number TEXT DEFAULT '',
  compatibility TEXT DEFAULT '',
  price NUMERIC NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  stock INTEGER NOT NULL DEFAULT 1,
  image TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. CAR BLOGS TABLE
CREATE TABLE IF NOT EXISTS public.blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  car_tag TEXT DEFAULT '',
  read_time TEXT DEFAULT '4 min read',
  published_date TEXT DEFAULT '',
  image TEXT DEFAULT '',
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. CUSTOMER INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  car_id TEXT,
  dealer_id TEXT REFERENCES public.dealers(id) ON DELETE CASCADE,
  car_name TEXT DEFAULT '',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Check Availability',
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. SHOWROOM OWNERS PAKISTAN TABLE (ADMIN DIRECTORY)
CREATE TABLE IF NOT EXISTS public.showroom_owners_pk (
  id TEXT PRIMARY KEY,
  showroom_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  city TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Car Showroom',
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  is_sample BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cars_dealer_id ON public.cars(dealer_id);
CREATE INDEX IF NOT EXISTS idx_cars_country_status ON public.cars(country, status);
CREATE INDEX IF NOT EXISTS idx_dealer_requests_status ON public.dealer_requests(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_dealer_id ON public.inquiries(dealer_id);

-- Explicit Data API Grants for Public Client (anon & authenticated)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Enable Row Level Security on every exposed table
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showroom_owners_pk ENABLE ROW LEVEL SECURITY;

-- Public Client Policies (using explicit TO anon, authenticated clauses)
CREATE POLICY "public_read_dealers" ON public.dealers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_write_dealers" ON public.dealers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_dealers" ON public.dealers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_dealers" ON public.dealers FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public_read_requests" ON public.dealer_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_write_requests" ON public.dealer_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_requests" ON public.dealer_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_requests" ON public.dealer_requests FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public_read_cars" ON public.cars FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_write_cars" ON public.cars FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_cars" ON public.cars FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_cars" ON public.cars FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public_read_buyers" ON public.buyer_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_write_buyers" ON public.buyer_profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_buyers" ON public.buyer_profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_read_parts" ON public.spare_parts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_write_parts" ON public.spare_parts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_parts" ON public.spare_parts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_read_blogs" ON public.blogs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_write_blogs" ON public.blogs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_delete_blogs" ON public.blogs FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public_read_inquiries" ON public.inquiries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_write_inquiries" ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "public_read_showroom_owners_pk" ON public.showroom_owners_pk FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_write_showroom_owners_pk" ON public.showroom_owners_pk FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_showroom_owners_pk" ON public.showroom_owners_pk FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_showroom_owners_pk" ON public.showroom_owners_pk FOR DELETE TO anon, authenticated USING (true);
