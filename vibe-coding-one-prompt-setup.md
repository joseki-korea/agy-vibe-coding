# Antigravity CLI 최소 개입 원샷 세팅

이 파일을 Antigravity CLI에 전달하면 현재 폴더의 재고관리 앱을 점검하고, 로컬 구축부터 Supabase 연결, 검증, GitHub 및 Cloudflare 배포까지 가능한 범위에서 연속 실행합니다.

사람의 개입은 다음 경우로 제한합니다.

1. 브라우저 OAuth 로그인
2. Supabase 프로젝트가 여러 개일 때 1회 선택
3. GitHub Push와 Cloudflare 프로덕션 배포를 시작하기 전 1회 통합 승인
4. 이메일 회원가입 확인 링크 클릭

비밀번호, Secret Key, Service Role Key, PAT를 이 파일에 적지 마세요.

## 실행 방법

이 파일이 있는 프로젝트 폴더에서 실행합니다.

```bash
agy
```

Antigravity 입력창에 다음 한 문장만 입력합니다.

```text
이 프로젝트의 vibe-coding-one-prompt-setup.md를 읽고 AUTO 모드로 끝까지 실행해줘. 필요한 OAuth는 브라우저로 열고, Supabase 프로젝트가 여러 개일 때와 최종 GitHub Push·Cloudflare 배포 직전에만 질문해줘.
```

비대화형 실행을 지원하는 버전에서는 다음 형식도 사용할 수 있습니다.

```bash
agy -p "Read ./vibe-coding-one-prompt-setup.md and execute it in AUTO mode. Ask only for unavoidable OAuth, ambiguous project selection, and one final approval before push and production deployment."
```

## 기본 설정

별도 입력이 없으면 다음 기본값을 사용합니다.

```yaml
mode: AUTO
app_name: vibe-inventory
cloudflare_project: vibe-inventory
production_branch: main
supabase_project: AUTO
github_repository: AUTO
allow_local_file_changes: true
allow_package_install: true
allow_database_schema_change: true
require_one_final_external_approval: true
```

- 현재 폴더에 프로젝트가 있으면 새로 만들지 말고 기존 파일을 안전하게 개선합니다.
- Git 저장소가 연결돼 있으면 현재 remote를 사용합니다.
- Supabase 프로젝트가 정확히 하나면 자동 선택합니다.
- 이름 충돌 시 기존 파일이나 원격 리소스를 삭제하지 말고 안전한 새 이름을 자동 생성합니다.
- 비밀값은 터미널, 로그, 커밋, 완료 보고서에 출력하지 않습니다.

## 에이전트 실행 규칙

1. 먼저 현재 폴더, Git 상태, Node.js, npm, GitHub CLI, Wrangler, Antigravity와 Supabase 연결 상태를 읽기 전용으로 점검합니다.
2. Node.js는 22 이상을 사용합니다. 필요한 일반 패키지는 자동 설치하되 버전을 고정하고 lockfile을 커밋 대상에 포함합니다.
3. 기존 사용자 변경사항을 삭제하거나 덮어쓰지 않습니다.
4. 로컬 파일 생성·수정, 패키지 설치, lint와 build는 별도 질문 없이 실행합니다.
5. OAuth가 필요하면 브라우저 인증을 시작하고 완료될 때까지 기다립니다.
6. 외부 변경은 마지막에 묶어 한 번만 승인받습니다. 승인 범위는 Supabase 스키마 적용, GitHub Push, Cloudflare 프로덕션 배포입니다.
7. 승인이 거절되면 로컬 완성 상태로 종료하고 실행할 명령만 보고합니다.
8. 실패 시 같은 명령을 반복하지 말고 원인을 진단한 뒤 안전한 대안을 최대 두 번 시도합니다.
9. 정보가 하나로 확정되면 질문하지 않습니다. 여러 Supabase 프로젝트처럼 잘못 선택할 위험이 있을 때만 한 번 질문합니다.

## Phase 1: 사전 점검과 자동 인증

