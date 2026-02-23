'use client';
import { useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAssessment } from '@/components/AssessmentContext';
import { computeResults } from '@/lib/compute';
import FirstMapLogo from '@/components/FirstMapLogo';

const CONTEXT_LABELS: Record<string, string> = {
  doma: 'Doma', venku: 'Venku', klub: 'Klub', jiné: 'Jiné',
};
const BAND_LABELS: Record<string, string> = {
  '3-4': '3–4 roky', '5-6': '5–6 let',
};

function ReportContent() {
  const { state } = useAssessment();
  const router = useRouter();
  const params = useSearchParams();
  const reportType = params.get('type') === 'parent' ? 'parent' : 'worker';
  const results = useMemo(() => computeResults(state), [state]);

  if (!state.ageBandId) {
    router.replace('/studio');
    return null;
  }

  const isParent = reportType === 'parent';

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 18mm; size: A4; }
        }
      `}</style>

      {/* Nav bar */}
      <div className="no-print" style={{ background: 'var(--white)', borderBottom: '1px solid var(--muted)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--primary)' }}>FirstMap</span>
        <span style={{ color: '#aaa', margin: '0 2px' }}>›</span>
        <span style={{ fontWeight: '700', fontSize: '14px', flex: 1 }}>
          {isParent ? '💌 Zpráva pro rodiče' : '📋 Zpráva pro pracovníka'}
        </span>
        <button className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px', color: '#888', border: '1px solid var(--muted)', borderRadius: '999px' }}
          onClick={() => router.push('/')}>
          ↺ Restart
        </button>
        <button className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--primary)', color: 'white', borderRadius: '999px', fontWeight: '700' }}
          onClick={() => router.push('/map')}>
          Mapování
        </button>
        <button className="btn-primary" style={{ width: 'auto', padding: '9px 16px', fontSize: '13px' }} onClick={() => window.print()}>
          🖨 PDF
        </button>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px', fontFamily: "'Nunito', sans-serif" }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          marginBottom: '24px', paddingBottom: '18px',
          borderBottom: `3px solid ${isParent ? '#F6A96C' : '#4CBFBF'}`,
        }}>
          <FirstMapLogo size={40} />
          <div>
            <div style={{ fontWeight: '800', fontSize: '22px' }}>FirstMap</div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {isParent ? 'Zpráva pro rodiče' : 'Diagnostická zpráva – pracovník'}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: '13px', color: '#888' }}>
            <div style={{ fontWeight: '700' }}>{state.dateISO}</div>
            {state.context && <div>{CONTEXT_LABELS[state.context]}</div>}
          </div>
        </div>

        {/* Child info */}
        <div style={{
          background: '#f8f8f8', borderRadius: '12px', padding: '14px 20px',
          marginBottom: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap',
        }}>
          {state.childNickname && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>Přezdívka</div>
              <div style={{ fontWeight: '700', fontSize: '16px' }}>{state.childNickname}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>Věk</div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>{BAND_LABELS[state.ageBandId] ?? state.ageBandId}</div>
          </div>
        </div>

        {isParent ? (
          // ─── PARENT REPORT ───────────────────────────────────────────
          <>
            <div style={{
              background: 'rgba(246,169,108,0.1)', borderLeft: '4px solid #F6A96C',
              borderRadius: '0 12px 12px 0', padding: '14px 18px', marginBottom: '24px',
              fontWeight: '600', fontSize: '15px', color: '#7A4010', lineHeight: 1.5,
            }}>
              Milý rodiči, připravili jsme pro Vás přehled toho, jak si Vaše dítě vedlo, a tipy na aktivity, 
              které můžete společně dělat doma. Každý krok vpřed je důvod k radosti! 🌟
            </div>

            {results.strengths.length > 0 && (
              <section style={{ marginBottom: '28px' }}>
                <h3 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '12px', color: '#2D8A70' }}>
                  🌟 V čem je Vaše dítě šikovné
                </h3>
                <div style={{ background: '#E6F9F4', borderRadius: '12px', padding: '16px 20px' }}>
                  {results.strengths.slice(0, 8).map(s => (
                    <div key={s.id} style={{ display: 'flex', gap: '10px', fontSize: '14px', marginBottom: '7px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#2D8A70', fontWeight: '800', flexShrink: 0 }}>✓</span>
                      <span style={{ fontWeight: '600' }}>{s.text}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {results.reserves.length > 0 && (
              <section style={{ marginBottom: '28px' }}>
                <h3 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '8px', color: '#C07030' }}>
                  🌱 Na čem budeme společně pracovat
                </h3>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px', fontStyle: 'italic' }}>
                  Tyto oblasti jsou pro dítě v tuto chvíli výzva – s Vaší podporou se bude rozvíjet.
                </p>
                {results.prioritySections.slice(0, 3).map((p, i) => (
                  <div key={p.section.id} style={{
                    background: i === 0 ? 'rgba(246,169,108,0.1)' : i === 1 ? 'rgba(184,161,227,0.1)' : 'rgba(125,207,182,0.1)',
                    borderRadius: '10px', padding: '12px 16px', marginBottom: '10px',
                  }}>
                    <div style={{ fontWeight: '800', fontSize: '15px', marginBottom: '4px' }}>{p.section.title}</div>
                  </div>
                ))}
              </section>
            )}

            {(state.selectedParentActivities.length > 0 || state.customParentActivities.length > 0) && (
              <section style={{ marginBottom: '28px' }}>
                <h3 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '12px', color: '#4CBFBF' }}>
                  🏠 Co můžete dělat doma
                </h3>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px', fontStyle: 'italic' }}>
                  Jednoduché aktivity, které nevyžadují žádné speciální pomůcky:
                </p>
                <div style={{ background: 'rgba(76,191,191,0.06)', borderRadius: '12px', padding: '16px 20px' }}>
                  {[...state.selectedParentActivities, ...state.customParentActivities].map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px', marginBottom: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#4CBFBF', fontWeight: '800', flexShrink: 0 }}>→</span>
                      <span style={{ fontWeight: '600' }}>{a}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {state.finalNote && (
              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: '800', fontSize: '17px', marginBottom: '10px' }}>📝 Poznámka</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#444', whiteSpace: 'pre-wrap', background: '#fafafa', borderRadius: '10px', padding: '14px' }}>{state.finalNote}</p>
              </section>
            )}

            <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '2px solid #f0f0f0', fontSize: '13px', color: '#bbb', textAlign: 'center' }}>
              Zpráva vygenerována pomocí FirstMap · {state.dateISO}
            </div>
          </>
        ) : (
          // ─── WORKER REPORT ───────────────────────────────────────────
          <>
            <div style={{
              background: 'rgba(76,191,191,0.08)', borderLeft: '4px solid var(--primary)',
              borderRadius: '0 12px 12px 0', padding: '14px 18px', marginBottom: '24px',
              fontWeight: '700', fontSize: '15px', color: '#1A6A6A',
            }}>
              {results.summaryText}
            </div>

            {/* Section scores */}
            <section style={{ marginBottom: '28px' }}>
              <h3 style={{ fontWeight: '800', fontSize: '17px', marginBottom: '12px' }}>📊 Stav oblastí</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '700' }}>Oblast</th>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: '700' }}>Zvládá</th>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: '700' }}>Dopomoc</th>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: '700' }}>Nezvládá</th>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: '700' }}>Celkem</th>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: '700' }}>Hodnocení</th>
                  </tr>
                </thead>
                <tbody>
                  {results.sectionScores.map((ss, i) => {
                    const zvladaCount = ss.section.items.filter(it => state.statuses[it.id] === 'ZVLADA').length;
                    const dopomocCount = ss.section.items.filter(it => state.statuses[it.id] === 'DOPOMOC').length;
                    const nezvladaCount = ss.section.items.filter(it => state.statuses[it.id] === 'NEZVLADA').length;
                    const color = ss.answered === 0 ? '#ccc'
                      : ss.zvladaPct >= 80 ? '#2D8A70'
                      : ss.zvladaPct >= 40 ? '#C07030'
                      : '#C0444A';
                    const label = ss.answered === 0 ? 'Nevyplněno'
                      : ss.zvladaPct >= 80 ? 'Silná oblast'
                      : ss.zvladaPct >= 40 ? 'Potřeba podpory'
                      : 'Zvýšená podpora';
                    return (
                      <tr key={ss.section.id} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '8px 12px', fontWeight: '600' }}>{ss.section.title}</td>
                        <td style={{ textAlign: 'center', padding: '8px', color: '#2D8A70', fontWeight: '700' }}>{zvladaCount}</td>
                        <td style={{ textAlign: 'center', padding: '8px', color: '#C07030', fontWeight: '700' }}>{dopomocCount}</td>
                        <td style={{ textAlign: 'center', padding: '8px', color: '#C0444A', fontWeight: '700' }}>{nezvladaCount}</td>
                        <td style={{ textAlign: 'center', padding: '8px', color: '#666' }}>{ss.answered}/{ss.total}</td>
                        <td style={{ textAlign: 'center', padding: '8px' }}>
                          <span style={{ color, fontWeight: '700', fontSize: '12px' }}>{label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            {results.reserves.length > 0 && (
              <section style={{ marginBottom: '28px' }}>
                <h3 style={{ fontWeight: '800', fontSize: '17px', marginBottom: '12px' }}>🌱 Oblast podpory – detail</h3>
                {results.reserves.map(r => (
                  <div key={r.id} style={{ display: 'flex', gap: '10px', fontSize: '13px', marginBottom: '6px', alignItems: 'flex-start' }}>
                    <span style={{ color: r.status === 'NEZVLADA' ? '#C0444A' : '#C07030', fontWeight: '700', flexShrink: 0, fontSize: '11px' }}>
                      [{r.status === 'NEZVLADA' ? 'NEZVLÁDÁ' : 'DOPOMOC'}]
                    </span>
                    <span>{r.text}</span>
                    <span style={{ color: '#aaa', fontSize: '11px', flexShrink: 0 }}>· {r.sectionTitle}</span>
                  </div>
                ))}
              </section>
            )}

            {results.prioritySections.length > 0 && (
              <section style={{ marginBottom: '28px' }}>
                <h3 style={{ fontWeight: '800', fontSize: '17px', marginBottom: '12px' }}>🎯 Doporučené priority</h3>
                {results.prioritySections.map((p, i) => (
                  <div key={p.section.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: i === 0 ? '#F6A96C' : i === 1 ? '#B8A1E3' : '#7DCFB6',
                      color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: '800', flexShrink: 0,
                    }}>{i + 1}</span>
                    <span style={{ fontWeight: '700', fontSize: '15px' }}>{p.section.title}</span>
                  </div>
                ))}
              </section>
            )}

            {(state.selectedWorkerActivities.length > 0 || state.customWorkerActivities.length > 0) && (
              <section style={{ marginBottom: '28px' }}>
                <h3 style={{ fontWeight: '800', fontSize: '17px', marginBottom: '12px' }}>🙋 Plán aktivit – pracovník</h3>
                {[...state.selectedWorkerActivities, ...state.customWorkerActivities].map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '14px', marginBottom: '5px' }}>
                    <span style={{ color: '#4CBFBF', fontWeight: '700' }}>•</span>{a}
                  </div>
                ))}
              </section>
            )}

            {state.finalNote && (
              <section style={{ marginBottom: '28px' }}>
                <h3 style={{ fontWeight: '800', fontSize: '17px', marginBottom: '8px' }}>📝 Závěrečná poznámka</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#444', whiteSpace: 'pre-wrap' }}>{state.finalNote}</p>
              </section>
            )}

            {state.generalNote && (
              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: '700', fontSize: '14px', marginBottom: '6px', color: '#888' }}>Kontextová poznámka</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#555', whiteSpace: 'pre-wrap' }}>{state.generalNote}</p>
              </section>
            )}

            <div style={{ marginTop: '40px', paddingTop: '14px', borderTop: '1px solid #f0f0f0', fontSize: '12px', color: '#bbb', textAlign: 'center' }}>
              FirstMap – Diagnostická zpráva · {state.dateISO}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense>
      <ReportContent />
    </Suspense>
  );
}
