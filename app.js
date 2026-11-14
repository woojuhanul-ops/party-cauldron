'use strict';
/* Party Cauldron — 통합 주방 시스템 앱 로직 (프레임워크 없음, 오프라인 동작)
 * 2026-11-14 점검 반영 개정:
 *  - 매칭이 수량을 본다 (단위 환산 가능한 범위에서 비교, 불가능하면 보수적으로 '부족' 처리)
 *  - 만료된 재료는 보유로 계산하지 않는다
 *  - 영어 이름 입력 → 한국어 정본 이름으로 바꿔 저장 (매칭·보관일수 정상 동작)
 *  - 레시피 조리 방법(steps) 표시, 큰 배율 단위 환산 표기
 *  - 수량 0 입력은 조용히 바꾸지 않고 안내 후 등록하지 않는다
 *  - 빈 재료 이름 제출도 조용히 넘기지 않고 안내 후 등록하지 않는다 (N1)
 *  - 같은 재료·단위·입고일 중복 등록은 새 행 대신 기존 행에 합산한다 (N2)
 *  - 보조 글씨 최소 13px + 글씨 크기(보통/크게) 토글 (N3)
 *  - 샘플 안내는 샘플 재료가 남아 있을 때만 표시
 *  - 장보기: 체크해도 사라지지 않고(취소선+되돌리기), 항목별 삭제, 담김 상태 버튼 표시
 */

const DEFAULT_SHELF_DAYS = 7; // 표준표에 없는 재료의 기본 보관일수

