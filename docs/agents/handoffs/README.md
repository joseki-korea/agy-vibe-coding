---
id: "agy-vibe-coding/docs/agents/handoffs/README"
title: "핸드오프 폴더 규칙"
summary: "멀티에이전트 작업 넘김 기록의 이름·작성·ACK·보관 규칙"
domain: "agents"
tags: ["handoff", "multi-agent", "rules"]
owner: "repository maintainers"
status: "DRAFT"
created: "2026-11-08"
updated: "2026-11-08"
source: ["docs/agents/handoffs/TEMPLATE.md"]
lang: "ko"
sensitivity: "internal"
related: ["docs/agents/handoffs/TEMPLATE.md", "docs/agents/ROLE-janitor.md", "docs/agents/ROLE-watchdog.md", "docs/agents/HOOKS.md"]
---

# 핸드오프 폴더 (docs/agents/handoffs)

작업 세션끼리 일을 넘길 때 쓰는 기록 폴더다. 넘기는 쪽이 파일을 만들고, 받는 쪽이 확인 줄을 남기고, 끝나면 보관함으로 옮긴다.

## 파일 이름
`YYYYMMDD-HHMM-<보낸쪽>-to-<받는쪽>-<주제>.md`
- 예: `20261108-1430-claude-to-codex-login-fix.md`
- 보낸쪽·받는쪽: 역할 이름 (claude, codex, antigravity, janitor, watchdog, owner)
- 주제: 영문 소문자와 하이픈만 쓴다.

## 규칙
1. 새 핸드오프는 `active/`에 만든다. [TEMPLATE.md](TEMPLATE.md)를 복사해서 쓴다.
2. append-only: 한 번 쓴 본문은 고치거나 지우지 않는다. 내용이 바뀌면 아래에 새 줄을 덧붙인다.
3. 받은 쪽은 파일 끝의 `## ACK` 아래에 한 줄을 추가한다. 형식: `- ACK <받는쪽> <YYYY-MM-DD HH:MM> <sha8 또는 ->: 확인함`
4. 일이 끝나면 `archive/`로 옮긴다 (`git mv`, 별도 커밋). 옮긴 뒤에도 내용은 그대로 둔다.
5. 비밀번호·토큰·키·개인 식별 정보는 쓰지 않는다. 필요하면 파일 위치만 적는다.
6. 근거는 `경로#줄 @sha8` 형식으로 적는다. 예: `src/App.jsx#L12 @1a2b3c4d`
- 루트 `handoffs/` 폴더는 기존 기록이라 이 규칙의 대상이 아니다.

## 절차
1. 보낸 쪽: `active/`에 파일 작성 → 커밋 → 받는 쪽에 파일 경로 전달
2. 받는 쪽: 내용 확인 → ACK 줄 추가 → 커밋
3. 완료: 받는 쪽 또는 정리 담당이 `archive/`로 이동 → 커밋

## 관련 문서
- [TEMPLATE.md](TEMPLATE.md) · [정리 담당](../ROLE-janitor.md) · [감시 담당](../ROLE-watchdog.md) · [훅 목록](../HOOKS.md)
