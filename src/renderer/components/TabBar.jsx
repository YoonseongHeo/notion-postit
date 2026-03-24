import React from 'react';

const TABS = [
  { key: 'today', label: '오늘' },
  { key: 'week',  label: '이번 주' },
  { key: 'all',   label: '전체' },
];

export default function TabBar({ view, setView, hideDone, setHideDone, notionLink, setNotionLink }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      padding: '4px 8px 6px',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* 뷰 탭 */}
      <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setView(key)} style={{
            fontSize: 11.5, padding: '3px 10px', borderRadius: 4,
            border: 'none', cursor: 'pointer',
            fontWeight: view === key ? 600 : 400,
            background: view === key ? 'var(--accent-bg)' : 'transparent',
            color: view === key ? 'var(--accent-text)' : 'var(--text-muted)',
            transition: 'all 0.15s',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* 옵션 토글 */}
      <div style={{ display: 'flex', gap: 3 }}>
        <button
          onClick={() => setHideDone(!hideDone)}
          title="Done 항목 숨기기"
          style={optBtnStyle(hideDone)}
        >✓</button>
        <button
          onClick={() => setNotionLink(!notionLink)}
          title="노션 링크 on/off"
          style={optBtnStyle(notionLink)}
        >↗</button>
      </div>
    </div>
  );
}

function optBtnStyle(active) {
  return {
    fontSize: 10, padding: '2px 5px', borderRadius: 3,
    background: active ? 'var(--opt-active-bg)' : 'transparent',
    color: active ? 'var(--opt-active-color)' : 'var(--text-faint)',
    border: '1px solid var(--border-subtle)',
    cursor: 'pointer', lineHeight: 1,
  };
}