const STR = {
  ko: {
    title: 'Party Cauldron — 통합 주방 시스템',
    tagline: '통합 주방 시스템 — 유통기한부터 파티까지',
    cauldronTitle: '파티 콜드런', cauldronDesc: '먹을 인원을 정하면 모든 레시피의 재료량이 그 인원에 맞게 바뀝니다.',
    partySize: '인원', peopleUnit: '명',
    partyNote: n => `모든 레시피 재료량이 ${n}인분 기준으로 조절되어 표시됩니다.`,
    invTitle: '냉장고 재고 · 유통기한',
    ingName: '재료 이름', ingQty: '수량', ingUnit: '단위', ingDate: '입고일', addBtn: '재료 넣기',
    ingPlaceholder: '예: 두부',
    seedNote: '처음 방문이라 샘플 재료가 들어 있습니다. 자유롭게 지우고 쓰세요.',
    expiryHint: '유통기한은 재료별 표준 보관일수로 자동 계산한 참고값입니다.',
    addedLabel: '입고', expiryLabel: '유통기한', daysLeft: d => `${d}일 남음`, expiresToday: '오늘까지',
    expired: d => `${-d}일 지남 · 만료`, imminent: '임박', removeBtn: '삭제',
    storageLabel: s => s, unknownShelf: '표준일수 없음 · 기본 7일 적용',
    emptyInv: '아직 재료가 없습니다. 위에서 재료를 넣어 보세요.',
    qtyError: '수량은 0보다 큰 숫자를 넣어 주세요. 입력한 그대로만 저장됩니다.',
    nameError: '재료 이름을 넣어 주세요. 이름이 없으면 저장되지 않습니다.',
    recipeTitle: '오늘 뭐 해 먹지?', canMake: '지금 만들 수 있어요', almost: '조금 모자라요 · 이것만 사면 가능해요',
    allRecipes: '전체 레시피 보기',
    emptyCan: '지금 바로 만들 수 있는 요리가 없습니다. 재료를 더 넣어 보세요.',
    emptyAlmost: '재료 1~2개만 부족한 요리가 없습니다.',
    minutes: '분', baseServes: n => `기준 ${n}인분`, missingTag: '없음',
    shortTag: '부족', unknownQtyTag: '수량 확인 필요',
    haveNeed: (have, need, u) => `보유 ${have}${u} · 필요 ${need}${u}`,
    stepsTitle: '조리 방법',
    addToShop: '부족 재료 장보기 담기', inShop: '장보기 목록에 있음',
    shopTitle: '장보기 목록', clearBtn: '목록 비우기', emptyShop: '장보기 목록이 비어 있습니다. 레시피에서 부족 재료를 담아 보세요.',
    soundOn: '소리 켜짐', soundOff: '소리 꺼짐',
    fontNormal: '글씨 보통', fontLarge: '글씨 크게',
    footerData: '보관일수·레시피는 일반 자료 기반의 참고값입니다. 모든 기록은 이 기기의 브라우저에만 저장되며 서버로 전송되지 않습니다.'
  },
  en: {
    title: 'Party Cauldron — Integrated Kitchen System',
    tagline: 'Integrated Kitchen System — from expiry dates to parties',
    cauldronTitle: 'Party Cauldron', cauldronDesc: 'Set the number of guests and every recipe rescales its ingredients.',
    partySize: 'Guests', peopleUnit: '',
    partyNote: n => `All recipe quantities are scaled for ${n} guest(s).`,
    invTitle: 'Fridge Inventory · Expiry',
    ingName: 'Ingredient', ingQty: 'Qty', ingUnit: 'Unit', ingDate: 'Date added', addBtn: 'Add ingredient',
    ingPlaceholder: 'e.g. Tofu',
    seedNote: 'Sample ingredients were added for your first visit. Feel free to delete them.',
    expiryHint: 'Expiry dates are estimates from standard shelf-life values.',
    addedLabel: 'Added', expiryLabel: 'Expires', daysLeft: d => `${d}d left`, expiresToday: 'Expires today',
    expired: d => `Expired ${-d}d ago`, imminent: 'Soon', removeBtn: 'Delete',
    storageLabel: s => ({ '냉장': 'Fridge', '실온': 'Pantry' }[s] || s),
    unknownShelf: 'No standard value · default 7 days',
    emptyInv: 'No ingredients yet. Add some above.',
    qtyError: 'Please enter a quantity greater than 0. Nothing was saved.',
    nameError: 'Please enter an ingredient name. Nothing was saved.',
    recipeTitle: 'What should we cook?', canMake: 'You can make these now', almost: 'Just a little short · buy these to make it',
    allRecipes: 'Browse all recipes',
    emptyCan: 'Nothing is fully cookable yet. Add more ingredients.',
    emptyAlmost: 'No recipe is missing only 1–2 ingredients.',
    minutes: 'min', baseServes: n => `base ${n} serving(s)`, missingTag: 'missing',
    shortTag: 'short', unknownQtyTag: 'check amount',
    haveNeed: (have, need, u) => `have ${have}${u} · need ${need}${u}`,
    stepsTitle: 'How to cook',
    addToShop: 'Add missing to shopping list', inShop: 'In shopping list',
    shopTitle: 'Shopping List', clearBtn: 'Clear list', emptyShop: 'Your shopping list is empty. Add missing ingredients from a recipe.',
    soundOn: 'Sound on', soundOff: 'Sound off',
    fontNormal: 'Text normal', fontLarge: 'Text large',
    footerData: 'Shelf-life and recipe data are general reference values. Everything is stored only in this browser — nothing is sent to a server.'
  }
};

const UNIT_EN = { '개': 'pcs', '큰술': 'Tbsp', '작은술': 'tsp', '공기': 'bowl(s)', '장': 'sheet(s)', '마리': 'whole', '대': 'stalk(s)', '컵': 'cup(s)', '쪽': 'clove(s)', '조각': 'pc(s)', '모': 'block(s)', '팩': 'pack(s)', '봉지': 'bag(s)', 'g': 'g', 'kg': 'kg', 'ml': 'ml', 'L': 'L' };
const UNITS = ['개', 'g', 'kg', '팩', '모', '대', '장', '마리', '봉지', '컵', '큰술', '작은술', '쪽', '조각', '공기', 'ml', 'L'];

