// slot.jsx — wheel-based picker panel (drives the daily selection)
const { useState: useStateSlot, useEffect: useEffectSlot, useRef: useRefSlot, useMemo: useMemoSlot } = React;

// Result card with flip-in animation, Google Maps button, etc.
function ResultCard({ restaurant, title, pickCount, onSwap }) {
  if (!restaurant) return null;
  const tone = restaurant.kind === '飲料' ? 'var(--p-sky-500)' : 'var(--p-primary-500)';
  return (
    <div className="fm-card-result" style={{
      animation: 'fm-flip-in .5s cubic-bezier(.2,.7,.2,1) both',
      transformStyle: 'preserve-3d',
    }}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--p-content-border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: `linear-gradient(180deg, color-mix(in srgb, ${tone} 6%, var(--p-surface-0)), var(--p-surface-0))`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className={restaurant.kind === '飲料' ? 'pi pi-glass-martini' : 'pi pi-shopping-bag'} style={{ color: tone, fontSize: 16 }} />
          <span className="p-eyebrow" style={{ color: tone, margin: 0 }}>{title}</span>
        </div>
        {pickCount > 0 && (
          <span style={{ fontSize: 11, color: 'var(--p-text-muted-color)', fontWeight: 600 }}>
            歷史第 {pickCount} 次
          </span>
        )}
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--p-border-radius-lg)',
            background: `linear-gradient(135deg, color-mix(in srgb, ${tone} 20%, var(--p-surface-0)), color-mix(in srgb, ${tone} 45%, var(--p-surface-0)))`,
            color: tone, fontSize: 28, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flex: '0 0 64px',
          }}>{(restaurant.name || '?').slice(0, 1)}</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className="p-h3" style={{ margin: 0, fontSize: 22 }}>{restaurant.name}</h3>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <FmChip>{restaurant.cuisine}</FmChip>
              <FmChip tone={restaurant.price === '100元以下' ? 'primary' : 'warn'}>{restaurant.price}</FmChip>
            </div>
            {restaurant.notes && (
              <p style={{
                fontSize: 14, color: 'var(--p-text-muted-color)', marginTop: 12, marginBottom: 0,
              }}>{restaurant.notes}</p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
          {restaurant.map && (
            <FmButton severity="primary" variant="solid" icon="pi-map-marker"
              onClick={() => window.open(restaurant.map, '_blank')}>
              開啟 Google Map
            </FmButton>
          )}
          {onSwap && (
            <FmButton severity="secondary" variant="outlined" icon="pi-refresh" onClick={onSwap}>
              再轉一次
            </FmButton>
          )}
        </div>
      </div>
    </div>
  );
}

