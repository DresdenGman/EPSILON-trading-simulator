import { ImageResponse } from 'next/og'

export const alt = 'EPSILON Quantitative Decision Lab — Build a market idea. Test it. Then try to break it.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: '#071323',
        color: '#eef4fa',
        padding: '64px 72px',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, display: 'flex', opacity: 0.16, backgroundImage: 'linear-gradient(#4c7895 1px, transparent 1px), linear-gradient(90deg, #4c7895 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: 520, right: -170, top: -220, background: 'rgba(62, 207, 185, 0.12)' }} />
      <div style={{ display: 'flex', width: '100%', position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '68%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 22, letterSpacing: 7, fontWeight: 700 }}>
            EPS<span style={{ color: '#3ecfb9', marginLeft: -16 }}>ILON</span>
            <span style={{ width: 1, height: 28, background: '#35536a', marginLeft: 8 }} />
            <span style={{ color: '#8ea4b5', fontSize: 15, letterSpacing: 3 }}>QUANTITATIVE DECISION LAB</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 70, fontSize: 64, lineHeight: 1.05, letterSpacing: -2, fontWeight: 700 }}>
            <span>Build a market idea.</span>
            <span style={{ color: '#3ecfb9' }}>Test it.</span>
            <span>Then try to break it.</span>
          </div>
          <div style={{ display: 'flex', marginTop: 'auto', gap: 12, color: '#a8bac7', fontSize: 16, letterSpacing: 1 }}>
            <span>OBSERVE</span><span style={{ color: '#3ecfb9' }}>&gt;</span><span>TEST</span><span style={{ color: '#3ecfb9' }}>&gt;</span><span>INTERROGATE</span><span style={{ color: '#3ecfb9' }}>&gt;</span><span>RETEST</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', width: '32%', border: '1px solid #35536a', background: 'rgba(8, 28, 46, 0.86)', padding: 26, marginTop: 28, marginBottom: 16 }}>
          <div style={{ color: '#3ecfb9', fontSize: 13, letterSpacing: 3 }}>ACTIVE EXPERIMENT</div>
          <div style={{ marginTop: 25, color: '#7893a6', fontSize: 12, letterSpacing: 2 }}>HYPOTHESIS</div>
          <div style={{ marginTop: 8, fontSize: 20, lineHeight: 1.3 }}>Does the conclusion survive a change in execution friction?</div>
          <div style={{ height: 1, background: '#29465c', marginTop: 28 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22, fontSize: 13 }}><span style={{ color: '#7893a6' }}>EVIDENCE</span><span style={{ color: '#3ecfb9' }}>CURRENT</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 13 }}><span style={{ color: '#7893a6' }}>PROVENANCE</span><span>VISIBLE</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 13 }}><span style={{ color: '#7893a6' }}>CLAIM</span><span>FALSIFIABLE</span></div>
          <div style={{ marginTop: 'auto', borderTop: '1px solid #29465c', paddingTop: 18, color: '#8ea4b5', fontSize: 12, lineHeight: 1.5 }}>A result is useful only when its assumptions and failure conditions remain visible.</div>
        </div>
      </div>
    </div>,
    size,
  )
}