/* 단위 환산: 부피·무게는 g·ml 기준(1ml≈1g 근사)으로 서로 환산한다. */
const BASE_UNIT = { 'g': 1, 'kg': 1000, 'ml': 1, 'L': 1000, '큰술': 15, '작은술': 5, '컵': 200 };
/* 개수 단위 ↔ g 환산이 필요한 재료의 평균값 (재료별 1개/1단위당 g, 일반 자료 수준의 근사) */
const UNIT_GRAMS = {
  '두부': { '모': 300, '개': 300, '팩': 300 }, '마늘': { '개': 50, '쪽': 5 },
  '양파': { '개': 200 }, '감자': { '개': 150 }, '당근': { '개': 150 }, '애호박': { '개': 200 },
  '토마토': { '개': 150 }, '사과': { '개': 200 }, '배': { '개': 600 }, '레몬': { '개': 100 },
  '오이': { '개': 150 }, '청양고추': { '개': 10 }, '딸기': { '개': 15 },
  '상추': { '장': 10 }, '치즈': { '장': 20 }, '햄': { '장': 20, '개': 200, '팩': 200 },
  '식빵': { '장': 25 }, '김': { '장': 3 }, '연어': { '조각': 150 },
  '고등어': { '마리': 250 }, '오징어': { '마리': 200 }, '닭고기': { '마리': 1000 },
  '쌀': { '공기': 210, '컵': 180 },
  '소금': { '봉지': 500, '팩': 500, '개': 500 }, '설탕': { '봉지': 1000, '팩': 1000 },
  '참기름': { '개': 300 }, '간장': { '개': 500 }, '식용유': { '개': 900 },
  '고추장': { '개': 500, '팩': 500 }, '된장': { '개': 500, '팩': 500 },
  '떡': { '봉지': 500, '팩': 500 }, '어묵': { '봉지': 300, '팩': 300, '개': 300 },
  '버섯': { '팩': 200, '개': 200 }, '시금치': { '봉지': 200, '개': 200 },
  '콩나물': { '봉지': 300, '팩': 300 }, '김치': { '봉지': 500, '팩': 500, '개': 500 }
};
function gramsPer(unit, name) {
  if (Object.prototype.hasOwnProperty.call(BASE_UNIT, unit)) return BASE_UNIT[unit];
  const eq = UNIT_GRAMS[name];
  return eq && Object.prototype.hasOwnProperty.call(eq, unit) ? eq[unit] : null;
}
/* qty를 fromUnit에서 toUnit으로 환산. 불가능하면 null (보수적으로 부족 처리). */
function convertQty(qty, fromUnit, toUnit, name) {
  if (fromUnit === toUnit) return qty;
  const a = gramsPer(fromUnit, name), b = gramsPer(toUnit, name);
  if (a === null || b === null) return null;
  return qty * a / b;
}

/* 영어 이름 → 한국어 정본 이름 매핑 (SHELF_LIFE의 en에서 자동 구축) */
const EN_TO_KO = (() => {
  const map = {};
  Object.keys(SHELF_LIFE).forEach(ko => {
    const en = SHELF_LIFE[ko].en;
    if (!en) return;
    const variants = new Set();
    const full = en.toLowerCase();
    variants.add(full);
    const head = full.split('(')[0].trim(); if (head) variants.add(head);
    const inner = (full.match(/\(([^)]*)\)/) || [])[1]; if (inner) variants.add(inner.trim());
    variants.forEach(v => {
      map[v] = ko;
      if (v.endsWith('s')) map[v.slice(0, -1)] = ko;          // Eggs -> egg
      if (v.endsWith('oes')) map[v.slice(0, -2)] = ko;        // Tomatoes -> tomato
    });
  });
  return map;
})();
function canonicalName(raw) {
  const name = String(raw || '').trim();
  if (!name) return name;
  if (SHELF_LIFE[name]) return name;
  const low = name.toLowerCase().replace(/\s+/g, ' ');
  if (EN_TO_KO[low]) return EN_TO_KO[low];
  if (EN_TO_KO[low + 's']) return EN_TO_KO[low + 's'];
  return name;
}

