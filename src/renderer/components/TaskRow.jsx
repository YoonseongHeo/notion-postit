import React from 'react';

const STATUS_TAGS = ['Todo', 'Doing', 'Done 🙌'];

function getStatus(tags) {
  if (tags.includes('Done 🙌')) return 'Done 🙌';
  if (tags.includes('Doing')) return 'Doing';
  if (tags.includes('Todo')) return 'Todo';
  return null;
}

function nextStatus(s) {
  if (s === 'Todo') return 'Doing';
  if (s === 'Doing') return 'Done 🙌';
  return 'Todo';
}

export default function TaskRow({ item, onToggle, busy, notionLink }) {
  const status = getStatus(item.tags);
  const done = status === 'Done 🙌';
  const doing = status === 'Doing';

  const handleOpen = () => {
    if (notionLink && item.url) {
      // Electron 환경이면 IPC, 아니면 직접 오픈
      if (window.api?.openNotion) {
        window.api.openNotion(item.url);
      } else {
        window.open(item.url, '_blank');
      }
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '4px 8px', borderRadius: 4,
      opacity: done ? 0.35 : 1,
      transition: 'opacity 0.15s',
    }}>
      {/* 상태 체크박스 */}
      <button
        onClick={() => onToggle(item, nextStatus(status))}
        disabled={busy}
        style={{
          width: 14, height: 14, borderRadius: 3,
          border: 'none', padding: 0,
          cursor: busy ? 'wait' : 'pointer',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: done ? '#639922' : doing ? '#EF9F27' : 'transparent',
          outline: done || doing ? 'none' : '1.5px solid var(--checkbox-outline)',
          outlineOffset: -1.5,
        }}
      >
        {done && (
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <path d="M2 5.5L4 7.5L8 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {doing && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }}/>}
      </button>

      {/* 긴급 표시 */}
      {item.urgent && (
        <span style={{ color: '#E24B4A', fontSize: 10, fontWeight: 700, flexShrink: 0, lineHeight: 1 }}>
          !!
        </span>
      )}

      {/* 제목 (한줄, 말줄임) */}
      <span
        onClick={handleOpen}
        style={{
          flex: 1, minWidth: 0,
          fontSize: 12.5, lineHeight: '17px',
          color: done ? 'var(--text-faint)' : 'var(--text)',
          textDecoration: done ? 'line-through' : 'none',
          fontWeight: doing ? 500 : 400,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          cursor: notionLink ? 'pointer' : 'default',
        }}
      >
        {item.name}
      </span>

      {/* 링크 아이콘 */}
      {notionLink && !done && (
        <span
          onClick={handleOpen}
          style={{ flexShrink: 0, cursor: 'pointer', fontSize: 9, color: 'var(--text-fainter)' }}
        >↗</span>
      )}
    </div>
  );
}

export { getStatus, nextStatus, STATUS_TAGS };
