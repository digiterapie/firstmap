'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/components/AssessmentContext';
import { AgeBandId, ContextId } from '@/types';
import Link from 'next/link';

const AGE_BANDS: { id: AgeBandId; label: string; desc: string }[] = [
  { id: '3-4', label: '3–4 roky', desc: 'Formulář pro děti 3–4 let' },
  { id: '5-6', label: '5–6 let', desc: 'Formulář pro děti 5–6 let' },
];

const CONTEXTS: { id: ContextId; label: string; icon: string }[] = [
  { id: 'doma', label: 'Doma', icon: '🏠' },
  { id: 'venku', label: 'Venku', icon: '🌿' },
  { id: 'klub', label: 'Klub', icon: '🏫' },
  { id: 'jiné', label: 'Jiné', icon: '📍' },
];

export default function Studio() {
  const { state, dispatch } = useAssessment();
  const router = useRouter();
  const [nickname, setNickname] = useState(state.childNickname);
  const [ageBandId, setAgeBandId] = useState<AgeBandId | ''>(state.ageBandId);
  const [context, setContext] = useState<ContextId | ''>(state.context);
  const [generalNote, setGeneralNote] = useState(state.generalNote);

  const handleSubmit = () => {
    if (!ageBandId) return;
    dispatch({
      type: 'SET_STUDIO',
      payload: {
        childNickname: nickname,
        ageBandId,
        context,
        generalNote,
        dateISO: new Date().toISOString().slice(0, 10),
      },
    });
    router.push('/map');
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <div style={{
        background: 'var(--white)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--muted)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Link href="/" style={{ fontSize: '22px', lineHeight: 1 }}>←</Link>
        <h2 style={{ fontWeight: '800', fontSize: '18px' }}>Základní informace</h2>
      </div>

      <div className="container" style={{ paddingTop: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label className="label">Přezdívka dítěte (nepovinné)</label>
          <input
            className="input-field"
            type="text"
            placeholder="nepoužívej celé jméno"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label className="label">Věková skupina *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {AGE_BANDS.map(band => (
              <button
                key={band.id}
                onClick={() => setAgeBandId(band.id)}
                style={{
                  padding: '18px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${ageBandId === band.id ? 'var(--primary)' : 'var(--muted)'}`,
                  background: ageBandId === band.id ? 'rgba(76,191,191,0.1)' : 'var(--white)',
                  fontWeight: '700',
                  fontSize: '16px',
                  color: ageBandId === band.id ? 'var(--primary)' : 'var(--text)',
                  transition: 'all 0.15s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>{band.label}</div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: ageBandId === band.id ? 'var(--primary)' : '#aaa' }}>{band.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label className="label">Kontext setkání (nepovinné)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {CONTEXTS.map(ctx => (
              <button
                key={ctx.id}
                onClick={() => setContext(context === ctx.id ? '' : ctx.id)}
                style={{
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${context === ctx.id ? 'var(--accent)' : 'var(--muted)'}`,
                  background: context === ctx.id ? 'rgba(246,169,108,0.1)' : 'var(--white)',
                  fontWeight: '700',
                  fontSize: '15px',
                  color: context === ctx.id ? 'var(--accent)' : 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s',
                }}
              >
                {ctx.icon} {ctx.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label className="label">Poznámka (nepovinné)</label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="Kontext nebo poznámky před mapováním..."
            value={generalNote}
            onChange={e => setGeneralNote(e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg)',
        borderTop: '1px solid var(--muted)',
        padding: '16px 20px',
        zIndex: 10,
      }}>
        <div className="container" style={{ padding: 0 }}>
          <button className="btn-primary" onClick={handleSubmit} disabled={!ageBandId}>
            Pokračovat →
          </button>
        </div>
      </div>
    </div>
  );
}