/* ---------- 상태 ---------- */
function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
  catch (e) { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 저장 실패 시 무시 */ }
}

let lang = load('pc_lang', 'ko');
let party = load('pc_party', 2);
let soundOn = load('pc_sound', 'on') !== 'off'; // 효과음 설정 (기기 저장, 기본 켜짐)
let fontLarge = load('pc_font', 'normal') === 'large'; // 글씨 크기 설정 (기기 저장, 기본 보통)

/* ---------- 효과음·진동 (외부 파일 없이 WebAudio로 그 자리에서 생성) ----------
 * 소리는 사용자의 탭·입력에 반응해서만 재생한다 (자동 재생 없음).
 * 오디오·진동을 쓸 수 없는 환경에서는 조용히 아무 일도 하지 않는다. */
let actx = null;
function audioCtx() {
  if (!soundOn) return null;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!actx) actx = new AC();
    if (actx.state === 'suspended') actx.resume();
    return actx;
  } catch (e) { return null; }
}
function tone(freq, delay, dur, type, vol) {
  const ctx = audioCtx(); if (!ctx) return;
  try {
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  } catch (e) { /* 소리 실패는 무시 */ }
}
function sfx(kind) {
  if (!soundOn) return;
  if (kind === 'pop') { tone(620, 0, 0.09, 'sine', 0.055); tone(880, 0.03, 0.08, 'sine', 0.04); }
  else if (kind === 'chime') { tone(659, 0, 0.14, 'triangle', 0.05); tone(988, 0.09, 0.22, 'triangle', 0.05); }
  else if (kind === 'tick') { tone(1150, 0, 0.03, 'triangle', 0.018); }
  else if (kind === 'del') { tone(430, 0, 0.07, 'sine', 0.035); }
}
function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* 미지원 기기 무시 */ } }
let lastTickAt = 0;
function tickThrottled() {
  const now = Date.now();
  if (now - lastTickAt < 140) return;
  lastTickAt = now; sfx('tick');
}

/* 사용자 동작으로 인한 렌더인지 표시 — 매칭 성공 축하(알림음)는 동작 직후에만 울린다 */
let uiAct = false;
let prevCanCount = null;
let flashRef = null; // 방금 넣은 재고 행 표시용 {name, added, qty, unit}
let shopping = load('pc_shopping', []).map(s => typeof s === 'string' ? { name: s, done: false } : s);
let inventory = load('pc_inventory', null);

function dateStrOffset(daysAgo) {
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  return toDateStr(d);
}
if (inventory === null) {
  // 첫 방문 샘플 (데모용 합성 데이터)
  inventory = [
    { name: '김치', qty: 300, unit: 'g', added: dateStrOffset(3) },
    { name: '돼지고기', qty: 300, unit: 'g', added: dateStrOffset(1) },
    { name: '두부', qty: 1, unit: '모', added: dateStrOffset(0) },
    { name: '대파', qty: 3, unit: '대', added: dateStrOffset(2) },
    { name: '계란', qty: 10, unit: '개', added: dateStrOffset(5) },
    { name: '감자', qty: 4, unit: '개', added: dateStrOffset(6) },
    { name: '참기름', qty: 1, unit: '개', added: dateStrOffset(10) },
    { name: '소금', qty: 1, unit: '봉지', added: dateStrOffset(10) }
  ].map(i => Object.assign({ seeded: true }, i));
  save('pc_inventory', inventory);
  save('pc_seeded', true);
} else {
  // 구버전 재고 마이그레이션: 영어 이름으로 저장된 항목을 정본 이름으로 고치고,
  // 샘플 안내(pc_seeded)가 켜져 있던 재고는 샘플 표시를 붙인다 (안내 문구 종료 조건용).
  const wasSeeded = load('pc_seeded', false);
  inventory = inventory.map(i => {
    const fixed = Object.assign({}, i, { name: canonicalName(i.name) });
    if (wasSeeded && fixed.seeded === undefined) fixed.seeded = true;
    return fixed;
  });
  save('pc_inventory', inventory);
}

