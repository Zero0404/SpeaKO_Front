# SpeaKO

> AI 기반 발표 대본 생성 & 발음 코칭 웹 서비스

SpeaKO는 발표를 준비하는 사람들을 위한 AI 코칭 서비스입니다. 발표 주제나 PPT/PDF 슬라이드만 있으면 AI가 청중과 시간, 말투에 맞는 발표 대본을 생성해주고, 이미 작성된 대본이 있다면 표준 발음 표기와 취약점 분석을 통해 발음 코칭을 받을 수 있습니다.

## 주요 기능

**AI 대본 생성**
발표 주제, 가이드라인 혹은 PPT/PDF 슬라이드를 입력하면 AI가 청중·시간·말투에 맞는 발표 대본을 자동으로 생성합니다.

**발표 발음 코칭**
작성해 둔 대본을 입력하면 AI가 장단음, 연음, 표기-발음 불일치 등을 하이라이트로 표시하고, 단어별 정확한 발음 표기와 발음 팁을 제공합니다.

**실시간/파일 기반 피드백**
마이크로 발표를 직접 녹음해 실시간 피드백을 받거나, 녹음 파일을 업로드해 사후 피드백을 받을 수 있습니다.

## 기술 스택

- **Frontend**: React + TypeScript
- **라우팅**: React Router (`react-router-dom`)
- **스타일링**: Tailwind CSS v4, CSS 변수 기반 디자인 토큰
- **아이콘**: lucide-react
- **폰트**: Pretendard

## 코드 스타일 및 네이밍 규칙

사람마다 들여쓰기나 따옴표 스타일이 다르면, 코드 리뷰 시 실제 로직이 아니라 스타일 차이 때문에 변경사항(diff)이 지저분해집니다. 자동 도구로 통일해 소모적인 논쟁을 방지합니다.

```

## 폴더 구조



```text
src/
 ├── pages/         # 페이지 단위 컴포넌트 (라우팅되는 화면)
 │    ├── HomePage.tsx
 │    ├── AiSetPage.tsx
 │    ├── AiLoading.tsx
 │    ├── ScriptEditPage.tsx
 │    ├── CoachSetPage.tsx
 │    ├── CoachLoading.tsx
 │    ├── CoachViewPage.tsx
 │    ├── FeedbackFileUploadPage.tsx
 │    ├── FeedbackLoading.tsx
 │    ├── FeedbackPage.tsx
 │    └── SelectPage.tsx
 ├── components/    # 여러 페이지에서 재사용되는 UI 조각
 │    ├── Navbar.tsx
 │    ├── LoadingScreen.tsx
 │    ├── LinkButton.tsx
 │    ├── HoverButton.tsx
 │    ├── MainChip.tsx
 │    ├── SubChip.tsx
 │    ├── TaskChip.tsx
 │    ├── TextInput.tsx
 │    ├── VoiceRecorder.tsx
 │    └── FileUpload.tsx
 ├── modals/        # 페이지 위에 뜨는 모달 (컴포넌트와 구분)
 │    ├── AccountMenu.tsx
 │    ├── SetConfirmModal.tsx
 │    ├── SetModal.tsx
 │    ├── ConfirmShell.tsx
 │    ├── DeleteAccount.tsx
 │    ├── EmailChange.tsx
 │    ├── Logout.tsx
 │    ├── PasswordChange.tsx
 │    ├── ProfileEdit.tsx
 │    ├── ModalShell.tsx
 │    ├── Login.tsx
 │    └── SignUp.tsx
 ├── store
 │    ├── authStore.ts
 │    ├── uiStore.tsx
 │    ├── scriptJobStore.ts
 │    └── uiStore.ts
 ├── apis
 │    ├── apiclient.ts
 │    ├── client.tsx
 │    ├── coach.api.ts
 │    ├── script.api.ts
 │    └── feedback.ts
 ├── types   # 타입 정의
 │    └── api.types.ts
 ├── utils
 │    └── getErrorMessage.ts
 ├── App.tsx        # 라우팅 설정하는 최상위 컴포넌트
 ├── main.tsx       # 앱 진입점 (React를 HTML에 연결)
 ├── App.css
 └── index.css      # 전역 스타일

