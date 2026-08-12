# 🚀 AGY Vibe Coding: Supabase + Cloudflare Pages 재고관리 시스템

Antigravity CLI 기반 **GitHub + Supabase + Cloudflare Pages** 100% 활용 바이브 코딩 마스터 프로젝트입니다.

---

## 🌟 주요 특징

1. **대시보드 UI (Vite + React + Lucide Icons)**
   - 보유 재고 수량, 안전재고 미만 경고 알림, 총 재고 자산 평가액 자동 계산
   - SKU 및 제품명 실시간 검색 & 카테고리 필터링
   - 재고 입출고(Inbound / Outbound) 등록 및 사유 기록 Modal
   - 신규 상품 등록 및 삭제 기능

2. **Supabase 데이터베이스 연동**
   - [`supabase_schema.sql`](./supabase_schema.sql): PostgreSQL 테이블 (`products`, `inventory_logs`), RLS 보안 정책, 샘플 데이터
   - Supabase Realtime 라이브 연동 및 안전한 Mock Local Fallback 모드 제공

3. **Cloudflare Pages 프로덕션 배포**
   - 배포 URL: [https://vibe-inventory.pages.dev](https://vibe-inventory.pages.dev)

---

## 📁 프로젝트 구조

```
agy-vibe-coding/
├── antigravity-cli-inventory-vibe-coding-manual.html  # 바이브 코딩 마스터 가이드
├── supabase_schema.sql                                # Supabase DB 스크립트
├── .env.local                                         # 환경 변수 (Git 제외)
├── src/
│   ├── App.jsx                                        # 메인 대시보드 컴포넌트
│   └── lib/
│       └── supabase.js                                # Supabase 클라이언트 SDK
├── package.json
└── vite.config.js
```

---

## 🛠️ 실행 방법

```bash
# 1. 의존성 패키지 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 프로덕션 빌드
npm run build

# 4. Cloudflare Pages 배포
npx wrangler pages deploy ./dist --project-name=vibe-inventory
```
