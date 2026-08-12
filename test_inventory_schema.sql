-- ========================================================
-- 안티그래비티 바이브코딩 테스트용 신규 재고관리 DB 스키마
-- ========================================================

-- 1. 창고 정보 테이블 (test_warehouses)
CREATE TABLE IF NOT EXISTS public.test_warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    manager_contact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 신규 재고 제품 테이블 (test_inventory_items)
CREATE TABLE IF NOT EXISTS public.test_inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '일반',
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    safety_stock INT NOT NULL DEFAULT 10 CHECK (safety_stock >= 0),
    unit_price INT NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    warehouse_id UUID REFERENCES public.test_warehouses(id) ON DELETE SET NULL,
    warehouse_location TEXT DEFAULT '본사 A동 창고',
    status TEXT DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'LOW_STOCK', 'OUT_OF_STOCK')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 신규 입출고 이력 테이블 (test_inventory_transactions)
CREATE TABLE IF NOT EXISTS public.test_inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES public.test_inventory_items(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('INBOUND', 'OUTBOUND', 'ADJUSTMENT')),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price INT NOT NULL DEFAULT 0,
    handler_name TEXT DEFAULT '안티그래비티 에이전트',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS 보안 정책 설정 (공용 테스트 허용)
ALTER TABLE public.test_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on test_warehouses" ON public.test_warehouses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on test_inventory_items" ON public.test_inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on test_inventory_transactions" ON public.test_inventory_transactions FOR ALL USING (true) WITH CHECK (true);

-- 5. 샘플 데이터 시드 (초기 테스트용 데이터)
INSERT INTO public.test_warehouses (name, location, manager_contact)
VALUES 
    ('제1 메인 물류센터', '경기도 용인시 기흥구', '010-1234-5678'),
    ('제2 남부 수도권 창고', '인천광역시 서구 물류단지', '010-9876-5432')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.test_inventory_items (item_code, name, category, stock_quantity, safety_stock, unit_price, warehouse_location, status)
VALUES 
    ('AGY-TEST-001', '안티그래비티 AI 센서 모듈 v1', '전자부품', 150, 30, 45000, '창고 A-12', 'NORMAL'),
    ('AGY-TEST-002', '고성능 임베디드 코어 제어판', '핵심부품', 8, 15, 120000, '창고 B-03', 'LOW_STOCK'),
    ('AGY-TEST-003', '초고속 데이터 전송 케이블 2m', '소모품', 500, 100, 8500, '창고 A-05', 'NORMAL'),
    ('AGY-TEST-004', '지능형 모터 드라이버 가이드', '기계부품', 3, 10, 89000, '창고 C-01', 'LOW_STOCK'),
    ('AGY-TEST-005', '알루미늄 프레임 거치대 (대형)', '외장재', 85, 20, 35000, '창고 A-08', 'NORMAL')
ON CONFLICT (item_code) DO NOTHING;

-- 6. Supabase Realtime 게시 등록
ALTER PUBLICATION supabase_realtime ADD TABLE public.test_inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.test_inventory_transactions;