```

  
## 페이지 설명

`App.tsx`에 라우팅이 아직 등록되지 않은 페이지도 있어, 경로 대신 페이지별 역할을 기준으로 정리했습니다.

| 페이지 | 경로(라우팅) | 설명 |
| --- | --- | --- |
| HomePage | `/` | 홈 |
| SelectPage | `/select` | 대본 생성 / 발음 코칭 모드 선택 |
| AiSetPage | `/ai-set` | AI 대본 생성 설정 (주제·가이드라인·슬라이드 입력) |
| AiLoading | `/ai-loading` | 대본 생성 로딩 화면 |
| ScriptEditPage | `/script-edit` | AI가 생성한 대본을 검토하는 페이지. 마음에 들지 않는 부분만 골라 **부분 재생성**을 요청하거나, 직접 소리 내어 읽어보며 대본 자체를 수정·보완해나가는 곳 |
| CoachSetPage | `/coach-set` | 발음 코칭용 대본 입력 |
| CoachLoading | `/coach-loading` | 코칭 분석 로딩 화면 |
| CoachViewPage | `/coach-view` | 하이라이트가 적용된 대본 뷰어 & 단어 목록 확인 |
| FeedbackFileUploadPage | `/feedback-fileupload` | 발표 녹음 파일 업로드 |
| FeedbackLoading | `/feedback-loading` | 피드백 분석 로딩 화면 |
| FeedbackPage | `/feedback` | 녹음(실시간/파일)에 대한 **발음 평가 결과**를 확인하는 페이지 |


## 핵심 컴포넌트

- **VoiceRecorder** — 마이크 녹음, 실시간 파형 시각화, 재생/탐색(seek)까지 지원하는 음성 녹음 컴포넌트. `onRecordingComplete` 콜백으로 녹음된 오디오 Blob과 길이를 상위로 전달합니다.
- **FileUpload** — AiSetPage, CoachSetPage, FeedbackFileUpload 총 3page에서 사용되고,각 페이지에서 요구되는 파일 유형에 따라 필터링합니다.
- **ModalShell/ConfirmMoadl** — 마이페이지 내 정보 편집과 로그아웃/탈퇴 등 공통으로 사용하는 모달 구조입니다.
- **MainChip / SubChip / HoverButton / TaskChip / TextInput** — 여러 페이지에서 재사용되는 공통 UI 요소.

## 디자인 토큰 (index.css)

색상 등 공통 디자인 값은 `index.css`의 CSS 변수로 관리합니다.

```css
  --color-white: #ffffff;
  --color-text-heading: #27272a;   /* zinc-800: 제목 텍스트 */
  --color-text-body: #64748b;      /* slate-500: 설명/본문 텍스트 */
  --color-brand-primary: #6366f1;  /* indigo-500: 포인트 컬러 (강조 텍스트) */
  --color-brand-light: #a5b4fc;    /* indigo-300: 연한 포인트 컬러 (배경 블러) */

  /* 그라데이션 */
  --gradient-brand-active: linear-gradient(to bottom right, #a5b4fc, #6366f1); /* from-indigo-300 to-indigo-500 */
  --color-inactive-bg: rgba(255, 255, 255, 0.8); /* bg-white/80 */
  --transition-hover: all 300ms ease; /* transition-all duration-300 */
```

## 환경설정 & 배포
API 키 같은 민감 정보가 실수로 GitHub에 올라가면 보안 사고로 이어질 수 있다. 한번 공개 저장소에 올라간 정보는 히스토리에서 완전히 지우기도 어려우므로, 애초에 올라가지 않도록 규칙을 지키는 것이 중요하다.
| 항목 | 규칙 |
| :--- | :--- |
| **.env 파일** | 절대 커밋 금지 |
| **.env.example** | 실제 값은 빼고, 어떤 환경변수가 필요한지만 적어서 공유 |
| **배포 전 체크** | 빌드 에러 없는지, console.log 지웠는지 확인 후 배포 |

## 시작하기

```bash
npm install
npm run dev
```

> 실제 빌드/실행 커맨드는 사용 중인 패키지 매니저 및 `package.json` 스크립트에 맞게 조정하세요.

## 기여 시 참고사항

- 페이지(`pages/`)와 재사용 컴포넌트(`components/`), 모달(`modals/`)을 명확히 구분해서 배치합니다.
- 서버 통신 로직은 도메인별로 `apis/` 하위에 파일을 분리합니다.
- 타입 정의는 실행 코드 없이 `types/`에 모아둡니다.

