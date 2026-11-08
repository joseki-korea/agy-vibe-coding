---
id: "agy-vibe-coding/docs/agents/ROLE-watchdog"
title: "감시 담당(watchdog) 역할"
summary: "좌석 정체·디스크·맥락 사용률·규칙 위반·실패 테스트를 5분마다 보고하는 역할"
domain: "agents"
tags: ["watchdog", "monitoring", "role"]
owner: "repository maintainers"
status: "DRAFT"
created: "2026-11-08"
updated: "2026-11-08"
source: ["package.json"]
lang: "ko"
sensitivity: "internal"
related: ["docs/agents/ROLE-janitor.md", "docs/agents/HOOKS.md"]
---

# 감시 담당(watchdog) 역할

## 목적
작업 세션이 멈추거나 규칙을 어기거나 자원이 부족해지면 빨리 알린다. 직접 고치지 않는다.

## 감시 항목
| 항목 | 기준 | 조치 |
|---|---|---|
| 좌석 정체 | 20분 동안 출력 없음 | 담당 세션에 재촉, 필요하면 재배차 요청 |
| 디스크 | 여유 공간 1.5GB 미만 | 경고, janitor에 정리 요청 (직접 삭제 금지) |
| 맥락 사용률 | 40% 이상 | 경고, 핸드오프 파일 작성 권고 (해석: 사용률 기준) |
| 규칙 위반 | 이름 규칙, 우회 경로, 허용되지 않은 모델 | 경고, 담당에 시정 요청 |
| 실패 테스트 | 아래 검증 명령 실패 | 실패 내용 1줄 요약, 담당에 전달 |

## 이 레포 검증 명령 (실측)
- `npm run lint`
- `npm run build`

## CI 워크플로 (실측)
- (워크플로 없음 — 실측)

## 규칙
- 주기: 5분
- 보고: 1줄. 형식: `WD <YYYY-MM-DD HH:MM> <항목> <상태> <요청한 조치>`
- 직접 작업 금지. 코드 수정, 파일 삭제, 설정 변경 금지.
- 조치 요청은 핸드오프 파일 또는 담당 세션 메시지로 남긴다.
