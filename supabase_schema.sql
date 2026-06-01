-- ก๊อปปี้โค้ดทั้งหมดนี้ไปวางในเมนู SQL Editor ของ Supabase แล้วกด Run

-- 1. สร้างตารางผู้ใช้งาน (Users)
CREATE TABLE public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  balance numeric DEFAULT 0,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. สร้างตารางกิจกรรมล่าสุด (Live Activities)
CREATE TABLE public.activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  username text NOT NULL,
  item_name text,
  quantity integer,
  price numeric,
  remaining_stock integer,
  game text,
  gacha_drops jsonb,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. สร้างตารางประวัติการซื้อ (Purchases)
CREATE TABLE public.purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL,
  item_id text,
  item_name text,
  price numeric,
  quantity integer,
  gacha_drops jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 4. สร้างตารางประวัติการเติมเงิน (Topups)
CREATE TABLE public.topups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL,
  amount numeric NOT NULL,
  method text,
  game text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 5. อนุญาตให้อ่านเขียนได้ (สำหรับเทส)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations for activities" ON public.activities FOR ALL USING (true);
CREATE POLICY "Allow all operations for purchases" ON public.purchases FOR ALL USING (true);
CREATE POLICY "Allow all operations for topups" ON public.topups FOR ALL USING (true);
