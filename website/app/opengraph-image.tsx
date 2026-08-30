import { ImageResponse } from 'next/og'

export const alt = 'EPSILON — Don’t trust the line. Test its neighborhood.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: '#08090c',
        color: '#f0efea',
        padding: '64px 72px',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: 520, right: -170, top: -220, background: 'rgba(139, 233, 253, 0.06)' }} />
      <div style={{ display: 'flex', width: '100%', position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '68%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 22, letterSpacing: 7, fontWeight: 700 }}>
            EPSILON
            <span style={{ width: 1, height: 28, background: '#292c34', marginLeft: 8 }} />
            <span style={{ color: '#92949d', fontSize: 15, letterSpacing: 3 }}>EVIDENCE INSTRUMENT</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 70, fontSize: 64, lineHeight: 1.05, letterSpacing: -2, fontWeight: 700 }}>
            <span>Don&apos;t trust the line.</span>
            <span style={{ color: '#92949d' }}>Test its neighborhood.</span>
          </div>
          <div style={{ display: 'flex', marginTop: 'auto', gap: 12, color: '#92949d', fontSize: 16, letterSpacing: 1 }}>
            <span>OBSERVE</span><span>/</span><span>DEFINE</span><span>/</span><span>PERTURB</span><span>/</span><span>CHALLENGE</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', width: '32%', border: '1px solid #292c34', background: '#101217', padding: 26, marginTop: 28, marginBottom: 16 }}>
          <div style={{ color: '#92949d', fontSize: 13, letterSpacing: 3 }}>PERTURBATION FIELD / EPSILON</div>
          <div style={{ display: 'flex', flexDirection: 'column', height: 220, marginTop: 34, position: 'relative', borderBottom: '1px dashed #444750' }}>
            <svg viewBox="0 0 320 210" width="320" height="210"><path d="M0 160 C55 155 75 112 122 128 S205 78 320 58" fill="none" stroke="#f0efea" strokeWidth="3"/><path d="M0 160 C55 158 75 125 122 139 S205 103 320 92" fill="none" stroke="#8be9fd" strokeWidth="2"/><path d="M0 160 C55 165 75 138 122 150 S205 132 320 118" fill="none" stroke="#d6a2ff" strokeWidth="2"/><path d="M0 160 C55 145 75 116 122 118 S205 88 320 73" fill="none" stroke="#b7f171" strokeWidth="2"/></svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22, fontSize: 13 }}><span style={{ color: '#92949d' }}>BASELINE</span><span>+6.20%</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 13 }}><span style={{ color: '#92949d' }}>ATOMIC CHANGES</span><span style={{ color: '#8be9fd' }}>4</span></div>
          <div style={{ marginTop: 'auto', borderTop: '1px solid #292c34', paddingTop: 18, color: '#92949d', fontSize: 12, lineHeight: 1.5 }}>Every colour corresponds to one exact changed assumption.</div>
        </div>
      </div>
    </div>,
    size,
  )
}
