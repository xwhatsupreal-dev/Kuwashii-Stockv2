-- ก๊อปปี้โค้ดทั้งหมดนี้ไปวางในเมนู SQL Editor ของ Supabase แล้วกด Run

-- 1. สร้างตารางผู้ใช้งาน (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  email text,
  balance numeric DEFAULT 0,
  balance_rov numeric DEFAULT 0,
  is_admin boolean DEFAULT false,
  banned boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- เพิ่มคอลัมน์เผื่อว่ามีตาราง profiles อยู่แล้วแต่ยังไม่มีคอลัมน์นี้
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username_last_changed timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS otp_code text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS otp_expires_at timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS balance_rov numeric DEFAULT 0;

-- 2. สร้างตารางกิจกรรมล่าสุด (Live Activities)
CREATE TABLE IF NOT EXISTS public.activities (
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

ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS game text;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS gacha_drops jsonb;

-- 3. สร้างตารางประวัติการซื้อ (Purchases)
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL,
  item_id text,
  item_name text,
  price numeric,
  quantity integer,
  gacha_drops jsonb,
  game text,
  credential_data text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS game text;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS gacha_drops jsonb;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS credential_data text;

-- 4. สร้างตารางประวัติการเติมเงิน (Topups)
CREATE TABLE IF NOT EXISTS public.topups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL,
  amount numeric NOT NULL,
  method text,
  ref_code text,
  game text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.topups ADD COLUMN IF NOT EXISTS game text;
ALTER TABLE public.topups ADD COLUMN IF NOT EXISTS ref_code text;

-- 5. สร้างตารางสินค้า (Items)
CREATE TABLE IF NOT EXISTS public.items (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  quantity integer DEFAULT 0,
  image text,
  images jsonb,
  game text,
  category text,
  rarity text,
  popular boolean DEFAULT false,
  gacha_pool jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 6. สร้างตารางคูปอง (Coupons)
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  amount numeric NOT NULL,
  max_uses integer DEFAULT 1,
  used_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 7. สร้างตารางการันตีแจ็คพอต (Claimed Jackpots ทั่วโลก)
CREATE TABLE IF NOT EXISTS public.claimed_jackpots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id text NOT NULL,
  stock_trigger integer NOT NULL,
  reward_name text,
  username text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(item_id, stock_trigger)
);

-- 8. ระบบตั้งค่า (System Config)
CREATE TABLE IF NOT EXISTS public.system_config (
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

-- 9. เปิดการใช้งานระบบ Row Level Security (RLS) เพื่อป้องกันฐานข้อมูล
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claimed_jackpots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- เพิ่มเงื่อนไข Policy ให้อ่านและเขียนข้อมูลได้
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Allow all operations for profiles') THEN
    CREATE POLICY "Allow all operations for profiles" ON public.profiles FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Allow all operations for activities') THEN
    CREATE POLICY "Allow all operations for activities" ON public.activities FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Allow all operations for purchases') THEN
    CREATE POLICY "Allow all operations for purchases" ON public.purchases FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Allow all operations for topups') THEN
    CREATE POLICY "Allow all operations for topups" ON public.topups FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Allow all operations for items') THEN
    CREATE POLICY "Allow all operations for items" ON public.items FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Allow all operations for coupons') THEN
    CREATE POLICY "Allow all operations for coupons" ON public.coupons FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Allow all operations for claimed_jackpots') THEN
    CREATE POLICY "Allow all operations for claimed_jackpots" ON public.claimed_jackpots FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Allow all operations for system_config') THEN
    CREATE POLICY "Allow all operations for system_config" ON public.system_config FOR ALL USING (true);
  END IF;
END $$;

-- 10. ดึงประวัติการซื้อจากตาราง activities กลับมายังตาราง purchases (สำหรับคนที่ประวัติหาย)
INSERT INTO public.purchases (username, item_name, price, quantity, gacha_drops, game, created_at)
SELECT username, item_name, price, quantity, gacha_drops, game, timestamp
FROM public.activities
WHERE type = 'purchase'
AND NOT EXISTS (
  SELECT 1 FROM public.purchases p 
  WHERE p.username = activities.username 
  AND p.item_name = activities.item_name 
  AND p.created_at = activities.timestamp
);

-- 11. ดึงประวัติการเติมเงินจากตาราง activities กลับมายังตาราง topups (หากเคยมีบันทึกไว้)
INSERT INTO public.topups (username, amount, created_at, game)
SELECT username, price, timestamp, game
FROM public.activities
WHERE type = 'topup'
AND NOT EXISTS (
  SELECT 1 FROM public.topups t 
  WHERE t.username = activities.username 
  AND t.amount = activities.price 
  AND t.created_at = activities.timestamp
);
