import React, { useState } from 'react';
import { t, LANGUAGES } from '../../shared/i18n.js';

export default function Settings({ settings, onSave, onClose, lang }) {
  const [token, setToken] = useState(settings.notionToken || '');
  const [dbId, setDbId] = useState(settings.databaseId || '');
  const [interval, setInterval_] = useState(settings.refreshInterval / 1000 / 60);
  const [hideDone, setHideDone] = useState(settings.hideDone ?? false);
  const [notionLink, setNotionLink] = useState(settings.notionLink ?? true);
  const [selectedLang, setSelectedLang] = useState(lang);

  const handleSave = () => {
    onSave({
      notionToken: token.trim(),
      databaseId: dbId.trim(),
      refreshInterval: interval * 60 * 1000,
      hideDone,
      notionLink,
      lang: selectedLang,
    });
    onClose();
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'var(--bg)', zIndex: 50,
      padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
      overflow: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{t(selectedLang, 'settingsTitle')}</span>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 18, color: 'var(--text-muted)', lineHeight: 1,
        }}>×</button>
      </div>

      <label style={labelStyle}>
        <span>{t(selectedLang, 'notionToken')}</span>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="ntn_..."
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        <span>{t(selectedLang, 'databaseId')}</span>
        <input
          value={dbId}
          onChange={e => setDbId(e.target.value)}
          placeholder="394c0df8-..."
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        <span>{t(selectedLang, 'refreshInterval')}</span>
        <input
          type="number"
          min={1} max={30}
          value={interval}
          onChange={e => setInterval_(Number(e.target.value))}
          style={{ ...inputStyle, width: 80 }}
        />
      </label>

      <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: 'var(--text-secondary)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input type="checkbox" checked={hideDone} onChange={e => setHideDone(e.target.checked)} />
          <span>{t(selectedLang, 'hideDone')}</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input type="checkbox" checked={notionLink} onChange={e => setNotionLink(e.target.checked)} />
          <span>{t(selectedLang, 'notionLink')}</span>
        </label>
      </div>

      <label style={labelStyle}>
        <span>{t(selectedLang, 'language')}</span>
        <select
          value={selectedLang}
          onChange={e => setSelectedLang(e.target.value)}
          style={{ ...inputStyle, width: 120 }}
        >
          {LANGUAGES.map(({ key, label }) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </label>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={handleSave} style={{
          flex: 1, padding: '6px 0', borderRadius: 4,
          background: 'var(--accent-bg)', color: 'var(--accent-text)', border: 'none',
          fontSize: 12, cursor: 'pointer', fontWeight: 500,
        }}>{t(selectedLang, 'save')}</button>
        <button onClick={onClose} style={{
          flex: 1, padding: '6px 0', borderRadius: 4,
          background: 'transparent', color: 'var(--text-muted)',
          border: '1px solid var(--border-subtle)',
          fontSize: 12, cursor: 'pointer',
        }}>{t(selectedLang, 'cancel')}</button>
      </div>

      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 4 }}>
        <p>{t(selectedLang, 'guide1')}</p>
        <p>{t(selectedLang, 'guide2')}</p>
        <p>{t(selectedLang, 'guide3')}</p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'flex', flexDirection: 'column', gap: 4,
  fontSize: 11.5, color: 'var(--text-secondary)',
};

const inputStyle = {
  fontSize: 12, padding: '6px 8px', borderRadius: 4,
  border: '1px solid var(--border-input)', outline: 'none',
  background: 'var(--bg)', color: 'var(--text)',
  width: '100%',
};
