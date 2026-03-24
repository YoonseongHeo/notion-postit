import React from 'react';

export default function TitleBar({ alwaysOnTop, onToggleAlwaysOnTop, opacity, onOpacityChange, darkMode, onToggleDarkMode }) {
  const api = window.api;

  return (
    <div className="titlebar" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '4px 8px', height: 28,
      background: 'var(--bg)',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 0.5 }}>
        POSTIT
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          type="range"
          min="0.2" max="1" step="0.05"
          value={opacity}
          onChange={e => onOpacityChange(parseFloat(e.target.value))}
          title={`투명도 ${Math.round(opacity * 100)}%`}
          style={{ width: 48, height: 12, cursor: 'pointer', accentColor: 'var(--text-muted)' }}
        />
        <button
          onClick={onToggleDarkMode}
          style={btnStyle}
          title={darkMode ? '라이트 모드' : '다크 모드'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            {darkMode ? (
              <circle cx="12" cy="12" r="5" stroke="var(--text-muted)" strokeWidth="2"/>
            ) : (
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
        </button>
        <button
          onClick={onToggleAlwaysOnTop}
          style={btnStyle}
          title={alwaysOnTop ? '항상 위 해제' : '항상 위 고정'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L12 10M12 10L8 7M12 10L16 7M7 14H17L15 22H9L7 14Z"
              stroke={alwaysOnTop ? 'var(--text)' : 'var(--text-fainter)'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button onClick={() => api?.minimize()} style={btnStyle} title="최소화">
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 5h8" stroke="var(--text-muted)" strokeWidth="1.2"/></svg>
        </button>
        <button onClick={() => api?.close()} style={btnStyle} title="트레이로 숨기기">
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6" stroke="var(--text-muted)" strokeWidth="1.2"/></svg>
        </button>
      </div>
    </div>
  );
}

const btnStyle = {
  width: 20, height: 20, borderRadius: 4,
  border: 'none', background: 'transparent',
  cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};
