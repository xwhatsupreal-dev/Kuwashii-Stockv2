-- Script สำหรับนำไปรันในช่อง SQL Editor ของ Supabase
-- เพื่อเพิ่มระบบแยกกระเป๋าเงิน (เครดิต) ของเกม ROV

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS balance_rov NUMERIC DEFAULT 0;
