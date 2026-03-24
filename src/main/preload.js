const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Notion 데이터
  fetchItems: (view) => ipcRenderer.invoke('notion:fetch-items', view),
  updateStatus: (pageId, currentTags, newStatus) =>
    ipcRenderer.invoke('notion:update-status', pageId, currentTags, newStatus),

  // 설정
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (partial) => ipcRenderer.invoke('settings:set', partial),

  // 앱 액션
  openNotion: (url) => ipcRenderer.invoke('app:open-notion', url),
  refresh: () => ipcRenderer.invoke('app:refresh'),

  // 윈도우 컨트롤
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),

  // 이벤트 리스너
  onRefresh: (callback) => {
    ipcRenderer.on('app:refresh-trigger', callback);
    return () => ipcRenderer.removeListener('app:refresh-trigger', callback);
  },
});
