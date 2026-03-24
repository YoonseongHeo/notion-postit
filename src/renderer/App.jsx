import React, { useState, useEffect, useMemo, useCallback } from 'react';
import TitleBar from './components/TitleBar';
import TaskRow, { getStatus, STATUS_TAGS } from './components/TaskRow';
import Toast from './components/Toast';
import Settings from './components/Settings';
import { useNotion } from './hooks/useNotion';
import { todayStr, fmtShort, getWeekRange, matchesDateView } from './lib/date-utils';

const STATUS_ORDER = { 'Doing': 0, 'Todo': 1, 'Done 🙌': 2 };

// 개발/프로토타입용 mock 데이터
const MOCK_DATA = [
  { id: '1', name: 'MES CommonEdition 개발 (6월 전 2개 공장 오픈 목표)', tags: ['Doing', 'MES', '개발'], dateStart: '2026-03-23', dateEnd: '2026-06-30', urgent: true, url: 'https://notion.so/3281b00427a481ea8443c471ffad7c6a' },
  { id: '2', name: '데이터 연계 검토 마무리 및 보고 (최윤섭 대리)', tags: ['Doing', '데이터'], dateStart: '2026-03-23', dateEnd: null, urgent: false, url: 'https://notion.so/32c1b00427a4817995dcf4c7d4561775' },
  { id: '3', name: '개발 진척 관리 방안 검토 및 구상', tags: ['Todo', '기획'], dateStart: '2026-03-23', dateEnd: null, urgent: false, url: 'https://notion.so/3281b00427a481d4bac4fbde2cbe9e8e' },
  { id: '4', name: '최윤섭 대리 펜딩 보고 건 검토 완료 및 보고', tags: ['Doing', '문서'], dateStart: '2026-03-23', dateEnd: null, urgent: true, url: 'https://notion.so/32c1b00427a48117a0d9ea6de777928b' },
  { id: '5', name: '매주 월요일 정기회의 (w.김수현 팀장)', tags: ['Todo', '회의 미팅'], dateStart: '2026-03-23', dateEnd: null, urgent: false, url: 'https://notion.so/3281b00427a481ff98ebfac3f2b7f3f5' },
  { id: '6', name: '투입 품목 모달 수정', tags: ['Done 🙌', '개발', 'MES'], dateStart: '2026-03-18', dateEnd: null, urgent: false, url: 'https://notion.so/3251b00427a4800cb3d1c8a9255a4a8c' },
  { id: '7', name: 'MES-동진 기준정보 DB 재삽입', tags: ['Todo', 'MES-동진', '데이터'], dateStart: '2026-03-20', dateEnd: null, urgent: false, url: 'https://notion.so/3281b00427a481adaca7e6f233cb6be3' },
  { id: '8', name: '동진 회의', tags: ['Done 🙌', '회의 미팅'], dateStart: '2026-03-11', dateEnd: null, urgent: false, url: 'https://notion.so/3201b00427a4805f8bf0fd21c61bce96' },
  { id: '9', name: 'SonarCloud 정적분석 도입 보고', tags: ['Todo', '문서'], dateStart: '2026-03-25', dateEnd: null, urgent: false, url: 'https://notion.so/example1' },
  { id: '10', name: 'k6 부하테스트 시나리오 작성', tags: ['Todo', '인프라'], dateStart: '2026-03-26', dateEnd: null, urgent: false, url: 'https://notion.so/example2' },
];

