# Notion PostIt

Notion Todo DB 연동 데스크톱 포스트잇 위젯.  
항상 화면 위에 떠 있으며, 할 일 상태를 원클릭으로 변경합니다.

## 기능

- Notion Calendar DB (Multi-select 태그) 실시간 연동
- 오늘 / 이번 주 / 전체 뷰 전환
- 체크박스로 Todo → Doing → Done 순환 (Optimistic Update)
- 제목 클릭 시 노션 페이지 열기
- Always on Top + 시스템 트레이 + 글로벌 단축키 (Ctrl+Shift+N)
- Done 항목 숨기기 토글
- 5분 자동 새로고침

## 셋업

```bash
git clone <repo-url>
cd notion-postit
cp .env.example .env    # 토큰, DB ID 입력
npm install
npm run dev             # 개발 모드 (Vite + Electron)
```

## 빌드

```bash
npm run package           # Windows 인스톨러
npm run package:portable  # Portable exe
```

## Notion 연동 설정

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) 에서 Integration 생성
2. Capabilities: Read content + Update content
3. Todo DB → ··· → Connections 에서 Integration 연결
4. `.env`에 토큰 입력 또는 앱 내 설정(⚙) 화면에서 입력

## 프로젝트 구조

```
src/
├── main/                # Electron Main Process
│   ├── main.js          # 앱 진입점, IPC 핸들러
│   ├── notion-client.js # Notion API 래퍼
│   ├── preload.js       # contextBridge
│   ├── store.js         # electron-store 설정/캐시
│   └── tray.js          # 시스템 트레이
├── renderer/            # React UI
│   ├── App.jsx          # 메인 앱
│   ├── components/      # TitleBar, TabBar, TaskRow, Toast, Settings
│   ├── hooks/           # useNotion (API 통신)
│   └── lib/             # date-utils
└── shared/
    └── constants.js     # IPC 채널명, 상태 태그, 기본 설정
```
