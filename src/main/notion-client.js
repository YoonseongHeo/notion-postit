import { STATUS_TAGS } from '../shared/constants.js';

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

/**
 * Notion API 요청 래퍼 (retry 포함)
 */
async function notionFetch(path, options, token, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(`${NOTION_API}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (res.status === 429) {
      const wait = parseInt(res.headers.get('Retry-After') || '1', 10);
      await new Promise(r => setTimeout(r, wait * 1000));
      continue;
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Notion API ${res.status}: ${body}`);
    }

    return res.json();
  }
  throw new Error('Rate limit exceeded after retries');
}

/**
 * 날짜 필터 빌드
 */
function buildDateFilter(view) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (view === 'today') {
    return {
      and: [
        { property: 'Date', date: { on_or_before: todayStr } },
        {
          or: [
            { property: 'Date', date: { on_or_after: todayStr } },
            // end date가 오늘 이후인 범위 항목도 포함
          ],
        },
      ],
    };
  }

  if (view === 'week') {
    const day = now.getDay();
    const mon = new Date(now);
    mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);

    return {
      and: [
        { property: 'Date', date: { on_or_before: sun.toISOString().split('T')[0] } },
        { property: 'Date', date: { on_or_after: mon.toISOString().split('T')[0] } },
      ],
    };
  }

  // 'all' → 필터 없음
  return undefined;
}

/**
 * Notion page → TodoItem 파싱
 */
function parsePage(page) {
  const props = page.properties;

  const name = props.Name?.title?.map(t => t.plain_text).join('') || '(제목 없음)';
  const tags = props.Tag?.multi_select?.map(t => t.name) || [];
  const date = props.Date?.date;
  const urgent = props['긴급']?.checkbox || false;

  // 상태 판별 (우선순위: Done > Doing > Todo)
  let status = null;
  if (tags.includes('Done 🙌')) status = 'Done 🙌';
  else if (tags.includes('Doing')) status = 'Doing';
  else if (tags.includes('Todo')) status = 'Todo';

  return {
    id: page.id,
    name,
    tags,
    status,
    dateStart: date?.start || null,
    dateEnd: date?.end || null,
    urgent,
    url: page.url,
  };
}

/**
 * DB에서 할 일 목록 조회
 */
export async function fetchItems(token, databaseId, view = 'today') {
  const filter = buildDateFilter(view);
  const body = {
    sorts: [
      { property: '긴급', direction: 'descending' },
      { property: 'Date', direction: 'ascending' },
    ],
    page_size: 100,
  };
  if (filter) body.filter = filter;

  const items = [];
  let cursor = undefined;

  do {
    const reqBody = { ...body };
    if (cursor) reqBody.start_cursor = cursor;

    const data = await notionFetch(
      `/databases/${databaseId}/query`,
      { method: 'POST', body: JSON.stringify(reqBody) },
      token,
    );

    items.push(...data.results.map(parsePage));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return items;
}

/**
 * 페이지 상태 태그 업데이트
 */
export async function updateStatus(token, pageId, currentTags, newStatus) {
  const categoryTags = currentTags.filter(t => !STATUS_TAGS.includes(t));
  const newTags = [
    { name: newStatus },
    ...categoryTags.map(name => ({ name })),
  ];

  return notionFetch(
    `/pages/${pageId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        properties: {
          Tag: { multi_select: newTags },
        },
      }),
    },
    token,
  );
}
