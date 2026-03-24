import React, { useState } from 'react';

export default function Settings({ settings, onSave, onClose }) {
  const [token, setToken] = useState(settings.notionToken || '');
  const [dbId, setDbId] = useState(settings.databaseId || '');
  const [interval, setInterval_] = useState(settings.refreshInterval / 1000 / 60); // 분 단위
  const [hideDone, setHideDone] = useState(settings.hideDone ?? false);
  const [notionLink, setNotionLink] = useState(settings.notionLink ?? true);

  const handleSave = () => {
    onSave({
      notionToken: token.trim(),
      databaseId: dbId.trim(),
      refreshInterval: interval * 60 * 1000,
      hideDone,
      notionLink,
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
        <span style={{ fontSize: 14, fontWeight: 600 }}>설정</span>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 18, color: 'var(--text-muted)', lineHeight: 1,
        }}>×</button>
      </div>

      <label style={labelStyle}>
        <span>Notion Integration Token</span>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="ntn_..."
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        <span>Database ID</span>
        <input
          value={dbId}
          onChange={e => setDbId(e.target.value)}
          placeholder="394c0df8-..."
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        <span>새로고침 간격 (분)</span>
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
          <span>Done 항목 숨기기</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input type="checkbox" checked={notionLink} onChange={e => setNotionLink(e.target.checked)} />
          <span>Notion 링크</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={handleSave} style={{
          flex: 1, padding: '6px 0', borderRadius: 4,
          background: 'var(--accent-bg)', color: 'var(--accent-text)', border: 'none',
          fontSize: 12, cursor: 'pointer', fontWeight: 500,
        }}>저장</button>
        <button onClick={onClose} style={{
          flex: 1, padding: '6px 0', borderRadius: 4,
          background: 'transparent', color: 'var(--text-muted)',
          border: '1px solid var(--border-subtle)',
          fontSize: 12, cursor: 'pointer',
        }}>취소</button>
      </div>

      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 4 }}>
        <p>1. notion.so/my-integrations 에서 Integration 생성</p>
        <p>2. Todo DB → ··· → Connections 에서 연결</p>
        <p>3. Token을 위에 입력</p>
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