다음을 확인하고 누락된 항목만 처리합니다.

```bash
node --version
npm --version
git --version
gh auth status
npx wrangler whoami
agy --version
```

### GitHub

로그인되지 않았다면 다음 인증을 시작합니다.

```bash
gh auth login
```

기존 Git remote가 있으면 그대로 사용합니다. remote가 없을 때만 현재 GitHub 계정 아래에 `vibe-inventory` 저장소를 만들 준비를 합니다.

### Cloudflare

로그인되지 않았다면 다음 인증을 시작합니다.

```bash
npx wrangler login
```

### Supabase MCP

공식 OAuth 서버를 사용합니다.

```text
https://mcp.supabase.com/mcp
```

- 먼저 읽기 전용으로 연결합니다.
- 사용 가능한 프로젝트가 하나면 자동 선택합니다.
- 여러 개면 프로젝트 이름과 Reference만 보여주고 한 번 선택받습니다.
- 선택 후 URL을 다음처럼 프로젝트 범위로 제한합니다.

```text
https://mcp.supabase.com/mcp?project_ref=선택한_REF&read_only=true&features=database,docs
```

- 스키마 적용 전 최종 통합 승인을 받은 뒤에만 쓰기 가능한 연결을 사용합니다.
- OAuth를 기본으로 사용하며 수동 Personal Access Token 입력을 요구하지 않습니다.

## Phase 2: React 앱 완성

기존 프로젝트가 있으면 구조를 보존하며 다음을 충족하도록 수정합니다.

- Vite, React, `lucide-react`, `@supabase/supabase-js`
- 재고 목록, 검색, 카테고리 필터, 부족 재고 경고
- 신규 품목 등록
- 입고와 출고
- 이메일 회원가입, 로그인, 로그아웃
- 로그인하지 않은 사용자의 변경 차단
- 사용자가 이해할 수 있는 오류 메시지
- 모바일 레이아웃
- 환경변수 이름 통일

