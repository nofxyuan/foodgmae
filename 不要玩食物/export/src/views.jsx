// views.jsx — Today (week strip + slot), History, Admin
const { useState: useStateViews, useMemo: useMemoViews } = React;

// ----- App Shell ------------------------------------------------------
function AppShell({ children, page, onPage }) {
  const state = window.useFmStore();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--p-content-border-color)',
      }}>
        <div className="fm-container" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FmMark />
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--p-surface-900)' }}>食物地圖</span>
            </div>
            <nav style={{ display: 'flex', gap: 4 }}>
              <button className={`fm-nav-btn ${page === 'today' ? 'is-active' : ''}`} onClick={() => onPage('today')}>
                <i className="pi pi-bolt" /> 今日轉盤
              </button>
              <button className={`fm-nav-btn ${page === 'history' ? 'is-active' : ''}`} onClick={() => onPage('history')}>
                <i className="pi pi-history" /> 歷史紀錄
              </button>
              <button className={`fm-nav-btn ${page === 'admin' ? 'is-active' : ''}`} onClick={() => onPage('admin')}>
                <i className="pi pi-cog" /> 管理店家
              </button>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ModeSwitch />
            <UserMenu />
          </div>
        </div>
      </header>
      <main style={{ flex: 1, paddingBottom: 80 }}>{children}</main>
    </div>
  );
}

function ModeSwitch() {
  const state = window.useFmStore();
  return (
    <div className="fm-seg">
      <button className={state.mode === 'personal' ? 'is-active' : ''} onClick={() => window.fmStore.setMode('personal')}>
        個人
      </button>
      <button className={state.mode === 'team' ? 'is-active' : ''} onClick={() => window.fmStore.setMode('team')}>
        團隊
      </button>
    </div>
  );
}

function UserMenu() {
  const state = window.useFmStore();
  const [open, setOpen] = useStateViews(false);
  if (!state.user) return null;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px 4px 4px',
        background: 'var(--p-surface-100)', border: '1px solid var(--p-content-border-color)',
        borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--p-emerald-400), var(--p-emerald-600))',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13,
        }}>{state.user.initial}</div>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{state.user.name}</span>
        <i className="pi pi-chevron-down" style={{ fontSize: 10, color: 'var(--p-text-muted-color)' }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 101,
            background: 'var(--p-surface-0)', border: '1px solid var(--p-content-border-color)',
            borderRadius: 'var(--p-border-radius-md)', boxShadow: 'var(--p-shadow-overlay)',
            minWidth: 220, padding: 8,
          }}>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--p-content-border-color)', marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{state.user.name}</div>
              <div style={{ fontSize: 12, color: 'var(--p-text-muted-color)' }}>{state.user.email}</div>
            </div>
            <MenuItem icon="pi-refresh" label="重置所有資料" onClick={() => {
              if (confirm('確定要清空所有紀錄、回到初始狀態?')) {
                window.fmStore.resetAll();
                setOpen(false);
              }
            }} />
            <MenuItem icon="pi-sign-out" label="登出" onClick={() => window.fmStore.logout()} />
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
      padding: '8px 10px', background: 'transparent', border: 'none',
      borderRadius: 'var(--p-border-radius-sm)', cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 13, color: 'var(--p-text-color)',
      textAlign: 'left',
    }} onMouseEnter={e => e.currentTarget.style.background = 'var(--p-surface-100)'}
       onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <i className={`pi ${icon}`} style={{ fontSize: 13, width: 16 }} />
      {label}
    </button>
  );
}

