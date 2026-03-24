# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Notion Todo DB와 연동되는 Electron 데스크톱 포스트잇 위젯. 항상 화면 위에 떠 있으며, Notion Calendar DB의 Multi-select 태그를 통해 할 일 상태(Todo → Doing → Done)를 원클릭으로 순환 변경한다.

## 개발 명령어

```bash
npm run dev              # 개발 모드 (Vite dev server + Electron 동시 실행)
npm run build            # Vite 빌드만 (dist/renderer/)
npm run package          # Windows NSIS 인스톨러 빌드
npm run package:portable # Windows Portable exe 빌드
```

## 환경 설정

- `.env` 파일에 `NOTION_TOKEN`과 `DATABASE_ID` 설정 (`.env.example` 참고)
- 개발 모드에서 `dotenv`로 자동 로드됨
- 프로덕션에서는 앱 내 설정 화면(Settings 컴포넌트)에서 입력

## 아키텍처

### Main Process (`src/main/`)
- **main.js**: 앱 진입점. `BrowserWindow` 생성, IPC 핸들러 등록, 글로벌 단축키(Ctrl+Shift+N), 자동 새로고침 타이머
- **notion-client.js**: Notion API 래퍼. `fetchItems()` (DB 쿼리 + 페이징), `updateStatus()` (태그 PATCH). 429 Rate limit 자동 재시도
- **store.js**: `electron-store` 기반 설정/캐시/윈도우 위치 영속화. 설정 파일명: `notion-postit-config`
- **preload.js**: `contextBridge`로 `window.api` 노출 (IPC 브릿지)
- **tray.js**: 시스템 트레이 아이콘 + 컨텍스트 메뉴

### Renderer Process (`src/renderer/`)
- React 18 + Vite, JSX 기반
- **App.jsx**: 메인 컴포넌트. 뷰 전환(오늘/이번주/전체), 필터링, 정렬, Mock 데이터 지원 (브라우저 모드)
- **hooks/useNotion.js**: Notion 데이터 조회/업데이트 훅. Optimistic Update + Rollback 패턴
- **components/**: TitleBar(커스텀 프레임리스 타이틀바), TabBar, TaskRow, Toast, Settings

### Shared (`src/shared/constants.js`)
- IPC 채널명, 상태 태그(`Todo`, `Doing`, `Done 🙌`), 기본 설정값 정의

## 핵심 데이터 흐름

1. Renderer → IPC(`notion:fetch-items`) → Main → Notion API → 응답 캐시(electron-store) → Renderer
2. 상태 변경: Renderer(Optimistic Update) → IPC(`notion:update-status`) → Main → Notion API PATCH (실패 시 Rollback)
3. 자동 새로고침: Main의 `setInterval` → `app:refresh-trigger` 이벤트 → Renderer re-fetch

## Notion DB 스키마 의존성

앱이 기대하는 Notion DB 프로퍼티:
- `Name` (title): 할 일 제목
- `Tag` (multi_select): 상태 태그 + 카테고리 태그 혼용
- `Date` (date): 시작/종료일
- `긴급` (checkbox): 긴급 플래그

## 주의사항

- `preload.js`만 CommonJS(`require`), 나머지는 전부 ES Modules
- 윈도우 닫기 시 실제 종료가 아닌 트레이로 숨김 (`app.isQuitting` 플래그로 제어)
- 브라우저에서 직접 열면 `window.api`가 없으므로 Mock 데이터 모드로 동작