export default function App() {
  const { items, setItems, loading, error, fetchItems, updateStatus } = useNotion();
  const [view, setView] = useState('today');
  const [hideDone, setHideDone] = useState(false);
  const [notionLink, setNotionLink] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(null);
  const [alwaysOnTop, setAlwaysOnTop] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [darkMode, setDarkMode] = useState(false);

  const isElectron = !!window.api;

  // 초기 로드
  useEffect(() => {
    if (isElectron) {
      // Electron: 설정 로드 후 데이터 fetch
      window.api.getSettings().then(s => {
        setSettings(s);
        setAlwaysOnTop(s.alwaysOnTop ?? true);
        setOpacity(s.opacity ?? 1);
        setHideDone(s.hideDone ?? false);
        setNotionLink(s.notionLink ?? true);
        const savedView = s.view ?? 'today';
        setView(savedView);
        const dm = s.darkMode ?? false;
        setDarkMode(dm);
        document.documentElement.setAttribute('data-theme', dm ? 'dark' : 'light');
        if (!s.notionToken) {
          setShowSettings(true);
        }
      });
      fetchItems(view);
    } else {
      // 브라우저: Mock 데이터
      setItems(MOCK_DATA);
    }
  }, []);

  // 뷰/hideDone/notionLink 변경 시 설정 저장
  const handleSetView = useCallback((v) => {
    setView(v);
    if (isElectron) window.api.setSettings({ view: v });
  }, [isElectron]);

  // 뷰 변경 시 re-fetch (Electron만)
  useEffect(() => {
    if (isElectron) fetchItems(view);
  }, [view]);

  // Electron 자동 새로고침 이벤트 수신
  useEffect(() => {
    if (!isElectron) return;
    const unsub = window.api.onRefresh(() => fetchItems(view));
    return unsub;
  }, [view, fetchItems]);

  // 필터링 + 정렬
  const filtered = useMemo(() => {
    const data = isElectron ? items : items; // 동일하지만 명시적

    return data
      .filter(item => {
        if (!matchesDateView(item, view)) return false;
        if (hideDone && getStatus(item.tags) === 'Done 🙌') return false;
        return true;
      })
      .sort((a, b) => {
        if (a.urgent !== b.urgent) return b.urgent ? 1 : -1;
        const sa = STATUS_ORDER[getStatus(a.tags)] ?? 1;
        const sb = STATUS_ORDER[getStatus(b.tags)] ?? 1;
        return sa - sb;
      });
  }, [items, view, hideDone, isElectron]);

  // 통계
  const cnt = (s) => filtered.filter(i => getStatus(i.tags) === s).length;

  // 상태 변경 핸들러
  const handleToggle = useCallback(async (item, newStatus) => {
    setBusyId(item.id);
    const result = await updateStatus(item, newStatus);
    setBusyId(null);

    if (result.success) {
      setToast(`→ ${newStatus}`);
    } else {
      setToast(`실패: ${result.error}`);
    }
  }, [updateStatus]);

  // 설정 저장
  const handleSaveSettings = useCallback(async (partial) => {
    if (partial.hideDone !== undefined) setHideDone(partial.hideDone);
    if (partial.notionLink !== undefined) setNotionLink(partial.notionLink);
    if (isElectron) {
      const updated = await window.api.setSettings(partial);
      setSettings(updated);
      fetchItems(view);
    }
  }, [view, fetchItems, isElectron]);

  // 항상 위 토글
  const handleToggleAlwaysOnTop = useCallback(() => {
    const next = !alwaysOnTop;
    setAlwaysOnTop(next);
    if (isElectron) {
      window.api.setSettings({ alwaysOnTop: next });
    }
  }, [alwaysOnTop, isElectron]);

  // 투명도 변경
  const handleOpacityChange = useCallback((value) => {
    setOpacity(value);
    if (isElectron) {
      window.api.setSettings({ opacity: value });
    }
  }, [isElectron]);

  // 다크 모드 토글
  const handleToggleDarkMode = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    if (isElectron) {
      window.api.setSettings({ darkMode: next });
    }
  }, [darkMode, isElectron]);

  // 날짜 라벨
  const viewLabel = useMemo(() => {
    if (view === 'today') return fmtShort(todayStr());
    if (view === 'week') {
      const [ws, we] = getWeekRange();
      return `${fmtShort(ws)} ~ ${fmtShort(we)}`;
    }
    return '전체';
  }, [view]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* 타이틀바 */}
      <TitleBar
        alwaysOnTop={alwaysOnTop} onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
        opacity={opacity} onOpacityChange={handleOpacityChange}
        darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode}
      />

      {/* 서브 헤더 (기간 선택 + 카운트 + 설정) */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 8px 3px',
        borderBottom: '1px solid var(--border)',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {[
            { key: 'today', label: '오늘' },
            { key: 'week', label: '주간' },
            { key: 'all', label: '전체' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => handleSetView(key)} style={{
              fontSize: 11, padding: '2px 6px', borderRadius: 4,
              border: 'none', cursor: 'pointer',
              fontWeight: view === key ? 600 : 400,
              background: view === key ? 'var(--accent-bg)' : 'transparent',
              color: view === key ? 'var(--accent-text)' : 'var(--text-muted)',
            }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text-fainter)' }}>
            <span style={{ color: '#EF9F27' }}>{cnt('Doing')}</span>
            <span style={{ margin: '0 2px', opacity: 0.3 }}>·</span>
            <span style={{ color: '#E24B4A' }}>{cnt('Todo')}</span>
            <span style={{ margin: '0 2px', opacity: 0.3 }}>·</span>
            <span style={{ color: '#639922' }}>{cnt('Done 🙌')}</span>
          </span>
          <button
            onClick={() => setShowSettings(true)}
            title="설정"
            style={{
              background: 'transparent', border: 'none',
              cursor: 'pointer', fontSize: 12, color: 'var(--text-fainter)',
              lineHeight: 1, padding: 0,
            }}
          >⚙</button>
        </div>
      </div>

      {/* 로딩 표시 */}
      {loading && (
        <div style={{ padding: '0 8px', fontSize: 10, color: 'var(--text-faint)' }}>
          동기화 중...
        </div>
      )}

      {/* 할 일 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2px 0' }}>
        {filtered.map(item => (
          <TaskRow
            key={item.id}
            item={item}
            onToggle={handleToggle}
            busy={busyId === item.id}
            notionLink={notionLink}
          />
        ))}
        {filtered.length === 0 && !loading && (
          <div style={{
            textAlign: 'center', padding: '2rem 0',
            color: 'var(--text-fainter)', fontSize: 12,
          }}>
            {view === 'today' ? '오늘 할 일 없음 🎉' : '항목 없음'}
          </div>
        )}
      </div>

      {/* 에러 배너 */}
      {error && !showSettings && (
        <div style={{
          padding: '4px 8px', fontSize: 10, color: '#E24B4A',
          background: 'var(--error-bg)', borderTop: '1px solid var(--error-border)',
        }}>
          {error}
        </div>
      )}

      {/* 설정 패널 */}
      {showSettings && (
        <Settings
          settings={settings || { notionToken: '', databaseId: '394c0df8-9800-4e42-88d8-346ef29e5e80', refreshInterval: 300000 }}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 토스트 */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
