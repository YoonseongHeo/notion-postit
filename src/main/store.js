import Store from 'electron-store';
import { DEFAULT_SETTINGS } from '../shared/constants.js';

const store = new Store({
  name: 'notion-postit-config',
  defaults: {
    settings: DEFAULT_SETTINGS,
    cache: {
      items: [],
      lastSync: null,
    },
    windowBounds: {
      x: undefined,
      y: undefined,
      width: 380,
      height: 500,
    },
  },
});

export function getSettings() {
  return store.get('settings');
}

export function setSetting(key, value) {
  store.set(`settings.${key}`, value);
  return store.get('settings');
}

export function setSettings(partial) {
  const current = store.get('settings');
  const updated = { ...current, ...partial };
  store.set('settings', updated);
  return updated;
}

export function getCachedItems() {
  return store.get('cache.items');
}

export function setCachedItems(items) {
  store.set('cache.items', items);
  store.set('cache.lastSync', new Date().toISOString());
}

export function getWindowBounds() {
  return store.get('windowBounds');
}

export function setWindowBounds(bounds) {
  store.set('windowBounds', bounds);
}

export default store;
