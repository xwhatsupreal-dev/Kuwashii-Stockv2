-- ก๊อปปี้โค้ดทั้งหมดนี้ไปวางในเมนู SQL Editor ของ Supabase แล้วกด Run

-- 1. สร้างตารางผู้ใช้งาน (Users)
CREATE TABLE public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  balance numeric DEFAULT 0,
  is_admin boolean DEFAULT false,
  banned boolean DEFAULT false,
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

-- 5. สร้างตารางสินค้า (Items)
CREATE TABLE public.items (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  quantity integer DEFAULT 0,
  image text,
  game text,
  category text,
  rarity text,
  popular boolean DEFAULT false,
  gacha_pool jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 6. สร้างตารางคูปอง (Coupons)
CREATE TABLE public.coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  amount numeric NOT NULL,
  max_uses integer DEFAULT 1,
  used_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 7. ระบบตั้งค่า (System Config)
CREATE TABLE public.system_config (
  id text PRIMARY KEY, -- ค่าจะเป็น 'main'
  maintenance_mode boolean DEFAULT false,
  global_sales_astd numeric DEFAULT 0,
  global_rev_astd numeric DEFAULT 0,
  global_free_astd numeric DEFAULT 0
);

-- เพิ่มข้อมูล Config เริ่มต้น
INSERT INTO public.system_config (id, maintenance_mode, global_sales_astd, global_rev_astd, global_free_astd)
VALUES ('main', true, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- 8. อนุญาตให้อ่านเขียนได้ (สำหรับเทส)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations for activities" ON public.activities FOR ALL USING (true);
CREATE POLICY "Allow all operations for purchases" ON public.purchases FOR ALL USING (true);
CREATE POLICY "Allow all operations for topups" ON public.topups FOR ALL USING (true);
CREATE POLICY "Allow all operations for items" ON public.items FOR ALL USING (true);
CREATE POLICY "Allow all operations for coupons" ON public.coupons FOR ALL USING (true);
CREATE POLICY "Allow all operations for system_config" ON public.system_config FOR ALL USING (true);
