// ── IPC 채널명 ──
export const IPC = {
  FETCH_ITEMS: 'notion:fetch-items',
  UPDATE_STATUS: 'notion:update-status',
  GET_SETTINGS: 'settings:get',
  SET_SETTINGS: 'settings:set',
  OPEN_NOTION: 'app:open-notion',
  REFRESH: 'app:refresh',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_CLOSE: 'window:close',
};

// ── 상태 태그 ──
export const STATUS_TAGS = ['Todo', 'Doing', 'Done 🙌'];
export const STATUS_ORDER = { 'Doing': 0, 'Todo': 1, 'Done 🙌': 2 };

// ── 기본 설정값 ──
export const DEFAULT_SETTINGS = {
  notionToken: '',
  databaseId: '394c0df8-9800-4e42-88d8-346ef29e5e80',
  view: 'today',
  hideDone: false,
  notionLink: true,
  refreshInterval: 300000, // 5분
  alwaysOnTop: true,
  opacity: 1,
  darkMode: false,
  lang: 'ko',
};
