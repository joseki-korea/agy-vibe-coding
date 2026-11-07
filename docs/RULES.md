---
id: agy-vibe-coding/docs/RULES.md
title: Repository Governance Rules
repo: joseki-korea/agy-vibe-coding
device_scope: all
doc_type: rules
tags:
  - rules
  - governance
  - draft
status: DRAFT
updated: '2026-11-07'
source_of_truth: docs/RULES.md
---

# Repository Governance Rules

## Canonical Governance References
This repository adheres to the organizational standards documented in `solucionemos-vault`:
- **Rule 00**: Operational governance and authorization boundaries. Irreversible external actions require executive authorization.
- **Rule 01**: Communication protocol and delivery confirmation standards.
- **Rule 02 / Rule 14**: Verification discipline. Assertions require objective validation through execution outputs, tests, or commit records. Speculation is prohibited.
- **Rule 04**: Session isolation and branch integrity. Unapproved modifications to shared branches are prohibited.
- **Rule 05**: Strict credential protection. Never commit authentication secrets, credentials, or sensitive headers into version control.

## Local Repository Guidelines
- Validate changes through local checks prior to review submission.
- Maintain atomic commits with descriptive messages.
- Preserve existing documentation and code structures.
