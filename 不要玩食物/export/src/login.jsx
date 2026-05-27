// login.jsx — Gmail-style sign-in screen (mocked)
const { useState: useStateLogin } = React;

function FmLogin() {
  const [step, setStep] = useStateLogin('email'); // email | name | loading
  const [email, setEmail] = useStateLogin('');
  const [name, setName] = useStateLogin('');

  function onContinue() {
    if (step === 'email') {
      if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) return;
      // pre-fill name from email
      const local = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      setName(local);
      setStep('name');
    } else if (step === 'name') {
      setStep('loading');
      setTimeout(() => {
        const initial = name.trim()[0]?.toUpperCase() || '?';
        window.fmStore.login({ email, name: name.trim(), initial });
      }, 700);
    }
  }

  function onKey(e) { if (e.key === 'Enter') onContinue(); }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--p-surface-0)',
    }}>
      {/* left: brand pane */}
      <div style={{
        background: 'linear-gradient(155deg, var(--p-emerald-50) 0%, var(--p-surface-0) 60%)',
        padding: '64px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid var(--p-content-border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FmMark />
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--p-surface-900)' }}>食物地圖</span>
        </div>

        <div>
          <div className="p-eyebrow">SLOT · LUNCH · DAILY</div>
          <h1 className="p-h1" style={{ marginTop: 12, fontSize: 56, maxWidth: 480 }}>
            今天<br/>吃什麼?<br/>
            <span style={{ color: 'var(--p-primary-500)' }}>交給轉盤決定。</span>
          </h1>
          <p className="p-lead" style={{ marginTop: 24, maxWidth: 460 }}>
            每天一次,自動為你和團隊隨機挑一家餐廳,並可選擇加上一杯飲料。轉到的店會記入歷史,讓你回頭評分。
          </p>
        </div>

        <div style={{ display: 'flex', gap: 32 }}>
          <Stat n="15" label="收錄店家" />
          <Stat n="5" label="工作日" />
          <Stat n="∞" label="可能的組合" />
        </div>
      </div>

      {/* right: sign in form */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '64px 56px',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 999,
            background: 'var(--p-surface-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
          }}>
            <i className="pi pi-google" style={{ fontSize: 20, color: 'var(--p-text-color)' }} />
          </div>

          {step === 'email' && (
            <>
              <h2 className="p-h2" style={{ marginBottom: 6 }}>登入</h2>
              <p style={{ color: 'var(--p-text-muted-color)', fontSize: 15, marginBottom: 28 }}>
                使用你的 Google 帳號繼續
              </p>
              <FmInput
                label="電子郵件地址"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.name@gmail.com"
                icon="pi-envelope"
              />
              <div onKeyDown={onKey} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <FmButton size="lg" onClick={onContinue} disabled={!email} style={{ width: '100%' }}>
                  繼續
                </FmButton>
                <FmButton size="lg" variant="text" severity="secondary" onClick={() => { setEmail('lunch.team@gmail.com'); setTimeout(onContinue, 50); }}>
                  使用測試帳號
                </FmButton>
              </div>
            </>
          )}

          {step === 'name' && (
            <>
              <h2 className="p-h2" style={{ marginBottom: 6 }}>歡迎</h2>
              <p style={{ color: 'var(--p-text-muted-color)', fontSize: 15, marginBottom: 28 }}>
                {email}
              </p>
              <FmInput
                label="你的名字 (會顯示在團隊紀錄)"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="小明"
                icon="pi-user"
              />
              <div onKeyDown={onKey} style={{ marginTop: 24, display: 'flex', gap: 8 }}>
                <FmButton size="lg" variant="outlined" severity="secondary" onClick={() => setStep('email')} style={{ flex: '0 0 auto' }}>
                  返回
                </FmButton>
                <FmButton size="lg" onClick={onContinue} disabled={!name.trim()} style={{ flex: 1 }} icon="pi-arrow-right" iconPos="right">
                  進入食物地圖
                </FmButton>
              </div>
            </>
          )}

          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <i className="pi pi-spin pi-spinner" style={{ fontSize: 32, color: 'var(--p-primary-500)' }} />
              <div style={{ marginTop: 16, color: 'var(--p-text-muted-color)', fontSize: 14 }}>登入中…</div>
            </div>
          )}

          <div style={{
            marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--p-content-border-color)',
            fontSize: 12, color: 'var(--p-text-muted-color)', lineHeight: 1.6,
          }}>
            繼續即表示你同意團隊午餐隨機分配協議。此 demo 不會真的呼叫 Google;email 只用於本地識別。
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div style={{
        fontSize: 28, fontWeight: 800, color: 'var(--p-surface-900)',
        letterSpacing: '-0.02em', lineHeight: 1,
      }}>{n}</div>
      <div style={{ fontSize: 12, color: 'var(--p-text-muted-color)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function FmMark() {
  // simple emerald square mark; PrimeNG doesn't have a brand logo to copy
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: 'linear-gradient(135deg, var(--p-emerald-400), var(--p-emerald-600))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 6px rgba(16,185,129,.3)',
    }}>
      <i className="pi pi-map-marker" style={{ color: '#fff', fontSize: 16 }} />
    </div>
  );
}

Object.assign(window, { FmLogin, FmMark });
