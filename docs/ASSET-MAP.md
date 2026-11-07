---
id: "agy-vibe-coding/docs/ASSET-MAP.md"
title: "Asset Mapping and Semantic Migration Plan"
repo: "joseki-korea/agy-vibe-coding"
device_scope: "all"
doc_type: "architecture"
tags:
  - "architecture"
  - "assets"
  - "semantic-reorg"
status: "DRAFT"
updated: "2026-11-07"
source_of_truth: "docs/ASSET-MAP.md"
summary: Asset Mapping and Semantic Migration Plan
domain: repository
owner: repository maintainers
created: '2026-11-07'
source: docs/ASSET-MAP.md
lang: ko
sensitivity: public
related:
- RULES.md
---

# Asset Mapping & Semantic Reorganization Plan — agy-vibe-coding

본 문서는 `agy-vibe-coding` 레포지토리의 소스코드 및 에셋을 기능/모듈별로 시맨틱하게 재구성하기 위한 이동 계획 설계 테이블입니다.
**주의: 본 계획은 설계 단계(DESIGN ONLY)이며, 3자 검토자(Reviewer) PASS 이전까지는 실제 `git mv` 이동 작업을 일절 수행하지 않습니다 (0 moves executed).**

## 1. 시맨틱 이동 계획 테이블 (Semantic Move Plan Table)

| 원본 경로 (Source) | 목표 경로 (Target) | 모듈 성격 및 목적 | 진행 상태 |
|---|---|---|---|
| `antigravity_site_preview.jpg` | `assets/images/antigravity_site_preview.jpg` | 사이트 미리보기 이미지 | **PLANNED (DESIGN ONLY — 0 executed)** |
| `dashboard_preview.jpg` | `assets/images/dashboard_preview.jpg` | 대시보드 미리보기 이미지 | **PLANNED (DESIGN ONLY — 0 executed)** |
| `github_repository_preview.jpg` | `assets/images/github_repository_preview.jpg` | 깃허브 레포 미리보기 이미지 | **PLANNED (DESIGN ONLY — 0 executed)** |
| `public/dashboard_preview.jpg` | `assets/images/dashboard_preview.jpg` | 퍼블릭 정적 에셋 | **PLANNED (DESIGN ONLY — 0 executed)** |
| `supabase_dashboard_preview.jpg` | `assets/images/supabase_dashboard_preview.jpg` | 수파베이스 대시보드 미리보기 | **PLANNED (DESIGN ONLY — 0 executed)** |
| `src/assets/hero.png` | `assets/images/hero.png` | 히어로 섹션 이미지 | **PLANNED (DESIGN ONLY — 0 executed)** |
| `src/components/AddItemModal.jsx` | `assets/ui-components/AddItemModal.jsx` | 품목 추가 모달 컴포넌트 | **PLANNED (DESIGN ONLY — 0 executed)** |
| `src/components/AnalyticsCharts.jsx` | `assets/ui-components/AnalyticsCharts.jsx` | 분석 차트 UI 컴포넌트 | **PLANNED (DESIGN ONLY — 0 executed)** |
| `src/components/DashboardStats.jsx` | `assets/ui-components/DashboardStats.jsx` | 대시보드 통계 카드 컴포넌트 | **PLANNED (DESIGN ONLY — 0 executed)** |
| `src/components/InventoryInsights.jsx` | `assets/ui-components/InventoryInsights.jsx` | 재고 인사이트 컴포넌트 | **PLANNED (DESIGN ONLY — 0 executed)** |
| `src/components/InventoryTable.jsx` | `assets/ui-components/InventoryTable.jsx` | 재고 테이블 UI 그리드 | **PLANNED (DESIGN ONLY — 0 executed)** |
| `src/components/InventoryToolbar.jsx` | `assets/ui-components/InventoryToolbar.jsx` | 재고 툴바 액션 UI | **PLANNED (DESIGN ONLY — 0 executed)** |
| `src/components/StockModal.jsx` | `assets/ui-components/StockModal.jsx` | 재고 수정 모달 컴포넌트 | **PLANNED (DESIGN ONLY — 0 executed)** |
| `scripts/natural_db.js` | `src/lib/natural_db.js` | 데이터베이스 유틸리티 | **PLANNED (DESIGN ONLY — 0 executed)** |
| `supabase_schema.sql` | `src/db/supabase_schema.sql` | 수파베이스 스키마 정의 | **PLANNED (DESIGN ONLY — 0 executed)** |
| `test_inventory_schema.sql` | `src/db/test_inventory_schema.sql` | 테스트 스키마 정의 | **PLANNED (DESIGN ONLY — 0 executed)** |

## 2. 참조 갱신 계획 (Reference-Update Plan)
- 상기 이동 계획 실행 시 임포트 경로 및 관련 문서 상호 링크를 일괄 동기화할 예정입니다.
- 정적 리소스 및 빌드 설정 파일의 상대 경로 무결성을 사전에 검증합니다.

## 3. 빌드 및 테스트 검증 프로토콜 (Build/Test Verification Commands)
```bash
# 1. 파일 이동 전/후 무결성 검증 (Git 변경 요약)
git diff -M --summary origin/main

# 2. RAG 매니페스트 및 프론트엔드/백엔드 구동 검증
python3 -c "import json; json.load(open('rag-manifest.json'))"
```

## Observed image locations (proposed only)

- `antigravity_site_preview.jpg` → `assets/images/` (category and references require review).
- `dashboard_preview.jpg` → `assets/images/` (category and references require review).
- `github_repository_preview.jpg` → `assets/images/` (category and references require review).
- `public/dashboard_preview.jpg` → `assets/images/` (category and references require review).
- `public/favicon.svg` → `assets/images/` (category and references require review).
- `public/icons.svg` → `assets/images/` (category and references require review).
- `src/assets/hero.png` → `assets/images/` (category and references require review).
- `src/assets/react.svg` → `assets/images/` (category and references require review).
- `src/assets/vite.svg` → `assets/images/` (category and references require review).
- `supabase_dashboard_preview.jpg` → `assets/images/` (category and references require review).
