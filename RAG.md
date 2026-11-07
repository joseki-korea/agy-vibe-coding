---
id: agy-vibe-coding/RAG.md
title: RAG indexing
summary: RAG indexing
domain: repository
tags:
- guide
owner: repository maintainers
status: DRAFT
created: '2026-11-08'
updated: '2026-11-08'
source: RAG.md
lang: en
sensitivity: public
related:
- RULES.md
repo: agy-vibe-coding
device_scope: all
doc_type: guide
source_of_truth: RAG.md
---

# RAG indexing

Use `rag-manifest.json` as the document index and `.ragignore` for exclusions. Index only material permitted for the intended audience. Preserve document IDs and verify hashes after edits. Exclude secrets, personal data, generated output, binaries and raw datasets. Review each source before embedding.
