---
id: agy-vibe-coding/docs/ARCHITECTURE.md
title: "Repository Architecture and Migration Design"
repo: joseki-korea/agy-vibe-coding
device_scope: all
doc_type: architecture
tags:
  - architecture
  - directory-design
  - migration-plan
status: DRAFT
updated: '2026-11-07'
source_of_truth: docs/ARCHITECTURE.md
summary: Repository Architecture and Migration Design
domain: repository
owner: repository maintainers
created: '2026-11-07'
source: docs/ARCHITECTURE.md
lang: ko
sensitivity: public
related:
- RULES.md
---

# Repository Architecture and Migration Design

## 1. Overview
This document specifies the baseline directory structure, target standard architecture, migration mappings, safety verifications, and rollback protocols for `agy-vibe-coding` conforming to `REPO-STANDARD-ALL-20261107`.

## 2. Baseline Architecture (CURRENT Tree)

### Tracked Root Files (origin/main)
- `.env.example`
- `.gitignore`
- `.oxlintrc.json`
- `README.md`
- `antigravity-manual-reevaluation.md`
- `assets/images/screenshots/antigravity-site-preview.jpg`
- `assets/images/screenshots/dashboard-preview.jpg`
- `assets/images/screenshots/github-repository-preview.jpg`
- `index.html`
- `mcp.json`
- `non-developer-manual-improvements.md`
- `package-lock.json`
- `package.json`
- `assets/images/screenshots/supabase-dashboard-preview.jpg`
- `supabase_schema.sql`
- `test_inventory_schema.sql`
- `vibe-coding-one-prompt-setup.md`
- `vite.config.js`
- `안티그래비티-매뉴얼.html`
- `안티그래비티_바이브코딩_매뉴얼.html`

### Tracked Directory Hierarchy (origin/main, depth ≤ 3)
- `public/`
- `scripts/`
- `src/`
- `src/assets/`
- `src/components/`
- `src/lib/`

## 3. Target Standard Architecture (TARGET Tree)

### Tracked Root Files (Target)
- `.env.example`
- `.gitignore`
- `.oxlintrc.json`
- `README.md`
- `antigravity-manual-reevaluation.md`
- `assets/images/screenshots/antigravity-site-preview.jpg`
- `assets/images/screenshots/dashboard-preview.jpg`
- `assets/images/screenshots/github-repository-preview.jpg`
- `index.html`
- `mcp.json`
- `non-developer-manual-improvements.md`
- `package-lock.json`
- `package.json`
- `rag-manifest.json`
- `assets/images/screenshots/supabase-dashboard-preview.jpg`
- `supabase_schema.sql`
- `test_inventory_schema.sql`
- `vibe-coding-one-prompt-setup.md`
- `vite.config.js`
- `안티그래비티-매뉴얼.html`
- `안티그래비티_바이브코딩_매뉴얼.html`

### Tracked Directory Hierarchy (Target, depth ≤ 3)
- `assets/`
- `assets/binaries/`
- `assets/components/`
- `assets/images/`
- `assets/src/`
- `assets/videos/`
- `docs/`
- `handoffs/`
- `public/`
- `scripts/`
- `src/`
- `src/assets/`
- `src/components/`
- `src/lib/`

## 4. Current → Target Mapping Table
Status of directory and file movements relative to `origin/main`:

| Source Baseline Path | Target Architecture Path | Migration Status | Classification / Rationale |
| :--- | :--- | :--- | :--- |
| N/A | N/A | None Staged | Canonical layout established via additive standard scaffolding |

> [!NOTE]
> All relocations staged in this PR are held in status `pending design PASS`. No additional filesystem relocations will be performed without explicit reviewer approval.

## 5. Move-Safety Validation & Grep Evidence
Verification that file relocations do not disrupt import paths, runtime execution, or build automation:

- No file relocations staged in this branch; all files retain original locations.

## 6. Migration Execution & Rollback Plan

### Migration Protocol
1. File movements are performed exclusively via `git mv` to preserve commit history.
2. Ingestible documentation files are indexed in `rag-manifest.json` with verified SHA8 signatures.
3. Build and test scripts are executed post-relocation to confirm zero functional regression.

### Rollback Commands
In the event that reviewer assessment requires reverting staged relocations, execute:
```bash
# No relocations to roll back
```

## Code-derived components

`src/` contains the React application and UI components; `index.html` and `vite.config.js` define the Vite entry and build. The app uses Supabase client libraries for authentication and data access; the root SQL scripts describe database tables and policies. `public/` contains static assets.
