const messages = {
  ko: {
    // Tab / View
    today: '오늘',
    week: '주간',
    all: '전체',

    // TitleBar tooltips
    opacity: (v) => `투명도 ${Math.round(v * 100)}%`,
    darkMode: '다크 모드',
    lightMode: '라이트 모드',
    pinOn: '항상 위 해제',
    pinOff: '항상 위 고정',
    minimize: '최소화',
    close: '트레이로 숨기기',

    // Sub header
    settings: '설정',

    // Loading / Empty
    syncing: '동기화 중...',
    emptyToday: '오늘 할 일 없음 🎉',
    emptyOther: '항목 없음',
    failPrefix: '실패: ',

    // Settings panel
    settingsTitle: '설정',
    notionToken: 'Notion Integration Token',
    databaseId: 'Database ID',
    refreshInterval: '새로고침 간격 (분)',
    hideDone: 'Done 항목 숨기기',
    notionLink: 'Notion 링크',
    save: '저장',
    cancel: '취소',
    guide1: '1. notion.so/my-integrations 에서 Integration 생성',
    guide2: '2. Todo DB → ··· → Connections 에서 연결',
    guide3: '3. Token을 위에 입력',
    language: '언어',

    // Tray
    trayOpen: '열기',
    trayRefresh: '새로고침',
    trayQuit: '종료',

    // Date
    weekdays: ['일', '월', '화', '수', '목', '금', '토'],

    // Error
    noToken: 'NOTION_TOKEN이 설정되지 않았습니다.',
    notElectron: 'Electron 환경이 아닙니다. Mock 데이터를 사용합니다.',
    noTitle: '(제목 없음)',
  },

  en: {
    today: 'Today',
    week: 'Week',
    all: 'All',

    opacity: (v) => `Opacity ${Math.round(v * 100)}%`,
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    pinOn: 'Unpin from top',
    pinOff: 'Always on top',
    minimize: 'Minimize',
    close: 'Hide to tray',

    settings: 'Settings',

    syncing: 'Syncing...',
    emptyToday: 'Nothing to do today 🎉',
    emptyOther: 'No items',
    failPrefix: 'Failed: ',

    settingsTitle: 'Settings',
    notionToken: 'Notion Integration Token',
    databaseId: 'Database ID',
    refreshInterval: 'Refresh interval (min)',
    hideDone: 'Hide done items',
    notionLink: 'Notion link',
    save: 'Save',
    cancel: 'Cancel',
    guide1: '1. Create Integration at notion.so/my-integrations',
    guide2: '2. Todo DB → ··· → Connections → Add integration',
    guide3: '3. Enter the token above',
    language: 'Language',

    trayOpen: 'Open',
    trayRefresh: 'Refresh',
    trayQuit: 'Quit',

    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

    noToken: 'NOTION_TOKEN is not configured.',
    notElectron: 'Not an Electron environment. Using mock data.',
    noTitle: '(Untitled)',
  },
};

export function t(lang, key) {
  return messages[lang]?.[key] ?? messages.en[key] ?? key;
}

export const LANGUAGES = [
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
];