/* ---------- 날짜·계산 ---------- */
function toDateStr(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function parseDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function today() { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }
function expiryInfo(item) {
  const entry = SHELF_LIFE[item.name];
  const days = entry ? entry.days : DEFAULT_SHELF_DAYS;
  const exp = parseDate(item.added); exp.setDate(exp.getDate() + days);
  const left = Math.round((exp - today()) / 86400000);
  return { days, expiry: exp, left, known: !!entry, storage: entry ? entry.storage : '', expired: left < 0 };
}
function fmtQty(v) {
  const r = v >= 10 ? Math.round(v) : Math.round(v * 4) / 4;
  return Number.isInteger(r) ? String(r) : String(r);
}
function unitLabel(u) { return lang === 'en' ? (UNIT_EN[u] || u) : u; }
function ingLabel(name) {
  if (lang === 'en' && SHELF_LIFE[name]) return SHELF_LIFE[name].en;
  return name;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* 큰 수량을 읽기 좋은 단위로 환산해 병기한다 (예: 간장 30큰술 → 2.25컵 (450ml)) */
function displayQty(qty, unit, name) {
  let q = qty, u = unit;
  if (u === '작은술' && q >= 3) { q = q / 3; u = '큰술'; }
  if (u === '큰술') {
    const ml = Math.round(q * 15);
    if (ml >= 200) return `${fmtQty(ml / 200)}${unitLabel('컵')} (${ml}ml)`;
    if (q >= 4) return `${fmtQty(q)}${unitLabel(u)} (${ml}ml)`;
    return `${fmtQty(q)}${unitLabel(u)}`;
  }
  if (u === 'g' && q >= 1000) return `${fmtQty(q / 1000)}kg (${fmtQty(q)}g)`;
  if (u === 'kg' && q >= 10) return `${fmtQty(q)}kg`;
  if (u === 'ml' && q >= 1000) return `${fmtQty(q / 1000)}L (${fmtQty(q)}ml)`;
  if (u === '공기' && q >= 4) {
    const g = q * 210;
    return `${fmtQty(q)}${unitLabel(u)} (~${g >= 1000 ? fmtQty(g / 1000) + 'kg' : fmtQty(g) + 'g'})`;
  }
  if (u === '컵' && q >= 5) return `${fmtQty(q)}${unitLabel(u)} (~${fmtQty(q / 5)}L)`;
  return `${fmtQty(q)}${unitLabel(u)}`;
}

/* 레시피 재료 하나에 대한 보유 판정: ok | missing | short | unknown
 * 만료된 재고는 제외하고, 같은 재료의 여러 항목을 합산한다. */
function ingredientStatus(g, factor) {
  const need = g.q * factor;
  const items = inventory.filter(i => i.name === g.n && !expiryInfo(i).expired);
  if (!items.length) return { status: 'missing', need };
  let have = 0, unverifiable = false;
  items.forEach(i => {
    const c = convertQty(Number(i.qty) || 0, i.unit, g.u, g.n);
    if (c === null) unverifiable = true; else have += c;
  });
  if (have >= need) return { status: 'ok', need, have };
  if (unverifiable && have === 0) return { status: 'unknown', need };
  return { status: 'short', need, have };
}

/* ---------- 렌더링 ---------- */
const $ = id => document.getElementById(id);

function renderInventory() {
  const t = STR[lang];
  const rows = inventory.map((item, idx) => ({ item, idx, info: expiryInfo(item) }))
    .sort((a, b) => a.info.left - b.info.left);
  if (!rows.length) { $('inventoryList').innerHTML = `<p class="empty">${t.emptyInv}</p>`; return; }
  $('inventoryList').innerHTML = rows.map(({ item, idx, info }) => {
    const cls = info.left < 0 ? 'expired' : (info.left <= 3 ? 'warn' : 'ok');
    const badge = info.left < 0 ? t.expired(info.left) : (info.left === 0 ? t.expiresToday : t.daysLeft(info.left));
    const flash = flashRef && item.name === flashRef.name && item.added === flashRef.added
      && Number(item.qty) === flashRef.qty && item.unit === flashRef.unit ? ' flash' : '';
    return `<div class="inv-item ${cls}${flash}">
      <div class="inv-main">
        <strong>${esc(ingLabel(item.name))}</strong>
        <span class="inv-qty">${esc(displayQty(Number(item.qty) || 0, item.unit, item.name))}</span>
        ${info.left >= 0 && info.left <= 3 ? `<span class="tag tag-warn">${t.imminent}</span>` : ''}
      </div>
      <div class="inv-sub">
        ${t.addedLabel} ${esc(item.added)} · ${t.expiryLabel} ${toDateStr(info.expiry)} · ${info.storage ? esc(t.storageLabel(info.storage)) + ' · ' : ''}${info.known ? '' : esc(t.unknownShelf)}
      </div>
      <div class="inv-side">
        <span class="badge badge-${cls}">${esc(badge)}</span>
        <button type="button" class="ghost small" data-remove="${idx}">${t.removeBtn}</button>
      </div>
    </div>`;
  }).join('');
  $('inventoryList').querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      inventory.splice(Number(btn.dataset.remove), 1);
      save('pc_inventory', inventory);
      sfx('del');
      uiAct = true;
      renderAll();
    });
  });
  flashRef = null;
}