// ----- Today view ------------------------------------------------------
function TodayView() {
  const state = window.useFmStore();
  const today = useMemoViews(() => new Date(), []);
  const [selectedKey, setSelectedKey] = useStateViews(window.fmStore.todayKey(today));

  const monday = window.fmStore.mondayOf(today);
  const days = [0, 1, 2, 3, 4].map(i => {
    const d = window.fmStore.addDays(monday, i);
    return {
      date: d,
      key: window.fmStore.todayKey(d),
      label: ['週一', '週二', '週三', '週四', '週五'][i],
      dayNum: d.getDate(),
      isToday: window.fmStore.todayKey(d) === window.fmStore.todayKey(today),
      isFuture: d > today && window.fmStore.todayKey(d) !== window.fmStore.todayKey(today),
      isPast: d < today && window.fmStore.todayKey(d) !== window.fmStore.todayKey(today),
    };
  });

  const selected = days.find(d => d.key === selectedKey) || days.find(d => d.isToday) || days[0];

  return (
    <div className="fm-container" style={{ paddingTop: 32 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 8,
      }}>
        <div>
          <div className="p-eyebrow">
            {today.toLocaleDateString('zh-TW', { weekday: 'long' })} ·{' '}
            {state.mode === 'team' ? state.teamName : '個人模式'}
          </div>
          <h1 className="p-h2" style={{ marginTop: 6, marginBottom: 0 }}>
            {selected.isToday ? '今天吃什麼?' : `${selected.label}的安排`}
          </h1>
        </div>
        <div style={{ fontSize: 13, color: 'var(--p-text-muted-color)' }}>
          {today.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <WeekStrip days={days} selectedKey={selectedKey} onSelect={setSelectedKey} />

      <div style={{ marginTop: 28 }}>
        {selected.isFuture ? (
          <FutureBlock label={selected.label} />
        ) : (
          <SlotPanel
            key={selected.key}
            dateKey={selected.key}
            label={selected.label}
            isToday={selected.isToday}
            allowDrink={true}
          />
        )}
      </div>
    </div>
  );
}

function WeekStrip({ days, selectedKey, onSelect }) {
  const today = days.find(d => d.isToday);
  const selected = days.find(d => d.key === selectedKey);
  // figure out a slot summary for each day
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12,
    }}>
      {days.map(d => {
        const spin = window.fmStore.getSpin(d.key);
        const meal = spin ? window.fmStore.findRestaurant(spin.meal) : null;
        const drink = spin?.drink ? window.fmStore.findRestaurant(spin.drink) : null;
        const isSelected = d.key === selectedKey;
        const isBig = d.isToday;
        return (
          <button key={d.key}
            disabled={d.isFuture}
            onClick={() => !d.isFuture && onSelect(d.key)}
            className={`fm-week-day ${d.isToday ? 'is-today' : ''} ${d.isFuture ? 'is-future' : ''}`}
            style={{
              textAlign: 'left', fontFamily: 'inherit',
              outline: isSelected && !d.isToday ? '2px solid var(--p-primary-300)' : 'none',
              outlineOffset: -1,
              minHeight: isBig ? 140 : 110,
            }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 8,
            }}>
              <span style={{
                fontSize: isBig ? 13 : 12, fontWeight: 700,
                color: d.isToday ? 'var(--p-primary-700)' : 'var(--p-text-muted-color)',
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>{d.label}</span>
              <span style={{
                fontSize: isBig ? 24 : 18, fontWeight: 800,
                color: d.isToday ? 'var(--p-primary-700)' : 'var(--p-surface-900)',
                letterSpacing: '-0.02em', lineHeight: 1,
              }}>{d.dayNum}</span>
            </div>

            {meal ? (
              <div>
                <div style={{
                  fontSize: isBig ? 15 : 13, fontWeight: 700,
                  color: 'var(--p-surface-900)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{meal.name}</div>
                {drink && (
                  <div style={{
                    fontSize: 11, color: 'var(--p-sky-600)', marginTop: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>+ {drink.name}</div>
                )}
                {spin?.rating > 0 && (
                  <div style={{ display: 'flex', gap: 1, marginTop: 6 }}>
                    {[1,2,3,4,5].map(n => (
                      <i key={n} className={n <= spin.rating ? 'pi pi-star-fill' : 'pi pi-star'}
                        style={{ fontSize: 9, color: n <= spin.rating ? 'var(--p-amber-400)' : 'var(--p-surface-300)' }} />
                    ))}
                  </div>
                )}
              </div>
            ) : d.isFuture ? (
              <div style={{ fontSize: 12, color: 'var(--p-text-muted-color)' }}>
                <i className="pi pi-clock" style={{ marginRight: 4 }} />
                當天才能轉
              </div>
            ) : (
              <div style={{ fontSize: 12, color: d.isToday ? 'var(--p-primary-600)' : 'var(--p-text-muted-color)' }}>
                {d.isToday ? '← 按下方 GO' : '尚未抽選'}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function FutureBlock({ label }) {
  return (
    <div style={{
      padding: '60px 24px', textAlign: 'center',
      background: 'var(--p-surface-50)',
      border: '1px dashed var(--p-content-border-color)',
      borderRadius: 'var(--p-border-radius-lg)',
    }}>
      <i className="pi pi-clock" style={{ fontSize: 32, color: 'var(--p-surface-400)' }} />
      <div className="p-h4" style={{ marginTop: 16, color: 'var(--p-text-color)' }}>
        {label}還沒到
      </div>
      <p style={{ color: 'var(--p-text-muted-color)', fontSize: 14, marginTop: 8 }}>
        每天只能在當天轉一次,要等到那天才會解鎖。
      </p>
    </div>
  );
}

// ----- History view ----------------------------------------------------
function HistoryView() {
  const state = window.useFmStore();
  const key = window.fmStore.userKey(state);
  const spins = state.spins[key] || {};
  const entries = Object.entries(spins).sort((a, b) => b[0].localeCompare(a[0]));

  // top picks
  const counts = {};
  Object.values(spins).forEach(s => {
    if (s.meal) counts[s.meal] = (counts[s.meal] || 0) + 1;
    if (s.drink) counts[s.drink] = (counts[s.drink] || 0) + 1;
  });
  const ratings = {};
  Object.values(spins).forEach(s => {
    if (s.rating && s.meal) {
      ratings[s.meal] = ratings[s.meal] || [];
      ratings[s.meal].push(s.rating);
    }
  });
  const topPicks = Object.entries(counts)
    .sort((a, b) => b[1] - a[1]).slice(0, 4)
    .map(([id, c]) => ({ rest: window.fmStore.findRestaurant(id), count: c, ratings: ratings[id] || [] }))
    .filter(x => x.rest);

  return (
    <div className="fm-container" style={{ paddingTop: 32 }}>
      <div style={{ marginBottom: 8 }}>
        <div className="p-eyebrow">記錄</div>
        <h1 className="p-h2" style={{ marginTop: 6, marginBottom: 6 }}>歷史用餐紀錄</h1>
        <p style={{ color: 'var(--p-text-muted-color)', fontSize: 14, margin: 0 }}>
          {state.mode === 'team' ? `團隊「${state.teamName}」` : '個人'}的所有抽選結果。共 {entries.length} 筆。
        </p>
      </div>

      {topPicks.length > 0 && (
        <div style={{ marginTop: 32, marginBottom: 32 }}>
          <h3 className="p-h5" style={{ marginBottom: 12 }}>
            <i className="pi pi-trophy" style={{ color: 'var(--p-amber-500)', marginRight: 8 }} />
            常被抽中的店家
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {topPicks.map(p => {
              const avg = p.ratings.length > 0 ? (p.ratings.reduce((a,b)=>a+b,0)/p.ratings.length) : 0;
              return (
                <FmCard key={p.rest.id} style={{ padding: 16 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--p-text-muted-color)',
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>{p.rest.kind} · {p.rest.cuisine}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--p-surface-900)', marginTop: 4 }}>
                    {p.rest.name}
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 12, fontSize: 12, color: 'var(--p-text-muted-color)',
                  }}>
                    <span>{p.count} 次</span>
                    {avg > 0 && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <i className="pi pi-star-fill" style={{ color: 'var(--p-amber-400)', fontSize: 11 }} />
                        {avg.toFixed(1)}
                      </span>
                    )}
                  </div>
                </FmCard>
              );
            })}
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <FmCard style={{ padding: 60, textAlign: 'center', marginTop: 24 }}>
          <i className="pi pi-inbox" style={{ fontSize: 32, color: 'var(--p-surface-400)' }} />
          <div className="p-h4" style={{ marginTop: 12 }}>還沒有紀錄</div>
          <p style={{ color: 'var(--p-text-muted-color)', fontSize: 14 }}>
            回到「今日轉盤」按下 GO 開始第一次抽選。
          </p>
        </FmCard>
      ) : (
        <table className="fm-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>正餐</th>
              <th>飲料</th>
              <th>料理</th>
              <th>價格</th>
              <th>評分</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([dateKey, s]) => {
              const meal = window.fmStore.findRestaurant(s.meal);
              const drink = s.drink ? window.fmStore.findRestaurant(s.drink) : null;
              const d = new Date(dateKey);
              const wd = ['週日','週一','週二','週三','週四','週五','週六'][d.getDay()];
              return (
                <tr key={dateKey}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{dateKey.slice(5)}</div>
                    <div style={{ fontSize: 12, color: 'var(--p-text-muted-color)' }}>{wd}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{meal?.name || '—'}</td>
                  <td style={{ color: 'var(--p-sky-700)' }}>{drink?.name || '—'}</td>
                  <td><FmChip>{meal?.cuisine}</FmChip></td>
                  <td>
                    {meal && <FmChip tone={meal.price === '100元以下' ? 'primary' : 'warn'}>{meal.price}</FmChip>}
                  </td>
                  <td>
                    {s.rating > 0
                      ? <FmStars value={s.rating} size={14} />
                      : <span style={{ color: 'var(--p-text-muted-color)', fontSize: 12 }}>未評</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {meal?.map && (
                      <a href={meal.map} target="_blank" rel="noreferrer"
                        style={{ color: 'var(--p-primary-600)', fontSize: 13, textDecoration: 'none' }}>
                        <i className="pi pi-external-link" />
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ----- Admin / Sheet view ---------------------------------------------
function AdminView() {
  const state = window.useFmStore();
  const [search, setSearch] = useStateViews('');
  const [syncing, setSyncing] = useStateViews(false);

  const filtered = state.restaurants.filter(r =>
    !search || r.name.includes(search) || r.cuisine.includes(search) || (r.notes || '').includes(search));

  async function doSync() {
    setSyncing(true);
    await window.fmStore.syncFromSheet();
    setSyncing(false);
  }

  const sheet = state.sheet || {};
  const lastSyncLabel = sheet.lastSync ? formatRelative(new Date(sheet.lastSync)) : '尚未同步';

  return (
    <div className="fm-container" style={{ paddingTop: 32 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 8, gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <div className="p-eyebrow">資料來源</div>
          <h1 className="p-h2" style={{ marginTop: 6, marginBottom: 0 }}>店家管理</h1>
          <p style={{ color: 'var(--p-text-muted-color)', fontSize: 14, margin: '6px 0 0' }}>
            轉盤上的店家來自 Google 試算表。在試算表新增/編輯/刪除後,按下「重新同步」即可更新。
          </p>
        </div>
      </div>

      {/* Sheet sync banner */}
      <SheetBanner sheet={sheet} count={state.restaurants.length} onSync={doSync} syncing={syncing} />

      {/* Schema reference */}
      <details style={{
        marginTop: 16, padding: '12px 16px',
        background: 'var(--p-surface-50)',
        border: '1px solid var(--p-content-border-color)',
        borderRadius: 'var(--p-border-radius-md)',
        fontSize: 13,
      }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--p-text-color)' }}>
          <i className="pi pi-info-circle" style={{ marginRight: 8, color: 'var(--p-info-color)' }} />
          試算表欄位格式
        </summary>
        <div style={{ marginTop: 12, color: 'var(--p-text-muted-color)' }}>
          試算表第一列為欄位名,從第二列開始填店家:
          <table className="fm-table" style={{ marginTop: 12, fontSize: 13 }}>
            <thead>
              <tr><th>欄位</th><th>內容</th><th>範例</th></tr>
            </thead>
            <tbody>
              <tr><td><code>類別</code></td><td>正餐 / 飲料</td><td>正餐</td></tr>
              <tr><td><code>料理風格</code></td><td>中式 / 越式 / 日式 …</td><td>中式</td></tr>
              <tr><td><code>店家名稱</code></td><td>店名</td><td>蕭家小館</td></tr>
              <tr><td><code>價格區間</code></td><td>100元以下 / 100-200元 / 200元以上</td><td>100-200元</td></tr>
              <tr><td><code>google map / 地址</code></td><td>Google Map 連結</td><td>https://maps.app.goo.gl/...</td></tr>
              <tr><td><code>備註</code></td><td>招牌菜、特色</td><td>餃子 / 炒飯</td></tr>
            </tbody>
          </table>
        </div>
      </details>

      {/* Search + count */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        margin: '28px 0 12px', gap: 12, flexWrap: 'wrap',
      }}>
        <h3 className="p-h5" style={{ margin: 0, whiteSpace: 'nowrap' }}>
          目前 {state.restaurants.length} 家店
          {filtered.length !== state.restaurants.length && (
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--p-text-muted-color)', marginLeft: 8 }}>
              · 搜尋出 {filtered.length} 家
            </span>
          )}
        </h3>
        <FmInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜尋店家、料理、備註..."
          icon="pi-search"
          style={{ width: 280 }}
        />
      </div>

      {state.restaurants.length === 0 ? (
        <FmCard style={{ padding: 60, textAlign: 'center' }}>
          <i className="pi pi-table" style={{ fontSize: 32, color: 'var(--p-surface-400)' }} />
          <div className="p-h4" style={{ marginTop: 12 }}>試算表還沒有資料</div>
          <p style={{ color: 'var(--p-text-muted-color)', fontSize: 14, maxWidth: 360, margin: '8px auto 24px' }}>
            打開 Google 試算表,依照上方欄位格式填入店家,回來按「重新同步」就會出現在轉盤上。
          </p>
          <FmButton icon="pi-external-link" iconPos="right"
            onClick={() => window.open(sheet.url, '_blank')}>
            開啟 Google 試算表
          </FmButton>
        </FmCard>
      ) : (
        <table className="fm-table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>類別</th>
              <th style={{ width: 80 }}>料理</th>
              <th>店家名稱</th>
              <th style={{ width: 120 }}>價格</th>
              <th>備註</th>
              <th style={{ width: 60, textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td><FmChip tone={r.kind === '飲料' ? 'primary' : 'default'}>{r.kind}</FmChip></td>
                <td>{r.cuisine}</td>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td><FmChip tone={r.price === '100元以下' ? 'primary' : 'warn'}>{r.price}</FmChip></td>
                <td style={{ color: 'var(--p-text-muted-color)', fontSize: 13 }}>{r.notes}</td>
                <td style={{ textAlign: 'right' }}>
                  {r.map && (
                    <a href={r.map} target="_blank" rel="noreferrer" style={{
                      width: 28, height: 28, borderRadius: 'var(--p-border-radius-sm)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--p-text-muted-color)',
                    }}>
                      <i className="pi pi-map-marker" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function SheetBanner({ sheet, count, onSync, syncing }) {
  const status = sheet.lastStatus;
  const isErr = status === 'error';
  const isEmpty = status === 'empty';
  const isOk = status === 'ok';

  const tone = isErr ? 'var(--p-danger-color)'
    : isEmpty ? 'var(--p-warn-color)'
    : isOk ? 'var(--p-emerald-500)'
    : 'var(--p-surface-400)';

  const icon = isErr ? 'pi-exclamation-circle'
    : isEmpty ? 'pi-exclamation-triangle'
    : isOk ? 'pi-check-circle'
    : 'pi-table';

  const msg = isErr ? `同步失敗 — ${sheet.lastError || ''}`
    : isEmpty ? '試算表沒有資料 — 請在試算表中填入店家'
    : isOk ? `已成功同步 ${sheet.rowCount} 家店`
    : '尚未同步';

  return (
    <div style={{
      marginTop: 24,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      padding: '16px 20px',
      background: 'var(--p-surface-0)',
      border: '1px solid var(--p-content-border-color)',
      borderRadius: 'var(--p-border-radius-lg)',
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 320px', minWidth: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--p-border-radius-md)',
          background: `color-mix(in srgb, ${tone} 14%, var(--p-surface-0))`,
          color: tone,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <i className={`pi ${icon}`} style={{ fontSize: 18 }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 600, color: 'var(--p-surface-900)',
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            Google 試算表
            <span style={{ fontSize: 11, color: 'var(--p-text-muted-color)', fontWeight: 500 }}>
              · 最後同步 {sheet.lastSync ? formatRelative(new Date(sheet.lastSync)) : '尚未同步'}
            </span>
          </div>
          <div style={{ fontSize: 13, color: tone, marginTop: 2 }}>
            {msg}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <FmButton severity="secondary" variant="outlined" icon="pi-copy"
          onClick={async () => {
            const headers = ['類別', '料理風格', '店家名稱', '價格區間', 'google map / 地址', '備註'];
            const rows = window.fmStore.getState().restaurants.map(r =>
              [r.kind, r.cuisine, r.name, r.price, r.map || '', r.notes || ''].join('\t'));
            const tsv = [headers.join('\t'), ...rows].join('\n');
            try {
              await navigator.clipboard.writeText(tsv);
              alert(`已複製 ${rows.length} 家店的 TSV 到剪貼簿!\n\n操作步驟:\n1. 開啟試算表\n2. 點 A1 儲存格\n3. 按 Cmd/Ctrl + V 貼上\n4. 回到 app 按「重新同步」`);
            } catch (e) {
              prompt('複製失敗,請手動全選複製下方文字後貼到試算表 A1:', tsv);
            }
          }}>
          複製目前資料
        </FmButton>
        <FmButton severity="secondary" variant="outlined" icon="pi-external-link"
          onClick={() => window.open(sheet.url, '_blank')}>
          開啟試算表
        </FmButton>
        <FmButton severity="primary" icon={syncing ? null : 'pi-refresh'}
          loading={syncing} onClick={onSync}>
          重新同步
        </FmButton>
      </div>
    </div>
  );
}

function formatRelative(d) {
  const now = Date.now();
  const diff = Math.max(0, now - d.getTime());
  if (diff < 30 * 1000) return '剛剛';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分鐘前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} 小時前`;
  return d.toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

Object.assign(window, { AppShell, TodayView, HistoryView, AdminView });
