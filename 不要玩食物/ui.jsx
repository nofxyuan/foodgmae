// ui.jsx — shared PrimeNG-style primitives
const { useState } = React;

function FmButton({
  children, onClick, severity = 'primary', variant = 'solid',
  size = 'md', icon, iconPos = 'left', loading, disabled, style, type = 'button',
}) {
  const colorMap = {
    primary:   { solid: 'var(--p-primary-500)',   hover: 'var(--p-primary-600)',   text: '#fff' },
    secondary: { solid: 'var(--p-surface-500)',   hover: 'var(--p-surface-600)',   text: '#fff' },
    success:   { solid: 'var(--p-emerald-500)',   hover: 'var(--p-emerald-600)',   text: '#fff' },
    info:      { solid: 'var(--p-sky-500)',       hover: 'var(--p-sky-600)',       text: '#fff' },
    warn:      { solid: 'var(--p-amber-500)',     hover: 'var(--p-amber-600)',     text: '#fff' },
    danger:    { solid: 'var(--p-red-500)',       hover: 'var(--p-red-600)',       text: '#fff' },
    contrast:  { solid: 'var(--p-surface-900)',   hover: 'var(--p-surface-700)',   text: '#fff' },
  };
  const c = colorMap[severity] || colorMap.primary;
  const sz = {
    sm: { padding: '6px 10px', fontSize: 12 },
    md: { padding: '8px 14px', fontSize: 14 },
    lg: { padding: '12px 20px', fontSize: 16 },
  }[size];

  const [hover, setHover] = useState(false);
  let bg, color, border;
  if (variant === 'outlined') {
    bg = hover ? 'var(--p-surface-100)' : 'transparent';
    color = c.solid;
    border = `1px solid ${c.solid}`;
  } else if (variant === 'text') {
    bg = hover ? 'var(--p-content-hover-background)' : 'transparent';
    color = c.solid;
    border = '1px solid transparent';
  } else {
    bg = hover ? c.hover : c.solid;
    color = c.text;
    border = '1px solid transparent';
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: bg, color, border, borderRadius: 'var(--p-border-radius-md)',
        fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1, transition: 'all .2s', whiteSpace: 'nowrap',
        ...sz, ...style,
      }}>
      {loading && <i className="pi pi-spin pi-spinner" />}
      {!loading && icon && iconPos === 'left' && <i className={`pi ${icon}`} />}
      {children}
      {!loading && icon && iconPos === 'right' && <i className={`pi ${icon}`} />}
    </button>
  );
}

function FmInput({ label, value, onChange, placeholder, type = 'text', icon, helpText, size = 'md', style }) {
  const [focused, setFocused] = useState(false);
  const sz = {
    sm: { padding: '6px 10px', fontSize: 13 },
    md: { padding: '9px 12px', fontSize: 14 },
  }[size];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--p-text-color)' }}>{label}</label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <i className={`pi ${icon}`} style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--p-text-muted-color)',
            fontSize: 14, pointerEvents: 'none',
          }} />
        )}
        <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: sz.padding, paddingLeft: icon ? 36 : undefined,
            fontSize: sz.fontSize, fontFamily: 'inherit',
            background: 'var(--p-form-field-background)',
            color: 'var(--p-form-field-color)',
            border: `1px solid ${focused ? 'var(--p-primary-500)' : 'var(--p-form-field-border-color)'}`,
            borderRadius: 'var(--p-border-radius-md)',
            outline: focused ? '2px solid rgba(16,185,129,.25)' : 'none',
            outlineOffset: 2, transition: 'all .15s',
          }}
        />
      </div>
      {helpText && <span style={{ fontSize: 12, color: 'var(--p-text-muted-color)' }}>{helpText}</span>}
    </div>
  );
}

function FmSelect({ label, value, onChange, options, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--p-text-color)' }}>{label}</label>
      )}
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={onChange}
          style={{
            width: '100%', padding: '9px 36px 9px 12px', fontSize: 14, fontFamily: 'inherit',
            background: 'var(--p-form-field-background)', color: 'var(--p-form-field-color)',
            border: '1px solid var(--p-form-field-border-color)',
            borderRadius: 'var(--p-border-radius-md)', appearance: 'none', cursor: 'pointer',
          }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <i className="pi pi-chevron-down" style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--p-text-muted-color)', fontSize: 12, pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}

function FmCard({ children, style, padded = true }) {
  return (
    <div style={{
      background: 'var(--p-surface-0)',
      border: '1px solid var(--p-content-border-color)',
      borderRadius: 'var(--p-border-radius-lg)',
      padding: padded ? 24 : 0,
      ...style,
    }}>{children}</div>
  );
}

function FmChip({ children, tone = 'default', icon }) {
  return (
    <span className={`fm-chip ${tone === 'primary' ? 'is-primary' : tone === 'warn' ? 'is-warn' : ''}`}>
      {icon && <i className={`pi ${icon}`} style={{ fontSize: 11 }} />}
      {children}
    </span>
  );
}

function FmDialog({ open, onClose, title, children, footer, maxWidth = 480 }) {
  if (!open) return null;
  return (
    <div className="fm-backdrop" onClick={onClose}>
      <div className="fm-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--p-content-border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h3 className="p-h4" style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--p-text-muted-color)', fontSize: 18, padding: 6,
            borderRadius: 'var(--p-border-radius-sm)',
          }}>
            <i className="pi pi-times" />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
        {footer && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid var(--p-content-border-color)',
            display: 'flex', gap: 8, justifyContent: 'flex-end',
          }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

function FmStars({ value, onChange, size = 22 }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange && onChange(n)}
          style={{
            background: 'transparent', border: 'none',
            cursor: onChange ? 'pointer' : 'default', padding: 2, color: n <= value ? 'var(--p-amber-400)' : 'var(--p-surface-300)',
            fontSize: size, lineHeight: 1, transition: 'transform .15s',
          }}
          onMouseEnter={e => { if (onChange) e.currentTarget.style.transform = 'scale(1.15)'; }}
          onMouseLeave={e => { if (onChange) e.currentTarget.style.transform = 'scale(1)'; }}>
          <i className={n <= value ? 'pi pi-star-fill' : 'pi pi-star'} />
        </button>
      ))}
    </div>
  );
}

// Confetti — particles fall from top, dispersing horizontally
function FmConfetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 60 }, (_, i) => {
    const colors = ['var(--p-emerald-400)','var(--p-emerald-500)','var(--p-amber-400)','var(--p-sky-400)','var(--p-red-400)'];
    const x = Math.random() * 100;
    const xs = (Math.random() - 0.5) * 200;
    const dur = 2 + Math.random() * 1.5;
    const delay = Math.random() * 0.4;
    const w = 6 + Math.random() * 6;
    const h = 8 + Math.random() * 8;
    return (
      <span key={i} style={{
        position: 'absolute',
        left: `${x}%`,
        top: -20,
        width: w, height: h,
        background: colors[i % colors.length],
        borderRadius: i % 2 ? '50%' : 2,
        animation: `fm-confetti-fall ${dur}s linear ${delay}s forwards`,
        '--x': '0px', '--xs': `${xs}px`,
      }} />
    );
  });
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2000, overflow: 'hidden',
    }}>{pieces}</div>
  );
}

Object.assign(window, {
  FmButton, FmInput, FmSelect, FmCard, FmChip, FmDialog, FmStars, FmConfetti,
});
