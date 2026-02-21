'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAssessment } from '@/components/AssessmentContext';
import { computeResults } from '@/lib/compute';
import FirstMapLogo from '@/components/FirstMapLogo';

const CONTEXT_LABELS: Record<string, string> = {
  doma: 'Doma',
  venku: 'Venku',
  klub: 'Klub',
  jiné: 'Jiné',
};

const BAND_LABELS: Record<string, string> = {
  '3-4': '3–4 roky',
  '4-5': '4–5 let',
  '5-6': '5–6 let',
};

export default function ReportPage() {
  const { state } = useAssessment();
  const router = useRouter();
  const results = useMemo(() => computeResults(state), [state]);

  if (!state.ageBandId) {
    router.replace('/studio');
    return null;
  }

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 20mm; size: A4; }
        }
      `}</style>

      {/* Nav bar - no print */}
      <div className="no-print" style={{
        background: 'var(--bg)',
        padding: '14px 20px',
        borderBottom: '1px solid var(--muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <Link href="/draft" style={{ fontSize: '20px' }}>←</Link>
        <span style={{ fontWeight: '700', flex: 1 }}>Zpět na plán</span>
        <button
          className="btn-primary"
          style={{ width: 'auto', padding: '10px 20px', fontSize: '15px' }}
          onClick={() => window.print()}
        >
          🖨 Uložit jako PDF
        </button>
      </div>

      {/* Report content */}
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '32px 24px',
        fontFamily: "'Nunito', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '8px',
          paddingBottom: '20px',
          borderBottom: '2px solid #f0f0f0',
        }}>
          <FirstMapLogo size={40} />
          <div>
            <div style={{ fontWeight: '800', fontSize: '24px', letterSpacing: '-0.01em' }}>FirstMap</div>
            <div style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>Pomáhá vidět, kam jít dál.</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: '13px', color: '#888' }}>
            <div style={{ fontWeight: '700' }}>{state.dateISO}</div>
            {state.context && <div>{CONTEXT_LABELS[state.context]}</div>}
          </div>
        </div>

        {/* Child info */}
        <div style={{
          background: '#f8f8f8',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
        }}>
          {state.childNickname && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Přezdívka</div>
              <div style={{ fontWeight: '700', fontSize: '16px' }}>{state.childNickname}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Věk</div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>{BAND_LABELS[state.ageBandId] ?? state.ageBandId}</div>
          </div>
        </div>

        {/* Summary */}
        <div style={{
          background: 'rgba(76,191,191,0.08)',
          borderLeft: '4px solid var(--primary)',
          borderRadius: '0 12px 12px 0',
          padding: '14px 18px',
          marginBottom: '28px',
          fontWeight: '700',
          fontSize: '15px',
          color: '#1A6A6A',
        }}>
          {results.summaryText}
        </div>

        {/* Strengths */}
        {results.strengths.length > 0 && (
          <section style={{ marginBottom: '28px' }}>
            <h3 style={{ fontWeight: '800', fontSize: '17px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💪</span> Silné stránky
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {results.strengths.map(s => (
                <li key={s.id} style={{ display: 'flex', gap: '10px', fontSize: '14px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#2D8A70', fontWeight: '700', flexShrink: 0 }}>✓</span>
                  <span>
                    {s.text}
                    {s.bonus && <span style={{ marginLeft: '8px', fontSize: '11px', background: '#FFE08A', borderRadius: '6px', padding: '1px 6px', fontWeight: '700' }}>⭐</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Reserves */}
        {results.reserves.length > 0 && (
          <section style={{ marginBottom: '28px' }}>
            <h3 style={{ fontWeight: '800', fontSize: '17px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🌱</span> Oblast podpory
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {results.reserves.map(r => (
                <li key={r.id} style={{ display: 'flex', gap: '10px', fontSize: '14px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#C07030', fontWeight: '700', flexShrink: 0 }}>→</span>
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Priorities */}
        {results.prioritySections.length > 0 && (
          <section style={{ marginBottom: '28px' }}>
            <h3 style={{ fontWeight: '800', fontSize: '17px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎯</span> Priority
            </h3>
            <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {results.prioritySections.map((p, i) => (
                <li key={p.section.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '15px', fontWeight: '700' }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: i === 0 ? '#F6A96C' : i === 1 ? '#B8A1E3' : '#7DCFB6',
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '800',
                    flexShrink: 0,
                  }}>{i + 1}</span>
                  {p.section.title}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Worker activities */}
        {(state.selectedWorkerActivities.length > 0 || state.customWorkerActivities.length > 0) && (
          <section style={{ marginBottom: '28px' }}>
            <h3 style={{ fontWeight: '800', fontSize: '17px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🙋</span> Aktivity pro pracovníka
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {state.selectedWorkerActivities.map((a, i) => (
                <li key={i} style={{ fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#4CBFBF', fontWeight: '700' }}>•</span>
                  {a}
                </li>
              ))}
              {state.customWorkerActivities.map((a, i) => (
                <li key={`c${i}`} style={{ fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#4CBFBF', fontWeight: '700' }}>•</span>
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Parent activities */}
        {(state.selectedParentActivities.length > 0 || state.customParentActivities.length > 0) && (
          <section style={{ marginBottom: '28px' }}>
            <h3 style={{ fontWeight: '800', fontSize: '17px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👨‍👩‍👧</span> Aktivity pro rodiče
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {state.selectedParentActivities.map((a, i) => (
                <li key={i} style={{ fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#F6A96C', fontWeight: '700' }}>•</span>
                  {a}
                </li>
              ))}
              {state.customParentActivities.map((a, i) => (
                <li key={`c${i}`} style={{ fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#F6A96C', fontWeight: '700' }}>•</span>
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Final note */}
        {state.finalNote && (
          <section style={{ marginBottom: '28px' }}>
            <h3 style={{ fontWeight: '800', fontSize: '17px', marginBottom: '10px' }}>📝 Závěrečná poznámka</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#444', whiteSpace: 'pre-wrap' }}>
              {state.finalNote}
            </p>
          </section>
        )}

        {state.generalNote && (
          <section style={{ marginBottom: '28px' }}>
            <h3 style={{ fontWeight: '700', fontSize: '14px', marginBottom: '6px', color: '#888' }}>Kontextová poznámka</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#555', whiteSpace: 'pre-wrap' }}>
              {state.generalNote}
            </p>
          </section>
        )}

        {/* Footer */}
        <div style={{ marginTop: '40px', paddingTop: '16px', borderTop: '1px solid #f0f0f0', fontSize: '12px', color: '#bbb', textAlign: 'center' }}>
          Vygenerováno pomocí FirstMap · {state.dateISO}
        </div>
      </div>
    </div>
  );
}
