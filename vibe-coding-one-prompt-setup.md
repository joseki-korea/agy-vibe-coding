# Antigravity CLI 전용 원샷(One-Shot) 바이브 코딩 세팅 지침서 (`vibe-coding-one-prompt-setup.md`)

이 마크다운 파일은 **안티그래비티 CLI(Antigravity CLI)** 환경에서 파일 경로만 입력하면, 프로젝트 생성부터 데이터베이스 연동, 빌드, 보안 검증, 배포까지 **단 한 번에 자동 실행(One-Shot Execution)**되도록 설계된 통합 지침서입니다.

---

## 🚀 사용법 (CLI 입력 방법)

터미널이나 PowerShell에서 아래 명령어 중 하나를 실행하고, 이 마크다운 파일의 경로를 전달하세요.

```bash
# 방법 1: 상대 경로 전달 (권장)
agy "Read ./vibe-coding-one-prompt-setup.md and execute all phases sequentially from scratch to deployment"

# 방법 2: 한글 프롬프트 입력
agy "./vibe-coding-one-prompt-setup.md 지침서를 읽고 재고 관리 웹 앱을 처음부터 Cloudflare 배포까지 원샷 구축해줘"
```

---

## 📋 자동 실행 지침 (AI 에이전트 가이드)

AI 에이전트(Antigravity CLI)는 이 지침을 수신하면 다음 **4개 Phase**를 차례대로 자동 수행해야 합니다.

### Phase 1: 로컬 Vite + React 대시보드 프로젝트 생성

1. 현재 디렉토리에 `Vite + React` 기반의 실시간 재고 관리 웹 앱을 초기화합니다.
2. 필요한 패키지(`lucide-react`, `@supabase/supabase-js`)를 설치합니다.
3. 다음 핵심 UI 요소를 구현합니다:
   - **대시보드 상단 카드 3종**: 전체 보유 재고량, 안전재고 부족 품목(경고), 총 재고 자산 평가액(원화 ₩).
   - **인터랙티브 바 차트**: 카테고리별(`전자부품`, `핵심부품`, `소모품`, `기계부품`) 재고 분포 시각화 및 바 클릭 시 자동 필터링.
   - **실시간 필터링 툴바**: SKU 코드/품목명 검색창, 카테고리 선택 드롭다운, 초기화 버튼.
   - **입출고 Modal**: 수량 변경(`+ 입고`, `- 출고`) 처리 및 안전재고 이하 자동 `LOW_STOCK` 상태 반영.
   - **하단 브랜딩 푸터**: `Created by Solucionemos (솔루시오네모스) | Powered by Antigravity AI Engine`

---

### Phase 2: Supabase DB 스키마 생성 및 보안 설정

1. Supabase 프로젝트에 다음 `test_inventory_schema.sql` 스크립트를 실행합니다:
   ```sql
   CREATE TABLE IF NOT EXISTS public.test_inventory_items (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
     item_code TEXT NOT NULL,
     name TEXT NOT NULL,
     category TEXT NOT NULL DEFAULT '일반',
     stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
     safety_stock INTEGER NOT NULL DEFAULT 10 CHECK (safety_stock >= 0),
     unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
     warehouse_location TEXT NOT NULL DEFAULT '창고 A-1',
     status TEXT NOT NULL DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'LOW_STOCK', 'OUT_OF_STOCK')),
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     UNIQUE (owner_id, item_code)
   );

   ALTER TABLE public.test_inventory_items ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users select own inventory" ON public.test_inventory_items 
       FOR SELECT TO authenticated USING ((select auth.uid()) = owner_id);
   CREATE POLICY "Users insert own inventory" ON public.test_inventory_items 
       FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = owner_id);
   CREATE POLICY "Users update own inventory" ON public.test_inventory_items 
       FOR UPDATE TO authenticated USING ((select auth.uid()) = owner_id);
   CREATE POLICY "Users delete own inventory" ON public.test_inventory_items 
       FOR DELETE TO authenticated USING ((select auth.uid()) = owner_id);
   ```
2. `.env.local` 파일을 생성하고 Publishable Key를 설정합니다:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
   ```
3. Secret Key / Service Role Key는 `.env.local`에 포함하지 않도록 검증합니다.

---

### Phase 3: SPA 404 방지 설정 및 Cloudflare Pages 배포

1. `public/_redirects` 파일을 생성하고 아래 라인을 작성하여 SPA 새로고침 404를 방지합니다:
   ```text
   /* /index.html 200
   ```
2. 프로덕션 빌드를 수행합니다:
   ```bash
   npm run build
   ```
3. Cloudflare Pages로 즉시 프로덕션 배포를 완료합니다:
   ```bash
   npx wrangler pages deploy ./dist --project-name=vibe-inventory
   ```

---

### Phase 4: GitHub 비밀 보호 및 저장소 동기화

1. `.gitignore`에 `.env.local`, `node_modules`, `dist`가 올바르게 등록되어 비밀키가 GitHub에 유출되지 않도록 차단합니다.
2. Conventional Commits 규격에 맞춰 커밋을 작성합니다:
   ```bash
   git add .
   git commit -m "feat: complete one-shot vibe coding setup for vibe-inventory"
   git push origin main
   ```

---

## ✅ 최종 출력 결과물 (CLI 완료 리포트)

모든 작업이 끝나면 Antigravity CLI는 아래 정보를 출력해야 합니다:

- 🟢 **로컬 테스트 URL**: `http://localhost:5173`
- 🌐 **Cloudflare Pages 라이브 URL**: `https://vibe-inventory.pages.dev`
- 🐙 **GitHub 저장소 URL**: `https://github.com/joseki-korea/agy-vibe-coding`
- 🛡️ **보안 상태**: RLS 역할 분리 및 비밀키 `.gitignore` 보호 완료
