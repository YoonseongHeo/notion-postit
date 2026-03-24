const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function getWeekRange() {
  const now = new Date();
  const d = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (d === 0 ? 6 : d - 1));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return [fmt(mon), fmt(sun)];
}

function fmt(d) {
  return d.toISOString().split('T')[0];
}

export function fmtShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAYS[d.getDay()]})`;
}

/**
 * 아이템이 주어진 뷰에 해당하는 날짜인지 체크
 */
export function matchesDateView(item, view) {
  if (view === 'all') return true;
  if (!item.dateStart) return false;

  const today = todayStr();
  const end = item.dateEnd || item.dateStart;

  if (view === 'today') {
    return item.dateStart <= today && end >= today;
  }

  if (view === 'week') {
    const [weekStart, weekEnd] = getWeekRange();
    return end >= weekStart && item.dateStart <= weekEnd;
  }

  return true;
}
