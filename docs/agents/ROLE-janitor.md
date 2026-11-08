---
id: "agy-vibe-coding/docs/agents/ROLE-janitor"
title: "정리 담당(janitor) 역할"
summary: "작업 뒤 생긴 복제본·브랜치·핸드오프·임시 파일을 되돌릴 수 있는 방식으로 정리하는 역할"
domain: "agents"
tags: ["janitor", "cleanup", "role"]
owner: "repository maintainers"
status: "DRAFT"
created: "2026-11-08"
updated: "2026-11-08"
source: [".gitignore"]
lang: "ko"
sensitivity: "internal"
related: ["docs/agents/handoffs/README.md", "docs/agents/ROLE-watchdog.md"]
---

# 정리 담당(janitor) 역할

## 목적
작업이 끝난 뒤 남은 흔적을 정리해서 디스크와 작업 공간을 깨끗하게 유지한다.

## 정리 대상 (일반 규칙)
- 작업자가 만든 복제본·작업트리 중 깨끗하고 푸시까지 끝난 것
- 병합이 끝난 로컬 브랜치 (원격 브랜치 삭제는 하지 않는다)
- 오래된 핸드오프 → `docs/agents/handoffs/archive/`로 이동
- 임시 파일 (되돌릴 수 있는 것만: 휴지통 이동 또는 재생성 가능한 산출물)

## 금지
- 사용자가 수정 중인 파일과 커밋되지 않은 변경은 건드리지 않는다.
- 드라이브 전체 삭제, 원격 저장소·원격 브랜치 삭제 금지.
- 비밀 파일(`.env*`, 키 파일)은 읽거나 출력하거나 옮기지 않는다.
- git에 추적되는 파일은 정리 대상이 아니다.

## 절차: 목록 → 기록 → 실행 → 영수증
1. 목록: 후보 경로, 크기, 판단 근거를 적는다.
2. 기록: 목록을 핸드오프 파일로 남긴다 (`YYYYMMDD-HHMM-janitor-to-owner-cleanup.md`).
3. 실행: 되돌릴 수 있는 항목만 실행한다.
4. 영수증: 처리한 항목 수, 남긴 항목과 이유를 같은 파일에 덧붙인다.

## 이 레포 정리 대상 (실측, 2026-11-08, @8a680b90)

### 빌드·설치 산출물 (재생성 가능)
| 경로 | 크기(MB) | 판단 |
|---|---|---|
| (없음 — 실측) | - | - |

### 큰 최상위 폴더 (50MB 이상)
| 경로 | 크기(MB) | 판단 |
|---|---|---|
| (없음 — 50MB 이상 최상위 폴더 없음) | - | - |

### 임시 파일 후보 (추적되지 않는 것만)
- (없음 — 실측)
