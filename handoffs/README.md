---
id: agy-vibe-coding/handoffs/README.md
title: Agent Session Handoff Records
repo: joseki-korea/agy-vibe-coding
device_scope: all
doc_type: handoff
tags:
  - handoff
  - session-notes
status: DRAFT
updated: '2026-11-07'
source_of_truth: handoffs/README.md
---

# Agent Session Handoff Records

## Purpose
This directory stores operational handoff logs between agent sessions.

## Recording Guidelines
- Session handoff notes must be append-only.
- Each handoff file must include YAML frontmatter specifying session identifier, host tag, date, and status.
- Sensitive credentials or secrets must never be placed in handoff notes.
