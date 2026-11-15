# 합격메이트

형법·형사소송법·교정학·노동법 등의 시험문제를 모바일 앱처럼 풀고, 자동채점·해설·오답 복습·학습 기록을 관리하는 Next.js PWA입니다.

## 현재 구현 범위

- 보라색·라벤더 반응형 홈, 과목/단원 선택
- 서버 API 자동채점과 해설 표시
- 브라우저 기반 학습 기록 및 오답노트/재풀이
- 이메일/비밀번호 로그인용 서명 쿠키 세션
- 관리자 문제 등록·수정·삭제·공개 상태 UI 및 PostgreSQL CRUD API
- Drizzle PostgreSQL 스키마, 초기 migration, RLS 정책
- Web App Manifest, Service Worker, 192/512 아이콘
- ESLint, Vitest, Next.js production build

DB가 연결되지 않은 개발 환경에서는 학습 기록과 관리자 편집 내용이 브라우저 `localStorage`에 저장됩니다. 운영에서는 반드시 PostgreSQL과 `AUTH_SECRET`을 설정해야 합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

개발 전용 데모 계정(프로덕션에서는 비활성화):

- 학습자: `student@hapgyeokmate.com` / `demo1234`
- 관리자: `admin@hapgyeokmate.com` / `demo1234`

## 환경변수와 DB

`.env.example`을 `.env.local`로 복사하고 실제 값을 입력합니다. 비밀값은 커밋하지 않습니다.

```bash
npm run db:migrate
```

운영 관리자 계정은 bcrypt 해시를 생성한 뒤 `users` 테이블에 직접 등록하거나 별도 초대 흐름을 추가해야 합니다. migration의 RLS 정책은 API 트랜잭션에서 `SET LOCAL app.user_id`와 `SET LOCAL app.user_role`을 지정하는 구조를 전제로 한 추가 방어 계층입니다. 서버 API의 세션 역할 검사도 함께 유지해야 합니다.

## 확인 명령

```bash
npm run lint
npm run test
npm run build
```

## Vercel 배포 준비

1. GitHub 저장소를 Vercel 프로젝트로 Import합니다.
2. Vercel Marketplace에서 Neon Postgres를 연결하거나 호환 PostgreSQL의 `DATABASE_URL`을 등록합니다.
3. Production/Preview/Development 환경에 `AUTH_SECRET`을 각각 안전하게 등록합니다.
4. Build Command는 `npm run build`, Install Command는 `npm ci`를 사용합니다.
5. migration은 검토된 배포 전에 별도 단계에서 한 번 실행합니다. 애플리케이션 빌드 중 자동 migration은 실행하지 않습니다.
6. 배포 검증 후 Vercel Domains에서 `hapgyeokmate.com`을 추가하고, 안내되는 DNS 레코드를 도메인 업체에 설정합니다.

Git 연동의 기본 Preview/Production 배포를 사용하며, 별도의 토큰 기반 GitHub Actions는 구성하지 않았습니다. 외부 계정 연결, 비밀키 등록, DNS 변경은 이 저장소 작업에 포함되지 않습니다.

## 운영 전 남은 작업

- 샘플 문제의 법률·정답·해설 전문 검수 및 실제 문제 데이터 이관
- 운영용 회원가입/비밀번호 재설정/이메일 인증
- 관리자 계정 생성·초대와 감사 로그
- 브라우저 데모 기록을 PostgreSQL `attempts`로 동기화하는 API
- 개인정보 처리방침, 이용약관, 백업·모니터링 정책