```env
VITE_SUPABASE_URL=https://project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Publishable Key는 Supabase OAuth 연결을 통해 안전하게 조회 가능한 경우 자동으로 `.env.local`에 기록합니다. 자동 조회가 불가능할 때만 사용자가 Dashboard의 Connect 메뉴에서 두 값을 한 번 복사하도록 요청합니다.

`.gitignore`에는 최소한 다음을 포함합니다.

```gitignore
.env
.env.*
!.env.example
*.local
node_modules
dist
```

Secret Key와 Service Role Key는 브라우저 코드 및 `VITE_` 변수에 절대 사용하지 않습니다.

## Phase 3: Supabase Auth와 데이터베이스

프로젝트에 포함된 `test_inventory_schema.sql`을 단일 기준 파일로 사용합니다. 파일이 없으면 다음 조건을 만족하도록 생성합니다.

- `test_inventory_items`와 `test_inventory_transactions`
- 모든 행에 `owner_id default auth.uid()`
- 공개 스키마의 모든 테이블에 RLS 활성화
- `TO authenticated`와 `auth.uid() = owner_id`를 함께 사용
- UPDATE 정책에 `USING`과 `WITH CHECK` 모두 적용
- `anon` 역할의 테이블 권한 제거
- 2026 Data API 정책에 맞춰 `authenticated` 역할에 명시적 `GRANT`
- `SECURITY INVOKER` 방식의 `adjust_inventory_stock` 함수
- 재고 변경과 이력 저장을 하나의 트랜잭션으로 처리
- 출고 수량이 현재 재고보다 많으면 거부
- 함수의 PUBLIC 및 anon 실행 권한 제거
- 소유자 및 생성일 인덱스 추가
- `auth.role()`, `USING (true)`, 공개 전체 CRUD 정책 사용 금지

최종 통합 승인 전에는 SQL을 생성하고 검토만 합니다. 승인 후 Supabase MCP `execute_sql` 또는 지원되는 Supabase CLI 명령으로 적용합니다. 적용 후 다음을 검증합니다.

- 두 테이블 존재
- RLS 활성화
- 정책의 대상 역할과 소유권 조건
- 함수가 `SECURITY INVOKER`
- anon 권한 없음
- 가능하면 Database Advisors 실행 및 경고 보고

## Phase 4: 로컬 자동 검증

다음을 질문 없이 실행합니다.

```bash
npm install
npm run lint
npm run build
```

개발 서버를 실행해 HTTP 200과 주요 화면 렌더링을 확인합니다. 브라우저 자동화가 가능하면 다음 전체 흐름을 검증합니다.

1. 회원가입 화면 표시
2. 로그인 전 변경 차단
3. 로그인
4. 품목 추가
5. 입고 및 출고
6. 새로고침 후 데이터 유지
7. 다른 사용자 데이터 접근 차단
8. 로그아웃
9. 모바일 화면

이메일 확인이 필요한 신규 계정 테스트는 확인 링크 클릭만 사용자에게 요청합니다. 기존 테스트 계정이 안전하게 제공돼 있으면 재사용합니다.

## Phase 5: 한 번의 최종 승인

로컬 검증이 모두 성공하면 다음 내용을 한 화면에 요약하고 승인 질문을 정확히 한 번만 합니다.

```text
다음 외부 변경을 한 번에 실행할까요?
1. 검토된 Supabase 스키마 적용
2. 현재 브랜치를 GitHub에 Push
3. Cloudflare Pages 프로덕션 배포
```

승인 전에는 원격 DB, GitHub, Cloudflare를 변경하지 않습니다.

## Phase 6: GitHub와 Cloudflare 자동 완료

승인 후 다음을 수행합니다.

1. Supabase 스키마 적용 및 보안 검증
2. `git status`와 diff를 확인하고 비밀 파일 제외
3. Conventional Commit 생성
4. 기존 remote에 Push하거나 remote가 없으면 현재 계정에 저장소 생성 후 Push
5. `public/_redirects` 확인
6. `npm run build` 재실행
7. Cloudflare Pages 프로젝트 확인
8. 프로젝트가 없으면 생성하고 `dist` 배포
9. 배포 URL HTTP 200 및 새로고침 확인

예상 명령은 다음과 같습니다.

```bash
git add .
git commit -m "feat: complete secure inventory setup"
git push -u origin main
npm run build
npx wrangler pages deploy ./dist --project-name=vibe-inventory
```

실제 브랜치명과 프로젝트명은 점검 결과에 맞춰 사용합니다. 강제 Push, 기존 원격 삭제, 프로젝트 삭제는 금지합니다.

## 완료 조건

다음 조건을 모두 충족해야 완료로 보고합니다.

- lint와 build 성공
- 의존성 취약점 확인
- Publishable Key 환경변수 사용
- Secret/Service Role Key 미노출
- 로그인 전 DB 변경 차단
- 로그인 사용자는 자신의 데이터만 CRUD 가능
- 재고 변경과 이력 기록이 원자적으로 처리됨
- `.env.local`이 Git에서 제외됨
- GitHub Push 성공 또는 승인 거절로 로컬 완료 상태 명시
- Cloudflare URL HTTP 200 또는 승인 거절로 배포 명령 제공
- 실패·생략·수동 확인 항목을 숨기지 않음

## 최종 보고 형식

```text
로컬 앱: 성공/실패 + URL
Supabase Auth: 성공/수동 확인 필요
Supabase 스키마: 성공/미적용
RLS 보안: 검증 결과
GitHub: 저장소 URL 또는 미실행 사유
Cloudflare: 배포 URL 또는 미실행 사유
검증: lint / build / 브라우저 / 보안
사람이 추가로 할 일: 없음 또는 정확한 1개 항목
```

> 이 파일은 사람의 입력을 최소화하지만 OAuth 로그인, 이메일 소유 확인, 모호한 프로젝트 선택과 외부 프로덕션 변경 승인을 우회하지 않습니다.

