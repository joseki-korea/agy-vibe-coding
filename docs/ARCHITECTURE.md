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
This document specifies the current baseline directory structure, target standard architecture, migration mappings, safety verifications, and rollback protocols for `agy-vibe-coding`.

## 2. Baseline Architecture (CURRENT Tree)
Pre-migration directory layout on default branch `origin/main` (depth ≤ 3):

- `public/`
- `scripts/`
- `src/`
- `src/assets/`
- `src/components/`
- `src/lib/`

## 3. Target Standard Architecture (TARGET Tree)
Target directory structure conforming to `REPO-STANDARD-ALL-20261107`:

- `assets/`
- `assets/binaries/`
- `assets/components/`
- `assets/images/`
- `assets/src/`
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
| `antigravity-manual-reevaluation.md` | `docs/antigravity-manual-reevaluation.md` | Already Staged (`pending design PASS`) | Standalone documentation reorganization |
| `non-developer-manual-improvements.md` | `docs/non-developer-manual-improvements.md` | Already Staged (`pending design PASS`) | Standalone documentation reorganization |
| `vibe-coding-one-prompt-setup.md` | `docs/vibe-coding-one-prompt-setup.md` | Already Staged (`pending design PASS`) | Standalone documentation reorganization |

> [!NOTE]
> All relocations staged in this PR are held in status `pending design PASS`. No additional filesystem relocations will be performed without explicit reviewer approval.

## 5. Move-Safety Validation & Grep Evidence
Verification that file relocations do not disrupt import paths, runtime execution, or build automation:

- **Path**: `antigravity-manual-reevaluation.md` → `docs/antigravity-manual-reevaluation.md`
  - Import/Require Scan: Clean (no runtime code dependencies)
  - Build/CI Config Scan: Clean (not referenced in build workflows)
  - Evidence: 3 reference(s) found in repository documentation links.

- **Path**: `non-developer-manual-improvements.md` → `docs/non-developer-manual-improvements.md`
  - Import/Require Scan: Clean (no runtime code dependencies)
  - Build/CI Config Scan: Clean (not referenced in build workflows)
  - Evidence: 3 reference(s) found in repository documentation links.

- **Path**: `vibe-coding-one-prompt-setup.md` → `docs/vibe-coding-one-prompt-setup.md`
  - Import/Require Scan: Clean (no runtime code dependencies)
  - Build/CI Config Scan: Clean (not referenced in build workflows)
  - Evidence: 11 reference(s) found in repository documentation links.

## 6. Migration Execution & Rollback Plan

### Migration Protocol
1. File movements are performed exclusively via `git mv` to preserve commit history.
2. Ingestible documentation files are indexed in `rag-manifest.json` with verified SHA8 signatures.
3. Build and test scripts are executed post-relocation to confirm zero functional regression.

### Rollback Commands
In the event that reviewer assessment requires reverting staged relocations, execute:
```bash
git mv 'docs/antigravity-manual-reevaluation.md' 'antigravity-manual-reevaluation.md'
git mv 'docs/non-developer-manual-improvements.md' 'non-developer-manual-improvements.md'
git mv 'docs/vibe-coding-one-prompt-setup.md' 'vibe-coding-one-prompt-setup.md'
```