// Main panel: pre-spin / spinning / post-spin
function SlotPanel({ dateKey, label, isToday, allowDrink }) {
  const state = window.useFmStore();
  const [phase, setPhase] = useStateSlot('idle');         // idle | spinning | done
  const [spinning, setSpinning] = useStateSlot(false);    // drives the actual wheel rotation
  const [mealTarget, setMealTarget] = useStateSlot(0);
  const [drinkTarget, setDrinkTarget] = useStateSlot(0);
  const [mealSettled, setMealSettled] = useStateSlot(false);
  const [drinkSettled, setDrinkSettled] = useStateSlot(true);
  const [withDrink, setWithDrink] = useStateSlot(allowDrink);
  const [filters, setFilters] = useStateSlot({ cuisine: 'all', price: 'all' });
  const [confetti, setConfetti] = useStateSlot(false);

  const meals = state.restaurants.filter(r => r.kind === '正餐'
    && (filters.cuisine === 'all' || r.cuisine === filters.cuisine)
    && (filters.price === 'all' || r.price === filters.price));
  const drinks = state.restaurants.filter(r => r.kind === '飲料');

  // dynamic cuisine list from the actual data
  const cuisines = Array.from(new Set(state.restaurants.filter(r => r.kind === '正餐').map(r => r.cuisine).filter(Boolean)));

  const existing = window.fmStore.getSpin(dateKey);

  function doSpin() {
    if (meals.length === 0) return;
    setPhase('spinning');
    setSpinning(false);
    setMealSettled(false);
    setDrinkSettled(!withDrink);

    const m = Math.floor(Math.random() * meals.length);
    const d = withDrink && drinks.length > 0 ? Math.floor(Math.random() * drinks.length) : 0;
    setMealTarget(m);
    setDrinkTarget(d);
    requestAnimationFrame(() => setSpinning(true));
  }

  useEffectSlot(() => {
    if (phase === 'spinning' && mealSettled && drinkSettled) {
      const mealId = meals[mealTarget]?.id;
      const drinkId = withDrink ? drinks[drinkTarget]?.id : null;
      window.fmStore.recordSpin(dateKey, mealId, drinkId);
      setPhase('done');
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2500);
    }
  }, [mealSettled, drinkSettled, phase]);

  function reSpin() {
    setPhase('idle');
    setSpinning(false);
  }

  // Existing result → straight to card view
  if (existing && phase === 'idle') {
    const meal = window.fmStore.findRestaurant(existing.meal);
    const drink = existing.drink ? window.fmStore.findRestaurant(existing.drink) : null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 720, margin: '0 auto' }}>
        <ResultCard restaurant={meal} title="正餐" pickCount={state.pickCount[meal?.id] || 0} onSwap={isToday ? reSpin : null} />
        {drink && <ResultCard restaurant={drink} title="飲料" pickCount={state.pickCount[drink?.id] || 0} />}
        {isToday && <RatingBar dateKey={dateKey} rating={existing.rating || 0} />}
      </div>
    );
  }

  return (
    <div>
      {phase !== 'done' && (
        <>
          {/* filters bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 24, gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <FilterPill label="料理" value={filters.cuisine}
                options={[{ value: 'all', label: '全部' }, ...cuisines.map(c => ({ value: c, label: c }))]}
                onChange={v => setFilters({ ...filters, cuisine: v })} />
              <FilterPill label="價格" value={filters.price}
                options={[{ value: 'all', label: '全部' }, { value: '100元以下', label: '100以下' }, { value: '100-200元', label: '100-200' }, { value: '200元以上', label: '200元以上' }]}
                onChange={v => setFilters({ ...filters, price: v })} />
              <div style={{ fontSize: 12, color: 'var(--p-text-muted-color)' }}>
                共 {meals.length} 家候選
              </div>
            </div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
              color: 'var(--p-text-color)', cursor: 'pointer', userSelect: 'none',
              padding: '6px 12px', background: 'var(--p-surface-50)',
              border: '1px solid var(--p-content-border-color)',
              borderRadius: 999,
            }}>
              <input type="checkbox" checked={withDrink} onChange={e => setWithDrink(e.target.checked)}
                style={{ accentColor: 'var(--p-primary-500)' }} />
              <i className="pi pi-glass-martini" style={{ fontSize: 12 }} />
              加上飲料
            </label>
          </div>

          {/* wheels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: withDrink ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'minmax(0, 1fr)',
            gap: 32,
            alignItems: 'start',
            justifyItems: 'center',
          }}>
            <WheelColumn label="正餐" tone="#10b981">
              {meals.length > 0 ? (
                <>
                  <Wheel
                    items={meals}
                    size={withDrink ? 340 : 420}
                    targetIndex={mealTarget}
                    spinning={spinning}
                    durationMs={5200}
                    tone="#10b981"
                    onSettled={() => setMealSettled(true)}
                  />
                  <WheelLegend items={meals}
                    highlightId={phase === 'done' ? meals[mealTarget]?.id : null}
                    tone="#10b981" />
                </>
              ) : <EmptyWheel size={withDrink ? 340 : 420} msg="沒有符合條件的店家" />}
            </WheelColumn>

            {withDrink && (
              <WheelColumn label="飲料" tone="#0ea5e9">
                {drinks.length > 0 ? (
                  <>
                    <Wheel
                      items={drinks}
                      size={340}
                      targetIndex={drinkTarget}
                      spinning={spinning}
                      durationMs={6200}
                      tone="#0ea5e9"
                      onSettled={() => setDrinkSettled(true)}
                    />
                    <WheelLegend items={drinks}
                      highlightId={phase === 'done' ? drinks[drinkTarget]?.id : null}
                      tone="#0ea5e9" />
                  </>
                ) : <EmptyWheel size={340} msg="沒有飲料店" />}
              </WheelColumn>
            )}
          </div>

          {/* spin button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <button onClick={doSpin} disabled={phase === 'spinning' || meals.length === 0}
              style={{
                position: 'relative',
                padding: '18px 56px',
                fontSize: 20, fontWeight: 800,
                fontFamily: 'inherit',
                color: '#fff',
                background: phase === 'spinning'
                  ? 'var(--p-surface-400)'
                  : 'linear-gradient(135deg, var(--p-emerald-500), var(--p-emerald-600))',
                border: 'none',
                borderRadius: 999,
                boxShadow: phase === 'spinning' ? 'none' : '0 8px 20px -6px rgba(16,185,129,.45)',
                cursor: phase === 'spinning' ? 'wait' : 'pointer',
                transition: 'all .2s',
                animation: phase === 'idle' && meals.length > 0 ? 'fm-pulse 2s infinite' : 'none',
                letterSpacing: '-0.01em',
              }}>
              <i className={phase === 'spinning' ? 'pi pi-spin pi-spinner' : 'pi pi-bolt'}
                style={{ marginRight: 10, fontSize: 18 }} />
              {phase === 'spinning' ? '轉動中…' : 'GO'}
            </button>
          </div>

          {phase === 'idle' && (
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--p-text-muted-color)' }}>
              {isToday ? '按下 GO,讓今天的午餐自己決定' : `為 ${label} 抽一個午餐(可重抽)`}
            </p>
          )}
        </>
      )}

      {phase === 'done' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 720, margin: '0 auto' }}>
          <ResultCard restaurant={meals[mealTarget]} title="正餐"
            pickCount={state.pickCount[meals[mealTarget]?.id] || 0}
            onSwap={reSpin} />
          {withDrink && drinks[drinkTarget] && (
            <ResultCard restaurant={drinks[drinkTarget]} title="飲料"
              pickCount={state.pickCount[drinks[drinkTarget]?.id] || 0} />
          )}
          {isToday && <RatingBar dateKey={dateKey} rating={0} />}
        </div>
      )}

      <FmConfetti active={confetti} />
    </div>
  );
}

function WheelColumn({ label, tone, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: tone }} />
        <span style={{
          fontSize: 12, fontWeight: 700, color: tone,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function EmptyWheel({ size, msg }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: '1px dashed var(--p-content-border-color)',
      background: 'var(--p-surface-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--p-text-muted-color)', fontSize: 14, textAlign: 'center', padding: 24,
    }}>{msg}</div>
  );
}

function FilterPill({ label, value, options, onChange }) {
  const [open, setOpen] = useStateSlot(false);
  const current = options.find(o => o.value === value);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          background: 'var(--p-surface-0)',
          border: '1px solid var(--p-content-border-color)',
          borderRadius: 999, cursor: 'pointer',
          color: 'var(--p-text-color)',
          whiteSpace: 'nowrap',
        }}>
        <span style={{ color: 'var(--p-text-muted-color)' }}>{label}:</span>
        {current?.label}
        <i className="pi pi-chevron-down" style={{ fontSize: 10 }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 11,
            background: 'var(--p-surface-0)',
            border: '1px solid var(--p-content-border-color)',
            borderRadius: 'var(--p-border-radius-md)',
            boxShadow: 'var(--p-shadow-overlay)',
            minWidth: 140, padding: 4,
          }}>
            {options.map(o => (
              <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '8px 10px',
                  background: o.value === value ? 'var(--p-primary-50)' : 'transparent',
                  color: o.value === value ? 'var(--p-primary-700)' : 'var(--p-text-color)',
                  fontSize: 13, fontWeight: o.value === value ? 600 : 500, fontFamily: 'inherit',
                  border: 'none', borderRadius: 'var(--p-border-radius-sm)',
                  cursor: 'pointer', textAlign: 'left',
                }}>
                {o.label}
                {o.value === value && <i className="pi pi-check" style={{ fontSize: 11 }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RatingBar({ dateKey, rating }) {
  const [val, setVal] = useStateSlot(rating);
  function rate(n) {
    setVal(n);
    window.fmStore.rateSpin(dateKey, n);
  }
  return (
    <div style={{
      padding: 16,
      background: 'var(--p-surface-0)',
      border: '1px solid var(--p-content-border-color)',
      borderRadius: 'var(--p-border-radius-lg)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--p-surface-900)' }}>好不好吃?</div>
        <div style={{ fontSize: 12, color: 'var(--p-text-muted-color)', marginTop: 2 }}>
          {val ? `已給 ${val} 顆星 — 隨時可以調整` : '吃完後幫餐廳評個分'}
        </div>
      </div>
      <FmStars value={val} onChange={rate} />
    </div>
  );
}

Object.assign(window, { SlotPanel, ResultCard });
