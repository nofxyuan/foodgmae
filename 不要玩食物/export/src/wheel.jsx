// wheel.jsx — circular wheel-of-fortune picker
const { useState: useStateWheel, useEffect: useEffectWheel, useRef: useRefWheel, useMemo: useMemoWheel } = React;

// Sector colors — soft, muted palette that reads well against white
const WHEEL_PALETTE = [
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#0ea5e9', // sky-500
  '#a855f7', // purple-500
  '#ef4444', // red-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

// Compute SVG arc path for a single sector (i out of n) centered around top
function sectorPath(cx, cy, r, startAngle, endAngle) {
  const toXY = (a) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const [x1, y1] = toXY(startAngle);
  const [x2, y2] = toXY(endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

function Wheel({ items, size = 380, targetIndex, spinning, durationMs = 5500, onSettled, tone = '#10b981' }) {
  const wheelRef = useRefWheel(null);
  const pointerRef = useRefWheel(null);
  const tickIntervalRef = useRefWheel(null);
  const settledRef = useRefWheel(false);
  const rotationRef = useRefWheel(0); // current total rotation (degrees)

  const n = items.length;
  const sectorAngle = 360 / n;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const labelR = r * 0.66;

  // Sectors are drawn centered on each index's angle position.
  // Sector i covers [i*sectorAngle - sectorAngle/2, i*sectorAngle + sectorAngle/2]
  // so that index 0 is centered at the top (angle 0 = up = pointer location).

  useEffectWheel(() => {
    if (!spinning) return;
    settledRef.current = false;

    // Reset duration & start from current rotation
    const el = wheelRef.current;
    if (!el) return;

    // Build target rotation: bring sector targetIndex to top.
    // Wheel rotation R degrees: sector at angle theta now sits at theta + R.
    // We want sector center (which is at i*sectorAngle) to land at 0.
    // So R mod 360 should equal -i*sectorAngle (i.e. 360 - i*sectorAngle).
    const base = ((360 - targetIndex * sectorAngle) % 360 + 360) % 360;
    const spins = 6; // full rotations for drama
    const current = rotationRef.current;
    // jitter so the pointer doesn't always land dead center
    const jitter = (Math.random() - 0.5) * (sectorAngle * 0.5);
    const finalRotation = Math.floor(current / 360) * 360 + spins * 360 + base + jitter;

    el.style.transition = `transform ${durationMs}ms cubic-bezier(.16, .82, .22, 1)`;
    el.style.transform = `rotate(${finalRotation}deg)`;
    rotationRef.current = finalRotation;

    // tick sound effect — flick the pointer each time a sector crosses
    // we simulate by adding a CSS class periodically during the spin
    const start = performance.now();
    function loop() {
      const t = (performance.now() - start) / durationMs;
      if (t >= 1 || settledRef.current) return;
      // ease-out-ish: derivative ~ (1 - t) ^ k. We just slow down the ticks.
      const rate = Math.max(0.04, 1 - t * t); // 0..1
      const nextDelay = 90 + (1 - rate) * 600;
      if (pointerRef.current) {
        pointerRef.current.classList.remove('is-ticking');
        // force reflow to restart animation
        void pointerRef.current.offsetWidth;
        pointerRef.current.classList.add('is-ticking');
      }
      tickIntervalRef.current = setTimeout(loop, nextDelay);
    }
    tickIntervalRef.current = setTimeout(loop, 100);

    const settleHandle = setTimeout(() => {
      settledRef.current = true;
      clearTimeout(tickIntervalRef.current);
      onSettled && onSettled();
    }, durationMs + 50);

    return () => {
      clearTimeout(settleHandle);
      clearTimeout(tickIntervalRef.current);
    };
  }, [spinning, targetIndex, durationMs]);

  // colors stable per restaurant id
  function colorFor(i, item) {
    return WHEEL_PALETTE[i % WHEEL_PALETTE.length];
  }

  return (
    <div className="fm-wheel-stage" style={{ width: size, height: size }}>
      {/* pointer */}
      <svg className="fm-wheel-pointer" ref={pointerRef} width="36" height="48" viewBox="0 0 36 48">
        <path d="M 18 44 L 4 8 Q 18 0 32 8 Z"
          fill={tone}
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinejoin="round" />
        <circle cx="18" cy="12" r="3" fill="#ffffff" opacity="0.7" />
      </svg>

      {/* wheel */}
      <svg
        ref={wheelRef}
        className="fm-wheel"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(0deg)' }}
      >
        {/* outer ring */}
        <circle cx={cx} cy={cy} r={r + 3} fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />

        {/* sectors */}
        {items.map((item, i) => {
          const startAngle = i * sectorAngle - sectorAngle / 2;
          const endAngle = startAngle + sectorAngle;
          const fill = colorFor(i, item);
          return (
            <path
              key={item.id}
              d={sectorPath(cx, cy, r, startAngle, endAngle)}
              fill={fill}
              opacity={0.92}
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          );
        })}

        {/* labels — rotated so each is readable along its sector radius */}
        {items.map((item, i) => {
          const angle = i * sectorAngle; // sector center angle (0 = up)
          // place text along radius, rotated so it reads outward from center
          const rad = ((angle - 90) * Math.PI) / 180;
          const x = cx + labelR * Math.cos(rad);
          const y = cy + labelR * Math.sin(rad);
          // flip bottom-half labels so they read right-side-up
          const flip = angle > 90 && angle < 270;
          const textRotate = flip ? angle + 180 : angle;
          const display = (item.name || '').length > 7 ? item.name.slice(0, 7) + '…' : item.name;
          return (
            <text
              key={'t' + item.id}
              x={x}
              y={y}
              transform={`rotate(${textRotate} ${x} ${y})`}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Inter, sans-serif"
              fontSize={n > 10 ? 11 : n > 7 ? 12 : 13}
              fontWeight="700"
              fill="#ffffff"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {display}
            </text>
          );
        })}

        {/* inner shadow ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
      </svg>

      {/* hub */}
      <div className="fm-wheel-hub" style={{ color: tone }}>
        {spinning ? '…' : 'SPIN'}
      </div>
    </div>
  );
}

// Smaller helper: legend of items below the wheel
function WheelLegend({ items, highlightId, tone }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center',
      maxWidth: 380, margin: '12px auto 0',
    }}>
      {items.map((item, i) => {
        const fill = WHEEL_PALETTE[i % WHEEL_PALETTE.length];
        const active = item.id === highlightId;
        return (
          <span key={item.id} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: active ? `${fill}1a` : 'transparent',
            color: active ? fill : 'var(--p-text-muted-color)',
            border: `1px solid ${active ? fill : 'transparent'}`,
            transition: 'all .2s',
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: fill,
              opacity: active ? 1 : 0.6,
            }} />
            {item.name}
          </span>
        );
      })}
    </div>
  );
}

Object.assign(window, { Wheel, WheelLegend, WHEEL_PALETTE });
