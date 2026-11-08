# 모델 세션 규칙

## Status
DRAFT

## 상속 (Inheritance)
전역 vault 규칙에서 이 파일로 상속한다. 지역 규칙은 전역 규칙을 완화할 수 없다.

## 모델 배치 (Model placement)
메인 및 페르소나 세션은 Claude Opus를 사용한다. 작업 좌석은 Codex Terra, Antigravity, Claude Haiku가 병렬로 작업하며 저장소 또는 파일마다 한 좌석만 담당한다.

## 이름 (Naming)
`<device4>-<session4>-<model>-<role>` 형식 (예: `NWKW-a1b2-terra-fix`).

## 컨텍스트 (Context)
컨텍스트가 40% 이상이거나 자동 압축이 한 번 발생하면 `handoffs/active/`에 역할, 진행, 대기, 다음 단계, ledger 경로를 2000토큰 이하로 기록한다. 후속 좌석이 인계를 이어받고 이전 좌석은 대기한다. slash-reset 주입은 사용하지 않는다.

## 승인 (Approval)
merge, force push, deploy, delete는 CEO 승인이 필요하다.
