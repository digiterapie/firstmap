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

  // Init selected activities from results if not yet done
  const workerSet = new Set(results.prioritySections.flatMap(p => p.workerActivities));
  const parentSet = new Set(results.prioritySections.flatMap(p => p.parentActivities));
  const allSuggestedWorker = Array.from(workerSet);
  const allSuggestedParent = Array.from(parentSet);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--white)',
        padding: '16px 20px',
        borderBottom: '1px solid var(--muted)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div className="container" style={{ padding: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/map" style={{ fontSize: '20px' }}>←</Link>
          <h2 style={{ fontWeight: '800', fontSize: '17px' }}>Návrh plánu</h2>
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
          <p style={{ fontWeight: '700', fontSize: '16px', lineHeight: 1.4 }}>
            {results.summaryText}
          </p>
        </div>

        {/* Strengths */}
        {results.strengths.length > 0 && (
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>
              💪 Silné stránky
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.strengths.map(s => (
                <li key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px' }}>
                  <span style={{
                    color: 'var(--green)',
                    fontWeight: '700',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}>✓</span>
                  <span>
                    {s.text}
                    {s.bonus && <span style={{ marginLeft: '6px', fontSize: '12px', background: 'var(--yellow)', borderRadius: '6px', padding: '1px 6px', fontWeight: '700' }}>⭐ Výborně</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reserves */}
        {results.reserves.length > 0 && (
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>
              🌱 Oblast podpory
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.reserves.map(r => (
                <li key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: '700', flexShrink: 0 }}>→</span>
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Priority sections */}
        {results.prioritySections.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '800', fontSize: '17px', marginBottom: '12px' }}>
              🎯 Priority
            </div>
            {results.prioritySections.map((p, i) => (
              <div key={p.section.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: i === 0 ? 'var(--accent)' : i === 1 ? 'var(--secondary)' : 'var(--green)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '13px',
                  flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ fontWeight: '700', fontSize: '15px' }}>{p.section.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Worker activities */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '4px' }}>
            🙋 Aktivity pro pracovníka
          </div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '14px', fontWeight: '600' }}>
            Vyberte, co chcete do plánu zahrnout
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
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

          {/* Custom */}
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
            <button
              className="btn-secondary"
              style={{ padding: '10px 16px', fontSize: '14px', flexShrink: 0 }}
              onClick={() => {
                if (customWorkerInput.trim()) {
                  dispatch({ type: 'ADD_CUSTOM_WORKER', text: customWorkerInput.trim() });
                  setCustomWorkerInput('');
                }
              }}
            >
              +
            </button>
          </div>
          {state.customWorkerActivities.map((act, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>• {act}</span>
              <button
                className="btn-ghost"
                style={{ fontSize: '12px', padding: '4px 8px', color: '#cc5544' }}
                onClick={() => dispatch({ type: 'REMOVE_CUSTOM_WORKER', index: i })}
              >✕</button>
            </div>
          ))}
        </div>

        {/* Parent activities */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '4px' }}>
            👨‍👩‍👧 Aktivity pro rodiče
          </div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '14px', fontWeight: '600' }}>
            Co může rodič dělat doma
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
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
            <button
              className="btn-secondary"
              style={{ padding: '10px 16px', fontSize: '14px', flexShrink: 0 }}
              onClick={() => {
                if (customParentInput.trim()) {
                  dispatch({ type: 'ADD_CUSTOM_PARENT', text: customParentInput.trim() });
                  setCustomParentInput('');
                }
              }}
            >
              +
            </button>
          </div>
          {state.customParentActivities.map((act, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>• {act}</span>
              <button
                className="btn-ghost"
                style={{ fontSize: '12px', padding: '4px 8px', color: '#cc5544' }}
                onClick={() => dispatch({ type: 'REMOVE_CUSTOM_PARENT', index: i })}
              >✕</button>
            </div>
          ))}
        </div>

        {/* Final note */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>
            📝 Závěrečná poznámka
          </div>
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
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg)',
        borderTop: '1px solid var(--muted)',
        padding: '12px 20px',
        zIndex: 10,
      }}>
        <div className="container" style={{ padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!state.confirmed ? (
            <button
              className="btn-primary"
              onClick={() => dispatch({ type: 'SET_CONFIRMED', value: true })}
            >
              ✓ Potvrdit plán
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => router.push('/report')}
              style={{ background: 'var(--accent)' }}
            >
              🖨 Vygenerovat PDF →
            </button>
          )}
          {state.confirmed && (
            <button
              className="btn-ghost"
              style={{ textAlign: 'center', color: '#888' }}
              onClick={() => dispatch({ type: 'SET_CONFIRMED', value: false })}
            >
              Upravit plán
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
