import { app, BrowserWindow, ipcMain, shell, globalShortcut } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchItems, updateStatus } from './notion-client.js';
import {
  getSettings, setSettings, getCachedItems,
  setCachedItems, getWindowBounds, setWindowBounds,
} from './store.js';
import { createTray } from './tray.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

let win = null;
let refreshTimer = null;

function createWindow() {
  const bounds = getWindowBounds();

  win = new BrowserWindow({
    width: bounds.width || 380,
    height: bounds.height || 500,
    x: bounds.x,
    y: bounds.y,
    alwaysOnTop: getSettings().alwaysOnTop ?? true,
    opacity: getSettings().opacity ?? 1,
    frame: false,
    transparent: false,
    resizable: true,
    minimizable: true,
    skipTaskbar: false,
    minWidth: 280,
    minHeight: 200,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 개발 모드: Vite dev server, 프로덕션: 빌드된 파일
  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
  }

  // 닫기 → 트레이로 숨김 (실제 종료는 트레이 메뉴에서)
  win.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      win.hide();
    }
  });

  // 윈도우 위치/크기 저장
  win.on('moved', () => setWindowBounds(win.getBounds()));
  win.on('resized', () => setWindowBounds(win.getBounds()));

  // 포커스 시 새로고침
  win.on('focus', () => {
    win.webContents.send('app:refresh-trigger');
  });

  return win;
}

// ── IPC 핸들러 ──

ipcMain.handle('notion:fetch-items', async (_event, view) => {
  const settings = getSettings();
  if (!settings.notionToken) {
    // 토큰 없으면 캐시 반환
    return { items: getCachedItems(), error: 'NOTION_TOKEN이 설정되지 않았습니다.' };
  }
  try {
    const items = await fetchItems(settings.notionToken, settings.databaseId, view);
    setCachedItems(items);
    return { items, error: null };
  } catch (err) {
    // 에러 시 캐시 폴백
    return { items: getCachedItems(), error: err.message };
  }
});

ipcMain.handle('notion:update-status', async (_event, pageId, currentTags, newStatus) => {
  const settings = getSettings();
  if (!settings.notionToken) {
    return { success: false, error: 'NOTION_TOKEN이 설정되지 않았습니다.' };
  }
  try {
    await updateStatus(settings.notionToken, pageId, currentTags, newStatus);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('settings:get', () => getSettings());

ipcMain.handle('settings:set', (_event, partial) => {
  const updated = setSettings(partial);

  // refreshInterval 변경 시 타이머 재설정
  if (partial.refreshInterval) {
    startRefreshTimer(partial.refreshInterval);
  }
  // alwaysOnTop 변경 시 윈도우 반영
  if (partial.alwaysOnTop !== undefined && win) {
    win.setAlwaysOnTop(partial.alwaysOnTop);
  }
  // opacity 변경 시 윈도우 반영
  if (partial.opacity !== undefined && win) {
    win.setOpacity(partial.opacity);
  }

  return updated;
});

ipcMain.handle('app:open-notion', (_event, url) => {
  if (url) shell.openExternal(url);
});

ipcMain.handle('app:refresh', () => {
  if (win) win.webContents.send('app:refresh-trigger');
});

ipcMain.on('window:minimize', () => win?.minimize());
ipcMain.on('window:close', () => win?.hide());

// ── 자동 새로고침 타이머 ──

function startRefreshTimer(interval) {
  if (refreshTimer) clearInterval(refreshTimer);
  if (interval > 0) {
    refreshTimer = setInterval(() => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('app:refresh-trigger');
      }
    }, interval);
  }
}

// ── 앱 시작 ──

app.whenReady().then(async () => {
  // .env에서 토큰 로드 (개발 시)
  if (isDev) {
    try {
      const dotenv = await import('dotenv');
      dotenv.config();
      if (process.env.NOTION_TOKEN) {
        setSettings({
          notionToken: process.env.NOTION_TOKEN,
          databaseId: process.env.DATABASE_ID || getSettings().databaseId,
        });
      }
    } catch {
      // dotenv 없으면 무시
    }
  }

  createWindow();
  createTray(win);

  // 글로벌 단축키: Ctrl+Shift+N → 윈도우 토글
  globalShortcut.register('Ctrl+Shift+N', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  });

  // 자동 새로고침 시작
  startRefreshTimer(getSettings().refreshInterval);
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (refreshTimer) clearInterval(refreshTimer);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
