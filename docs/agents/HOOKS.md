---
id: "agy-vibe-coding/docs/agents/HOOKS"
title: "훅 목록 (실측)"
summary: "이 레포에 실제로 있는 Claude Code·Codex·git·CI·npm 훅 목록과 안전한 추가 방법"
domain: "agents"
tags: ["hooks", "ci", "git", "claude-code", "codex"]
owner: "repository maintainers"
status: "DRAFT"
created: "2026-11-08"
updated: "2026-11-08"
source: ["package.json"]
lang: "ko"
sensitivity: "internal"
related: ["docs/agents/ROLE-watchdog.md", "docs/agents/ROLE-janitor.md"]
---

# 훅 목록 (실측)

측정 기준: 2026-11-08, 커밋 @8a680b90, PR #1. 아래 목록은 실제 파일을 읽어 채웠다. 추측으로 넣은 항목은 없다.

## 요약
| 종류 | 발견 수 |
|---|---|
| Claude Code (.claude/settings*.json hooks) | 0 |
| Codex (.codex/) | 0 |
| git (.githooks, .husky, pre-commit/lefthook) | 0 |
| CI (.github/workflows) | 0 |
| npm 스크립트 (라이프사이클) | 0 |
| 합계 | 0 |

## 1. Claude Code 훅
없음(실측)

## 2. Codex 훅
없음(실측)

## 3. git 훅
없음(실측)

## 4. CI (GitHub Actions)
없음(실측)

## 5. npm 라이프사이클 스크립트
없음(실측)

## 실패 시 동작 (종류별)
- Claude Code: 명령이 실패하면 해당 이벤트의 처리 결과에 따른다. 차단 여부는 공식 문서 기준.
- git 훅: 종료 코드가 0이 아니면 커밋·푸시가 멈춘다.
- CI: 워크플로 실패로 표시되며 병합 판단에 쓰인다.
- npm 라이프사이클: 설치나 준비 단계가 실패하면 설치가 멈춘다.

## 추가 방법 (안전 규칙)
1. 비밀 금지: 토큰·키·비밀번호를 훅 파일에 적지 않는다. 환경 변수나 비밀 저장소를 쓴다.
2. 네트워크 최소: 훅에서 외부 호출을 하지 않는다. 필요하면 명시적으로 기록한다.
3. 되돌리기: 훅은 설정 한 줄 또는 파일 하나로 끌 수 있어야 한다.
4. 빠르게: 로컬 훅은 짧게 끝내고, 무거운 검사는 CI로 보낸다.
5. 검토: 훅을 추가하는 변경은 PR에서 이 문서를 함께 고친다.

- Claude Code: `.claude/settings.json`의 `hooks`에 이벤트·매처·명령을 추가한다.
- git: `.githooks/`에 스크립트를 두고 `git config core.hooksPath .githooks`로 연결한다. 연결 방법은 레포 README에 적는다.
- CI: `.github/workflows/`에 새 파일을 추가하고 `permissions`를 최소로 준다.
