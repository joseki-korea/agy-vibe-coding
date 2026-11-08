---
{"id": "agy-vibe-coding/wiki/index", "title": "위키 색인", "summary": "위키 페이지 목록", "domain": "inventory", "tags": ["wiki"], "owner": "repository maintainers", "status": "DRAFT", "created": "2026-11-08", "updated": "2026-11-08", "source": ["docs/wiki/pages/concepts/row-level-security.md", "docs/wiki/pages/entities/inventory-item.md", "docs/wiki/pages/faq.md", "docs/wiki/pages/howto/local-development.md", "docs/wiki/pages/modules/app.md", "docs/wiki/pages/modules/stock-modal.md", "docs/wiki/pages/modules/supabase.md", "docs/wiki/pages/overview.md"], "lang": "ko", "sensitivity": "public", "related": []}
---

# 위키 색인

- [행 수준 보안](pages/concepts/row-level-security.md) — 재고 품목과 거래 테이블에는 행 수준 보안이 활성화된다. [source: test_inventory_schema.sql#L30 @eb6d6fb9]
- [재고 품목](pages/entities/inventory-item.md) — 재고 품목에는 소유자, 품목 코드, 수량, 안전재고와 상태 필드가 있다. [source: test_inventory_schema.sql#L4 @eb6d6fb9]
- [자주 묻는 질문](pages/faq.md) — Q. 자신의 데이터를 추가·수정·삭제하려면? A. 회원가입 후 확인 메일을 열고 로그인한다. [source: README.md#L49 @88905af0]
- [로컬 개발](pages/howto/local-development.md) — 로컬 개발 절차는 npm install, 환경 파일 복사, npm run dev 순서다. [source: README.md#L21 @88905af0]
- [앱 상태와 데이터 조회](pages/modules/app.md) — 앱은 Supabase가 설정되고 세션이 있을 때 test_inventory_items를 조회한다. [source: src/App.jsx#L43 @25a99c77]
- [입출고 모달](pages/modules/stock-modal.md) — 입출고 모달은 현재 수량과 안전재고를 사용해 예상 수량과 재고 상태를 계산한다. [source: src/components/StockModal.jsx#L17 @72302b12]
- [Supabase 클라이언트](pages/modules/supabase.md) — 클라이언트 설정은 두 Vite 환경변수 값을 읽으며 값이 유효하지 않으면 클라이언트를 생성하지 않는다. [source: src/lib/supabase.js#L3 @0c273b20]
- [저장소 개요](pages/overview.md) — 이 저장소는 React와 Supabase Auth/RLS 등을 배우는 비개발자용 재고관리 예제다. [source: README.md#L19 @88905af0]

## 에이전트 문서 (docs/agents)
- [핸드오프 규칙](../agents/handoffs/README.md) — 넘김 기록의 이름·ACK·보관 규칙
- [핸드오프 양식](../agents/handoffs/TEMPLATE.md) — 새 핸드오프를 만들 때 복사하는 양식
- [정리 담당](../agents/ROLE-janitor.md) — 임시 파일과 복제본 정리 규칙
- [감시 담당](../agents/ROLE-watchdog.md) — 정체·디스크·규칙 위반 감시 규칙
- [훅 목록](../agents/HOOKS.md) — 이 레포의 실제 훅 목록
