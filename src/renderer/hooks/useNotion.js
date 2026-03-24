import { useState, useEffect, useCallback, useRef } from 'react';

const STATUS_TAGS = ['Todo', 'Doing', 'Done 🙌'];

/**
 * Notion 데이터 조회/업데이트 훅
 * - Electron 환경: window.api (IPC) 사용
 * - 브라우저 환경: 직접 fetch (개발/테스트용)
 */
export function useNotion() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const isElectron = !!window.api;

  const fetchItems = useCallback(async (view = 'today') => {
    setLoading(true);
    setError(null);

    try {
      if (isElectron) {
        // Electron IPC
        const result = await window.api.fetchItems(view);
        if (result.error) setError(result.error);
        setItems(result.items || []);
      } else {
        // 브라우저 직접 호출 (개발용 - .env의 토큰 필요)
        // 여기서는 빈 배열 반환 (프로토타입용 mock 데이터는 App에서 처리)
        setItems([]);
        setError('Not in Electron. Using mock data.');
      }
      setLastSync(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isElectron]);

  const updateStatus = useCallback(async (item, newStatus) => {
    const prevTags = [...item.tags];

    // 1. Optimistic update
    setItems(prev => prev.map(i => {
      if (i.id !== item.id) return i;
      const newTags = [newStatus, ...i.tags.filter(t => !STATUS_TAGS.includes(t))];
      return { ...i, tags: newTags, status: newStatus };
    }));

    try {
      if (isElectron) {
        const result = await window.api.updateStatus(item.id, prevTags, newStatus);
        if (!result.success) {
          throw new Error(result.error);
        }
      }
      // 브라우저 모드에서는 그냥 로컬만 업데이트
      return { success: true };
    } catch (err) {
      // Rollback
      setItems(prev => prev.map(i => {
        if (i.id !== item.id) return i;
        return { ...i, tags: prevTags };
      }));
      return { success: false, error: err.message };
    }
  }, [isElectron]);

  return {
    items, setItems,
    loading, error,
    lastSync,
    fetchItems,
    updateStatus,
  };
}
