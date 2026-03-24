import { Tray, Menu, nativeImage } from 'electron';
import path from 'path';

let tray = null;

export function createTray(win) {
  // 16x16 간단한 아이콘 (리소스 없으면 빈 아이콘)
  const iconPath = path.join(process.cwd(), 'resources', 'tray-icon.png');
  let icon;
  try {
    icon = nativeImage.createFromPath(iconPath);
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip('Notion PostIt');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '열기',
      click: () => {
        win.show();
        win.focus();
      },
    },
    {
      label: '새로고침',
      click: () => {
        win.webContents.send('app:refresh-trigger');
      },
    },
    { type: 'separator' },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: win.isAlwaysOnTop(),
      click: (menuItem) => {
        win.setAlwaysOnTop(menuItem.checked);
      },
    },
    { type: 'separator' },
    {
      label: '종료',
      click: () => {
        tray.destroy();
        win.destroy();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // 트레이 아이콘 클릭 → 윈도우 토글
  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  });

  return tray;
}
