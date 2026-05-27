// data.js — seed data + persistence + helpers
// All state goes through window.fmStore so the various jsx files can share it.

(function () {
  const STORAGE_KEY = 'fm_state_v1';

  // ----- seed restaurants (from user's spreadsheet) ---------------------
  const seedRestaurants = [
    { id: 'r1',  kind: '正餐', cuisine: '中式',  name: '可口豬肝湯麻醬麵', price: '100-200元', notes: '乾麵 / 麻醬麵 / 豬肝湯', map: 'https://maps.app.goo.gl/PMVvwCBvjManAqiL7' },
    { id: 'r2',  kind: '正餐', cuisine: '中式',  name: '今頂小吃',         price: '100-200元', notes: '',                       map: 'https://maps.app.goo.gl/UkAzqWUbL76FhLJj8' },
    { id: 'r3',  kind: '飲料', cuisine: '中式',  name: '藍衫茶所',         price: '100元以下', notes: '藍衫奶茶',               map: 'https://maps.app.goo.gl/x4PmdtZd4JrgBjYY6' },
    { id: 'r4',  kind: '正餐', cuisine: '中式',  name: '1976道地香港美食', price: '100元以下', notes: '',                       map: 'https://maps.app.goo.gl/5za3ZvfBAoBTN3fH8' },
    { id: 'r5',  kind: '正餐', cuisine: '中式',  name: '香味饌',           price: '100元以下', notes: '月底的好朋友',           map: 'https://maps.app.goo.gl/3SbT5WQJ5k4PBoqY7' },
    { id: 'r6',  kind: '正餐', cuisine: '中式',  name: '青春素麵線-佛綠本', price: '100-200元', notes: '臭豆腐 / 麻辣 / 大補湯', map: 'https://maps.app.goo.gl/QwfzX31ZNNafBbU69' },
    { id: 'r7',  kind: '正餐', cuisine: '越式',  name: 'Pho 越南美味',      price: '100-200元', notes: '',                       map: 'https://maps.app.goo.gl/8rKfTasu9qcZBZDn6' },
    { id: 'r8',  kind: '正餐', cuisine: '中式',  name: '大鍋鍋 香香鍋',     price: '100-200元', notes: '火鍋',                   map: 'https://maps.app.goo.gl/UJEHkkGMxbm8ZQ696' },
    { id: 'r9',  kind: '正餐', cuisine: '中式',  name: '蕭家小館',          price: '100-200元', notes: '餃子 / 炒飯',            map: 'https://maps.app.goo.gl/4TSyL7qVjfCE9Pzw7' },
    { id: 'r10', kind: '正餐', cuisine: '中式',  name: '小胖胖扁食',        price: '100-200元', notes: '排骨飯 / 便當系列',      map: 'https://maps.app.goo.gl/ciNHMyVeSGuNTReQ7' },
    { id: 'r11', kind: '正餐', cuisine: '中式',  name: '小正太小碗菜',      price: '100-200元', notes: '酸菜魚',                  map: 'https://maps.app.goo.gl/AziYpGKykUcow4t5A' },
    { id: 'r12', kind: '正餐', cuisine: '中式',  name: '張亮麻辣燙',        price: '100-200元', notes: '可以拿很多青菜',         map: 'https://maps.app.goo.gl/icNvJVRxy2nSbZUX9' },
    // a couple seeded drinks so the demo has options
    { id: 'r13', kind: '飲料', cuisine: '中式',  name: '清心福全',          price: '100元以下', notes: '波霸奶茶 / 多多綠',     map: 'https://maps.app.goo.gl/' },
    { id: 'r14', kind: '飲料', cuisine: '中式',  name: '可不可熟成紅茶',    price: '100元以下', notes: '熟成紅茶',               map: 'https://maps.app.goo.gl/' },
    { id: 'r15', kind: '飲料', cuisine: '日式',  name: '茶湯會',            price: '100元以下', notes: '觀音拿鐵 / 四季春',     map: 'https://maps.app.goo.gl/' },
  ];

  // ----- helpers --------------------------------------------------------
  function todayKey(d) {
    d = d || new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  // mon=0 .. sun=6
  function weekdayIndex(d) {
    const w = d.getDay(); // sun=0, sat=6
    return (w + 6) % 7;
  }
  function mondayOf(d) {
    const m = new Date(d);
    m.setDate(m.getDate() - weekdayIndex(m));
    m.setHours(0, 0, 0, 0);
    return m;
  }
  function addDays(d, n) {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }

  // ----- state ----------------------------------------------------------
  function defaultState() {
    return {
      user: null, // { name, email, picture }
      mode: 'personal', // 'personal' | 'team'
      teamName: '工程部午餐隊',
      restaurants: seedRestaurants,
      // sheet sync metadata
      sheet: {
        url: 'https://docs.google.com/spreadsheets/d/1e8x7Bh3CIyBHv4IUgZ9uerDe-ZnX6EetAI1Txdruabs/edit?usp=sharing',
        id:  '1e8x7Bh3CIyBHv4IUgZ9uerDe-ZnX6EetAI1Txdruabs',
        lastSync: null,
        lastStatus: null,   // 'ok' | 'empty' | 'error'
        lastError: null,
        rowCount: 0,
      },
      // spins: { [userKey]: { [dateKey]: { meal: restId, drink: restId|null, rating: 1-5 } } }
      spins: {},
      // tally of how many times a restaurant has been picked (for the "freq" badge)
      pickCount: {},
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      // merge in any new seed restaurants on schema bump
      return { ...defaultState(), ...parsed };
    } catch (e) {
      return defaultState();
    }
  }
  function save(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
  }

  // ----- pub/sub --------------------------------------------------------
  const listeners = new Set();
  let state = load();

  function getState() { return state; }
  function setState(updater) {
    state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
    save(state);
    listeners.forEach(fn => fn(state));
  }
  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  // ----- actions --------------------------------------------------------
  function userKey(s = state) {
    return s.mode === 'team' ? `team:${s.teamName}` : `user:${s.user?.email || 'anon'}`;
  }

  function getSpin(dateKey, s = state) {
    return s.spins?.[userKey(s)]?.[dateKey] || null;
  }

  function recordSpin(dateKey, mealId, drinkId) {
    setState(s => {
      const key = userKey(s);
      const userSpins = { ...(s.spins[key] || {}) };
      userSpins[dateKey] = { meal: mealId, drink: drinkId || null, rating: 0, ratedAt: null };
      const pickCount = { ...s.pickCount };
      if (mealId) pickCount[mealId] = (pickCount[mealId] || 0) + 1;
      if (drinkId) pickCount[drinkId] = (pickCount[drinkId] || 0) + 1;
      return { ...s, spins: { ...s.spins, [key]: userSpins }, pickCount };
    });
  }

  function rateSpin(dateKey, rating) {
    setState(s => {
      const key = userKey(s);
      const userSpins = { ...(s.spins[key] || {}) };
      const cur = userSpins[dateKey];
      if (!cur) return s;
      userSpins[dateKey] = { ...cur, rating, ratedAt: new Date().toISOString() };
      return { ...s, spins: { ...s.spins, [key]: userSpins } };
    });
  }

  function findRestaurant(id, s = state) {
    return s.restaurants.find(r => r.id === id) || null;
  }

  function addRestaurant(r) {
    setState(s => {
      const id = 'r' + (Date.now().toString(36));
      return { ...s, restaurants: [...s.restaurants, { ...r, id }] };
    });
  }

  function updateRestaurant(id, patch) {
    setState(s => ({
      ...s,
      restaurants: s.restaurants.map(r => r.id === id ? { ...r, ...patch } : r),
    }));
  }

  function deleteRestaurant(id) {
    setState(s => ({
      ...s,
      restaurants: s.restaurants.filter(r => r.id !== id),
    }));
  }

  function login(user) {
    setState(s => ({ ...s, user }));
  }
  function logout() {
    setState(s => ({ ...s, user: null }));
  }
  function setMode(mode) {
    setState(s => ({ ...s, mode }));
  }
  function setTeamName(name) {
    setState(s => ({ ...s, teamName: name }));
  }

  function resetAll() {
    state = defaultState();
    save(state);
    listeners.forEach(fn => fn(state));
  }

  // ----- Google Sheet sync ---------------------------------------------
  // Parses the gviz JSON response. Columns expected (by index):
  //   0=類別, 1=料理風格, 2=店家名稱, 3=價格區間, 4=google map連結, 5=備註
  function parseSheetJson(raw) {
    // gviz wraps response: `/*O_o*/\ngoogle.visualization.Query.setResponse(<json>);`
    const m = raw.match(/setResponse\((.*)\);?\s*$/s);
    if (!m) throw new Error('無法解析試算表回應');
    const obj = JSON.parse(m[1]);
    if (obj.status !== 'ok') throw new Error(obj.errors?.[0]?.detailed_message || '試算表回應錯誤');
    const rows = obj.table?.rows || [];
    const cols = obj.table?.cols || [];

    // Map labels → index for flexibility (so column order isn't strict)
    const labelMap = {};
    cols.forEach((c, i) => {
      const lbl = (c.label || '').trim();
      if (lbl) labelMap[lbl] = i;
    });
    function pick(row, names, fallbackIdx) {
      for (const n of names) {
        if (labelMap[n] != null) return row.c[labelMap[n]]?.v ?? '';
      }
      return row.c[fallbackIdx]?.v ?? '';
    }

    const restaurants = [];
    rows.forEach((row, i) => {
      if (!row?.c) return;
      const name = String(pick(row, ['店家名稱', '名稱', 'name'], 2) || '').trim();
      if (!name) return; // skip empty rows
      restaurants.push({
        id: 'sheet_' + (i + 1),
        kind: String(pick(row, ['類別', '類型'], 0) || '正餐').trim(),
        cuisine: String(pick(row, ['料理風格', '料理'], 1) || '其他').trim(),
        name,
        price: String(pick(row, ['價格區間', '價格'], 3) || '100-200元').trim(),
        map: String(pick(row, ['google map / 地址', 'google map', 'Google Map', '地址', '連結'], 4) || '').trim(),
        notes: String(pick(row, ['備註', '特色', 'notes'], 5) || '').trim(),
      });
    });
    return restaurants;
  }

  async function syncFromSheet() {
    const id = state.sheet?.id;
    if (!id) return { status: 'error', error: '尚未設定試算表' };
    const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&headers=1`;
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const text = await r.text();
      const parsed = parseSheetJson(text);
      const now = new Date().toISOString();
      if (parsed.length === 0) {
        setState(s => ({
          ...s,
          sheet: { ...s.sheet, lastSync: now, lastStatus: 'empty', lastError: null, rowCount: 0 },
        }));
        return { status: 'empty' };
      }
      setState(s => ({
        ...s,
        restaurants: parsed,
        sheet: { ...s.sheet, lastSync: now, lastStatus: 'ok', lastError: null, rowCount: parsed.length },
      }));
      return { status: 'ok', count: parsed.length };
    } catch (e) {
      setState(s => ({
        ...s,
        sheet: { ...s.sheet, lastSync: new Date().toISOString(), lastStatus: 'error', lastError: String(e.message || e) },
      }));
      return { status: 'error', error: String(e.message || e) };
    }
  }

  // ----- exports --------------------------------------------------------
  window.fmStore = {
    getState, setState, subscribe,
    todayKey, weekdayIndex, mondayOf, addDays,
    userKey, getSpin, recordSpin, rateSpin, findRestaurant,
    addRestaurant, updateRestaurant, deleteRestaurant,
    login, logout, setMode, setTeamName, resetAll,
    syncFromSheet,
  };

  // a hook for components
  window.useFmStore = function () {
    const [, setTick] = React.useState(0);
    React.useEffect(() => window.fmStore.subscribe(() => setTick(x => x + 1)), []);
    return window.fmStore.getState();
  };
})();
