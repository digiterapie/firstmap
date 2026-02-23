'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAssessment } from '@/components/AssessmentContext';
import { computeResults } from '@/lib/compute';

export default function DraftPage() {
  const { state, dispatch } = useAssessment();
  const router = useRouter();
  const [customWorkerInput, setCustomWorkerInput] = useState('');
  const [customParentInput, setCustomParentInput] = useState('');

  const results = useMemo(() => computeResults(state), [state]);

  if (!state.ageBandId) {
    router.replace('/studio');
    return null;
  }

  const workerSet = new Set(results.prioritySections.flatMap(p => p.workerActivities));
  const parentSet = new Set(results.prioritySections.flatMap(p => p.parentActivities));
  const allSuggestedWorker = Array.from(workerSet);
  const allSuggestedParent = Array.from(parentSet);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '120px' }}>
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--muted)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: '800', fontSize: '17px', color: 'var(--primary)' }}>FirstMap</span>
          <span style={{ fontWeight: '700', fontSize: '15px', color: '#aaa', margin: '0 4px' }}>›</span>
          <span style={{ fontWeight: '800', fontSize: '15px', flex: 1 }}>Návrh plánu</span>
          <button className="btn-ghost" style={{ fontSize: '13px', padding: '6px 12px', color: '#888', border: '1px solid var(--muted)', borderRadius: '999px' }}
            onClick={() => { if (confirm('Opravdu začít znovu?')) { dispatch({ type: 'RESET_ALL' }); router.push('/'); } }}>
            ↺ Restart
          </button>
          <button className="btn-ghost" style={{ fontSize: '13px', padding: '6px 12px', background: 'var(--primary)', color: 'white', borderRadius: '999px', fontWeight: '700' }}
            onClick={() => router.push('/map')}>
            Mapování
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '20px' }}>

        {/* Summary */}
        <div style={{
          background: 'rgba(76,191,191,0.1)',
          border: '1px solid rgba(76,191,191,0.25)',
          borderRadius: 'var(--radius)',
          padding: '18px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Shrnutí
          </div>
          <p style={{ fontWeight: '700', fontSize: '16px', lineHeight: 1.4 }}>{results.summaryText}</p>
        </div>

        {/* Section scores overview */}
        {results.sectionScores.length > 0 && (
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>📊 Přehled oblastí</div>
            {results.sectionScores.map(ss => {
              const pct = ss.answered > 0 ? ss.zvladaPct : null;
              const color = pct === null ? '#ccc'
                : pct >= 80 ? '#7DCFB6'
                : pct >= 40 ? '#F6A96C'
                : '#E07070';
              const label = pct === null ? '–'
                : pct >= 80 ? 'Silná oblast'
                : pct >= 40 ? 'Pracovat'
                : 'Zvýšená podpora';
              return (
                <div key={ss.section.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: color, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, fontSize: '14px', fontWeight: '600' }}>{ss.section.title}</div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color }}>
                    {pct !== null ? `${Math.round(pct)}% zvládá` : 'nevyplněno'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Strengths */}
        {results.strengths.length > 0 && (
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>💪 Silné stránky</div>
            {results.strengths.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--green)', fontWeight: '700', flexShrink: 0 }}>✓</span>
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Reserves */}
        {results.reserves.length > 0 && (
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>🌱 Oblast podpory</div>
            {results.reserves.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', marginBottom: '6px' }}>
                <span style={{ color: r.status === 'NEZVLADA' ? '#C0444A' : 'var(--accent)', fontWeight: '700', flexShrink: 0 }}>
                  {r.status === 'NEZVLADA' ? '✗' : '↗'}
                </span>
                <span>{r.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Priorities */}
        {results.prioritySections.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '800', fontSize: '17px', marginBottom: '12px' }}>🎯 Priority</div>
            {results.prioritySections.map((p, i) => (
              <div key={p.section.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: i === 0 ? 'var(--accent)' : i === 1 ? 'var(--secondary)' : 'var(--green)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '13px', flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ fontWeight: '700', fontSize: '15px' }}>{p.section.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Worker activities */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '4px' }}>🙋 Aktivity pro pracovníka</div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '14px', fontWeight: '600' }}>Vyberte, co chcete zahrnout</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {allSuggestedWorker.map(activity => {
              const active = state.selectedWorkerActivities.includes(activity);
              return (
                <button
                  key={activity}
                  className={`activity-toggle ${active ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'TOGGLE_WORKER_ACTIVITY', activity })}
                >
                  <span className="toggle-icon">{active ? '✓' : '+'}</span>
                  <span style={{ flex: 1, fontWeight: '600', fontSize: '14px' }}>{activity}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="input-field"
              style={{ flex: 1, fontSize: '14px', padding: '10px 12px' }}
              placeholder="Vlastní aktivita..."
              value={customWorkerInput}
              onChange={e => setCustomWorkerInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && customWorkerInput.trim()) {
                  dispatch({ type: 'ADD_CUSTOM_WORKER', text: customWorkerInput.trim() });
                  setCustomWorkerInput('');
                }
              }}
            />
            <button className="btn-secondary" style={{ padding: '10px 16px', fontSize: '20px' }}
              onClick={() => { if (customWorkerInput.trim()) { dispatch({ type: 'ADD_CUSTOM_WORKER', text: customWorkerInput.trim() }); setCustomWorkerInput(''); } }}>+</button>
          </div>
          {state.customWorkerActivities.map((act, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>• {act}</span>
              <button className="btn-ghost" style={{ fontSize: '12px', padding: '4px 8px', color: '#cc5544' }}
                onClick={() => dispatch({ type: 'REMOVE_CUSTOM_WORKER', index: i })}>✕</button>
            </div>
          ))}
        </div>

        {/* Parent activities */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '4px' }}>👨‍👩‍👧 Aktivity pro rodiče</div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '14px', fontWeight: '600' }}>Co může rodič dělat doma</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {allSuggestedParent.map(activity => {
              const active = state.selectedParentActivities.includes(activity);
              return (
                <button
                  key={activity}
                  className={`activity-toggle ${active ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'TOGGLE_PARENT_ACTIVITY', activity })}
                >
                  <span className="toggle-icon">{active ? '✓' : '+'}</span>
                  <span style={{ flex: 1, fontWeight: '600', fontSize: '14px' }}>{activity}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="input-field"
              style={{ flex: 1, fontSize: '14px', padding: '10px 12px' }}
              placeholder="Vlastní aktivita..."
              value={customParentInput}
              onChange={e => setCustomParentInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && customParentInput.trim()) {
                  dispatch({ type: 'ADD_CUSTOM_PARENT', text: customParentInput.trim() });
                  setCustomParentInput('');
                }
              }}
            />
            <button className="btn-secondary" style={{ padding: '10px 16px', fontSize: '20px' }}
              onClick={() => { if (customParentInput.trim()) { dispatch({ type: 'ADD_CUSTOM_PARENT', text: customParentInput.trim() }); setCustomParentInput(''); } }}>+</button>
          </div>
          {state.customParentActivities.map((act, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>• {act}</span>
              <button className="btn-ghost" style={{ fontSize: '12px', padding: '4px 8px', color: '#cc5544' }}
                onClick={() => dispatch({ type: 'REMOVE_CUSTOM_PARENT', index: i })}>✕</button>
            </div>
          ))}
        </div>

        {/* Final note */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>📝 Závěrečná poznámka</div>
          <textarea
            className="input-field"
            rows={3}
            placeholder="Poznámky k plánu..."
            value={state.finalNote}
            onChange={e => dispatch({ type: 'SET_FINAL_NOTE', note: e.target.value })}
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="no-print" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg)', borderTop: '1px solid var(--muted)',
        padding: '12px 20px', zIndex: 10,
      }}>
        <div className="container" style={{ padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!state.confirmed ? (
            <button className="btn-primary" onClick={() => dispatch({ type: 'SET_CONFIRMED', value: true })}>
              ✓ Potvrdit plán
            </button>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  className="btn-primary"
                  style={{ background: 'var(--primary)', fontSize: '14px', padding: '12px' }}
                  onClick={() => router.push('/report?type=worker')}
                >
                  🖨 PDF Pracovník
                </button>
                <button
                  className="btn-primary"
                  style={{ background: 'var(--accent)', fontSize: '14px', padding: '12px' }}
                  onClick={() => router.push('/report?type=parent')}
                >
                  💌 PDF Rodič
                </button>
              </div>
              <button className="btn-ghost" style={{ textAlign: 'center', color: '#888' }}
                onClick={() => dispatch({ type: 'SET_CONFIRMED', value: false })}>
                Upravit plán
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
