---
id: agy-vibe-coding/docs/ROLES.md
title: "Agent Roles and Session Allocation"
repo: joseki-korea/agy-vibe-coding
device_scope: all
doc_type: roles
tags:
  - roles
  - orchestration
  - multi-agent
status: DRAFT
updated: '2026-11-07'
source_of_truth: docs/ROLES.md
summary: Agent Roles and Session Allocation
domain: repository
owner: repository maintainers
created: '2026-11-07'
source: docs/ROLES.md
lang: en
sensitivity: public
related:
- RULES.md
---

# Agent Roles and Session Allocation

## Architecture Overview
Operations in this repository follow a coordinated multi-agent model with segregated session responsibilities.

## Session Roles

### PM Session (Project Management and Dispatch)
- Claude serves as control and monitoring lead only.
- Oversees task intake, dependency mapping, and dispatching.
- Synthesizes findings from work sessions and prepares deliverables.
- Verifies adherence to repository standards before merging or publishing.

### Work Sessions
- Work sessions are **Codex Terra** and **Antigravity** only.
- **Antigravity (AGY)**: Full-stack implementation, architecture refactoring, and multi-file workflows.
- **Codex Terra**: Core computational routines, algorithmic implementation, and test suite automation.

### Janitor Session (Context-Overload Watchdog)
- Dedicated context watchdog monitoring session saturation.
- Enforces handoff and context clearance when saturation reaches 30 percent.
- Does not author features or modify application logic.
