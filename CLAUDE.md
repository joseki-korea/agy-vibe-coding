---
{"id": "agy-vibe-coding/CLAUDE.md", "title": "CLAUDE.md agent entrypoint", "summary": "Agent entrypoint and repository pointers", "domain": "repository", "tags": ["agent"], "owner": "repository maintainers", "status": "DRAFT", "created": "2026-11-07", "updated": "2026-11-08", "source": "CLAUDE.md", "lang": "ko", "sensitivity": "public", "related": ["RULES.md"], "repo": "agy-vibe-coding", "device_scope": "all", "doc_type": "roles", "source_of_truth": "CLAUDE.md"}
---

# Claude Agent Guidelines — agy-vibe-coding

본 문서는 `agy-vibe-coding` 프로젝트에서 Claude 에이전트의 역할과 행동 강령을 정의합니다.

## 1. 역할 범위: Control & Monitoring ONLY
- Claude는 **총괄 컨트롤 및 모니터링(Control / Monitoring ONLY)** 세션으로만 동작합니다.
- 기능 요구사항 분석, 작업 분할, 디스패치 지시, 품질 게이트 검수 및 최종 종합 보고를 전담합니다.
- 비즈니스 코드의 직접 작성, 소스코드 수정 또는 파일 이동 작업은 일절 수행하지 않습니다.

## 2. 작업 위임 지침
- 모든 실제 소스코드 구현 및 시스템 작업은 **Codex Terra** 또는 **Antigravity** 작업 세션으로 위임합니다.
- 상세 역할 및 규칙: 👉 **[docs/agents/claude-role.md](docs/agents/claude-role.md)** · **[docs/agents/claude-rules.md](docs/agents/claude-rules.md)**

## 멀티에이전트 핸드오프·정리·감시·훅 (docs/agents)
- 핸드오프 규칙: [docs/agents/handoffs/README.md](docs/agents/handoffs/README.md)
- 정리 담당: [docs/agents/ROLE-janitor.md](docs/agents/ROLE-janitor.md)
- 감시 담당: [docs/agents/ROLE-watchdog.md](docs/agents/ROLE-watchdog.md)
- 훅 목록: [docs/agents/HOOKS.md](docs/agents/HOOKS.md)
