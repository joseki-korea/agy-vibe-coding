---
id: "agy-vibe-coding/RULES.md"
title: "Repository Global Rules Pointer"
repo: "joseki-korea/agy-vibe-coding"
device_scope: "all"
doc_type: "rules"
tags:
  - "rules"
  - "pointer"
status: "DRAFT"
updated: "2026-11-07"
source_of_truth: "docs/RULES.md"
summary: Repository Global Rules Pointer
domain: repository
owner: repository maintainers
created: '2026-11-07'
source: RULES.md
lang: ko
sensitivity: public
related:
- RULES.md
---

# Repository Global Rules — agy-vibe-coding

본 문서는 `agy-vibe-coding` 레포지토리 전역에서 준수해야 할 개발 및 세션 운영 규칙 포인터입니다.

## 1. 핵심 전역 규칙 요약
1. **기획 우선 및 설계 검토 통과 원칙**: 사전 승인 없는 임의 파일 이동(`git mv`) 및 파괴적 변경 절대 금지.
2. **세션 위생 및 30% 핸드오프**: 컨텍스트 30% 도달 시 `handoffs/`에 인수인계 기록 작성 후 정리.
3. **비밀정보 보호 (Zero Secret Leaks)**: API 키, 토큰, 환경변수(`.env`) 커밋 전면 차단.
4. **엄격한 3자 검토 게이트**: 변경 사항은 상호 검증 및 테스트 검증(90점 이상) 후 반영.

## 2. 정본 문서 안내
전체 세부 규칙 및 행동 지침은 아래 정본 문서를 참고하십시오:
👉 **[docs/RULES.md](docs/RULES.md)**

## 핸드오프 절차
1. 일을 넘길 때는 `docs/agents/handoffs/active/`에 TEMPLATE.md 복사본을 만든다.
2. 파일명, append-only, ACK, archive 규칙은 [핸드오프 규칙](docs/agents/handoffs/README.md)을 따른다.
3. 끝난 핸드오프는 `docs/agents/handoffs/archive/`로 옮긴다.