function recipeCard(recipe, probMap) {
  const t = STR[lang];
  const factor = party / recipe.servings;
  const ings = recipe.ingredients.map(g => {
    const p = probMap[g.n];
    const qtyTxt = displayQty(g.q * factor, g.u, g.n);
    if (!p) return `<li>${esc(ingLabel(g.n))} ${esc(qtyTxt)}</li>`;
    if (p.status === 'missing') return `<li class="missing">${esc(ingLabel(g.n))} ${esc(qtyTxt)} <span class="tag tag-warn">${t.missingTag}</span></li>`;
    if (p.status === 'short') return `<li class="short">${esc(ingLabel(g.n))} ${esc(qtyTxt)} <span class="tag tag-short">${t.shortTag} · ${esc(t.haveNeed(fmtQty(p.have), fmtQty(p.need), unitLabel(g.u)))}</span></li>`;
    return `<li class="short">${esc(ingLabel(g.n))} ${esc(qtyTxt)} <span class="tag tag-short">${t.unknownQtyTag}</span></li>`;
  }).join('');
  const probNames = Object.keys(probMap);
  const allInShop = probNames.length && probNames.every(n => shopping.some(s => s.name === n));
  const shopBtn = probNames.length
    ? `<button type="button" class="primary small" data-shop="${recipe.id}"${allInShop ? ' disabled' : ''}>${allInShop ? t.inShop : t.addToShop}</button>` : '';
  const steps = (typeof STEPS !== 'undefined' && STEPS[recipe.id]) ? (lang === 'en' ? STEPS[recipe.id].en : STEPS[recipe.id].ko) : null;
  const stepsHtml = steps ? `<details class="steps"><summary>${t.stepsTitle}</summary><ol>${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></details>` : '';
  return `<article class="recipe-card">
    <h4>${esc(lang === 'en' ? recipe.en : recipe.name)}</h4>
    <p class="recipe-meta">⏱ ${recipe.minutes}${t.minutes} · ${t.baseServes(recipe.servings)}${probNames.length ? ` · ${t.shortTag} ${probNames.length}` : ''}</p>
    <ul class="ing-list">${ings}</ul>
    ${stepsHtml}
    ${shopBtn}
  </article>`;
}

