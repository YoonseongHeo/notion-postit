import { Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { getSettings } from './store.js';
import { t } from '../shared/i18n.js';

let tray = null;

export function createTray(win) {
  const iconPath = path.join(process.cwd(), 'resources', 'tray-icon.png');
  let icon;
  try {
    icon = nativeImage.createFromPath(iconPath);
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip('Notion PostIt');

  function updateMenu() {
    const lang = getSettings().lang || 'ko';
    const contextMenu = Menu.buildFromTemplate([
      {
        label: t(lang, 'trayOpen'),
        click: () => { win.show(); win.focus(); },
      },
      {
        label: t(lang, 'trayRefresh'),
        click: () => { win.webContents.send('app:refresh-trigger'); },
      },
      { type: 'separator' },
      {
        label: 'Always on Top',
        type: 'checkbox',
        checked: win.isAlwaysOnTop(),
        click: (menuItem) => { win.setAlwaysOnTop(menuItem.checked); },
      },
      { type: 'separator' },
      {
        label: t(lang, 'trayQuit'),
        click: () => { tray.destroy(); win.destroy(); },
      },
    ]);
    tray.setContextMenu(contextMenu);
  }

  updateMenu();

  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  });

  return { tray, updateMenu };
}
