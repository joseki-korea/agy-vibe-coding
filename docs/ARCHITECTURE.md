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
- `antigravity_site_preview.jpg`
- `dashboard_preview.jpg`
- `github_repository_preview.jpg`
- `index.html`
- `mcp.json`
- `non-developer-manual-improvements.md`
- `package-lock.json`
- `package.json`
- `supabase_dashboard_preview.jpg`
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
- `antigravity_site_preview.jpg`
- `dashboard_preview.jpg`
- `github_repository_preview.jpg`
- `index.html`
- `mcp.json`
- `non-developer-manual-improvements.md`
- `package-lock.json`
- `package.json`
- `rag-manifest.json`
- `supabase_dashboard_preview.jpg`
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