function renderRecipes() {
  const t = STR[lang];
  const analyzed = RECIPES.map(r => {
    const factor = party / r.servings;
    const probMap = {};
    r.ingredients.forEach(g => {
      const st = ingredientStatus(g, factor);
      if (st.status !== 'ok') probMap[g.n] = st;
    });
    return { r, probMap, problems: Object.keys(probMap).length };
  });
  const can = analyzed.filter(a => a.problems === 0);
  const almost = analyzed.filter(a => a.problems >= 1 && a.problems <= 2);
  // 사용자 동작으로 만들 수 있는 요리가 늘어난 순간에만 짧은 알림음+진동+반짝임
  if (uiAct && prevCanCount !== null && can.length > prevCanCount) {
    sfx('chime'); buzz(25);
    const head = document.querySelector('[data-i18n="canMake"]');
    if (head) { head.classList.remove('celebrate'); void head.offsetWidth; head.classList.add('celebrate'); }
  }
  prevCanCount = can.length;
  $('canMakeList').innerHTML = can.length ? can.map(a => recipeCard(a.r, a.probMap)).join('') : `<p class="empty">${t.emptyCan}</p>`;
  $('almostList').innerHTML = almost.length ? almost.map(a => recipeCard(a.r, a.probMap)).join('') : `<p class="empty">${t.emptyAlmost}</p>`;
  $('allList').innerHTML = analyzed.map(a => recipeCard(a.r, a.probMap)).join('');
  document.querySelectorAll('[data-shop]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = analyzed.find(a => a.r.id === btn.dataset.shop);
      if (!target) return;
      Object.keys(target.probMap).forEach(name => { if (!shopping.some(s => s.name === name)) shopping.push({ name, done: false }); });
      save('pc_shopping', shopping);
      sfx('pop'); buzz(15);
      uiAct = true;
      renderAll();
      $('shoppingList').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

function renderShopping() {
  const t = STR[lang];
  if (!shopping.length) { $('shoppingList').innerHTML = `<p class="empty">${t.emptyShop}</p>`; return; }
  $('shoppingList').innerHTML = shopping.map((item, i) =>
    `<div class="shop-item"><label class="shop-check"><input type="checkbox" data-shop-idx="${i}"${item.done ? ' checked' : ''}> <span class="${item.done ? 'done' : ''}">${esc(ingLabel(item.name))}</span></label><button type="button" class="ghost small" data-shop-del="${i}">${t.removeBtn}</button></div>`).join('');
  $('shoppingList').querySelectorAll('[data-shop-idx]').forEach(cb => {
    cb.addEventListener('change', () => {
      const idx = Number(cb.dataset.shopIdx);
      if (shopping[idx]) shopping[idx].done = cb.checked;
      save('pc_shopping', shopping);
      sfx('tick');
      renderShopping();
    });
  });
  $('shoppingList').querySelectorAll('[data-shop-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      shopping.splice(Number(btn.dataset.shopDel), 1);
      save('pc_shopping', shopping);
      sfx('del');
      renderShopping();
    });
  });
}

function applyI18n() {
  const t = STR[lang];
  document.documentElement.lang = lang === 'en' ? 'en' : 'ko';
  document.title = t.title;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (typeof t[key] === 'string') el.textContent = t[key];
  });
  $('langToggle').textContent = lang === 'en' ? '한국어' : 'EN';
  $('partyValue').textContent = party;
  $('partyNote').textContent = t.partyNote(party);
  $('seedNote').hidden = !inventory.some(i => i.seeded);
  $('ingName').placeholder = t.ingPlaceholder;
  // 자동완성 목록: 현재 언어의 이름으로
  $('ingList').innerHTML = Object.keys(SHELF_LIFE).map(n => `<option value="${esc(lang === 'en' ? SHELF_LIFE[n].en : n)}">`).join('');
  // 단위 선택지: 내부 값은 한국어 정본, 표시만 현재 언어
  const unitSel = $('ingUnit');
  const cur = unitSel.value || '개';
  unitSel.innerHTML = UNITS.map(u => `<option value="${esc(u)}">${esc(unitLabel(u))}</option>`).join('');
  unitSel.value = UNITS.includes(cur) ? cur : '개';
}

