-- ========================================================
-- Supabase Schema for Vibe Inventory Management System
-- ========================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '일반',
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_quantity INT NOT NULL DEFAULT 10 CHECK (min_quantity >= 0),
    unit_price INT NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Inventory Logs Table
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
    amount INT NOT NULL CHECK (amount > 0),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Anonymous / Public Access
CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert on products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read on inventory_logs" ON public.inventory_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on inventory_logs" ON public.inventory_logs FOR INSERT WITH CHECK (true);

-- 5. Insert Initial Sample Data
INSERT INTO public.products (sku, name, category, quantity, min_quantity, unit_price)
VALUES 
    ('SKU-1001', '유기농 제주 감귤 5kg', '식품/신선', 45, 15, 25000),
    ('SKU-1002', '프리미엄 원두 커피 1kg', '음료/차', 8, 10, 32000),
    ('SKU-1003', '친환경 종이컵 1000개입', '소모품', 120, 30, 18000),
    ('SKU-1004', '스테인리스 텀블러 500ml', '잡화', 4, 10, 22000),
    ('SKU-1005', '콜드브루 추출 원액 500ml', '음료/차', 25, 8, 15000)
ON CONFLICT (sku) DO NOTHING;

-- 6. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_logs;
