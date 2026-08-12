# 안전한 재고관리 실습 앱

Antigravity CLI, React, Supabase Auth/RLS, GitHub, Cloudflare Pages를 학습하기 위한 비개발자용 예제입니다.

## 시작하기

Node.js 22 이상을 권장합니다.

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에 Supabase Dashboard의 Project URL과 Publishable Key를 입력합니다.

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Secret Key와 Service Role Key는 브라우저 환경변수에 넣지 마세요.

## 데이터베이스 설정

Supabase Dashboard의 SQL Editor에서 [test_inventory_schema.sql](./test_inventory_schema.sql)을 실행합니다. 스크립트에는 다음이 포함됩니다.

- 사용자 소유권 기반 RLS
- 품목 및 입출고 이력 테이블
- Data API 명시적 권한
- 재고 변경과 이력 저장을 원자 처리하는 함수

이메일 회원가입 후 확인 메일을 열고 로그인해야 자신의 데이터를 추가·수정·삭제할 수 있습니다.

## 검증과 배포

```bash
npm run lint
npm run build
npx wrangler pages deploy ./dist --project-name=vibe-inventory
```

`public/_redirects`는 SPA 서브페이지 새로고침 시 발생하는 404를 방지합니다.

## 상세 매뉴얼

[비개발자용 Antigravity 실습 가이드](./antigravity-cli-inventory-vibe-coding-manual.html)

> 학습용 프로젝트입니다. 실제 고객 또는 회사 데이터를 사용하기 전에는 별도의 보안·백업·감사 검토가 필요합니다.