function renderSoundToggle() {
  const t = STR[lang];
  const btn = $('soundToggle');
  if (!btn) return;
  btn.setAttribute('aria-pressed', String(soundOn));
  $('soundIcon').textContent = soundOn ? '🔊' : '🔇';
  $('soundLabel').textContent = soundOn ? t.soundOn : t.soundOff;
}

function renderFontToggle() {
  const t = STR[lang];
  const btn = $('fontToggle');
  if (!btn) return;
  btn.setAttribute('aria-pressed', String(fontLarge));
  $('fontLabel').textContent = fontLarge ? t.fontLarge : t.fontNormal;
  document.body.classList.toggle('font-large', fontLarge);
}

function renderAll() { applyI18n(); renderSoundToggle(); renderFontToggle(); renderInventory(); renderRecipes(); renderShopping(); uiAct = false; }

/* ---------- 이벤트 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  $('ingDate').value = toDateStr(new Date());
  $('partySlider').value = party;

  $('addForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = canonicalName($('ingName').value);
    if (!name) {
      // 이름이 비면 조용히 넘기지 않는다 — 수량 오류와 같은 방식으로 안내하고 등록하지 않는다
      $('formError').textContent = STR[lang].nameError;
      $('formError').hidden = false;
      return;
    }
    const qtyRaw = $('ingQty').value;
    const qty = Number(qtyRaw);
    if (qtyRaw === '' || isNaN(qty) || qty <= 0) {
      // 0 이하·빈값은 조용히 바꾸지 않는다 — 안내하고 등록하지 않는다
      $('formError').textContent = STR[lang].qtyError;
      $('formError').hidden = false;
      return;
    }
    $('formError').hidden = true;
    const item = {
      name,
      qty,
      unit: $('ingUnit').value,
      added: $('ingDate').value || toDateStr(new Date())
    };
    // 같은 재료·단위·입고일이면 새 행을 만들지 않고 기존 행에 수량을 합친다.
    // 입고일이 다르면 유통기한이 달라지므로 합치지 않는다 — 합산 총량과 만료 판정은 기존과 동일하게 유지된다.
    const dup = inventory.find(i => i.name === item.name && i.unit === item.unit && i.added === item.added);
    if (dup) {
      dup.qty = (Number(dup.qty) || 0) + qty;
      flashRef = { name: dup.name, added: dup.added, qty: dup.qty, unit: dup.unit };
    } else {
      inventory.push(item);
      flashRef = { name: item.name, added: item.added, qty: item.qty, unit: item.unit };
    }
    save('pc_inventory', inventory);
    $('ingName').value = '';
    sfx('pop'); buzz(15);
    uiAct = true;
    renderAll();
  });

  $('partySlider').addEventListener('input', e => {
    party = Number(e.target.value);
    save('pc_party', party);
    tickThrottled();
    uiAct = true;
    renderAll();
  });

  $('langToggle').addEventListener('click', () => {
    lang = lang === 'ko' ? 'en' : 'ko';
    save('pc_lang', lang);
    sfx('tick');
    renderAll();
  });

  $('soundToggle').addEventListener('click', () => {
    soundOn = !soundOn;
    save('pc_sound', soundOn ? 'on' : 'off');
    renderSoundToggle();
    if (soundOn) sfx('pop'); // 켜는 순간에만 확인음
  });

  $('fontToggle').addEventListener('click', () => {
    fontLarge = !fontLarge;
    save('pc_font', fontLarge ? 'large' : 'normal');
    renderFontToggle();
    sfx('tick');
  });

  $('clearShopping').addEventListener('click', () => {
    if (shopping.length) sfx('del');
    shopping = [];
    save('pc_shopping', shopping);
    renderShopping();
  });

  renderAll();
});
