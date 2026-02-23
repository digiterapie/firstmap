'use client';
import Link from 'next/link';
import FirstMapLogo from '@/components/FirstMapLogo';
import { useAssessment } from '@/components/AssessmentContext';

export default function Landing() {
  const { dispatch } = useAssessment();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      textAlign: 'center',
    }}>
      <div style={{ position: 'fixed', top: '-80px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(76,191,191,0.08)', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-40px', left: '-60px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(246,169,108,0.1)', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 360, width: '100%' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <FirstMapLogo size={88} />
        </div>
        <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          FirstMap
        </h1>
        <p style={{ fontSize: '18px', color: '#777', fontWeight: '500', marginBottom: '48px', lineHeight: 1.4 }}>
          Pomáhá vidět,<br />kam jít dál.
        </p>

        <Link href="/studio" style={{ display: 'block' }}>
          <button className="btn-primary" style={{ fontSize: '20px', padding: '16px 32px' }}>
            Mapuj
          </button>
        </Link>

        <button
          className="btn-ghost"
          style={{ marginTop: '16px', fontSize: '13px', width: '100%' }}
          onClick={() => {
            if (confirm('Opravdu chcete smazat všechna data a začít znovu?')) {
              dispatch({ type: 'RESET_ALL' });
            }
          }}
        >
          ↺ Restart
        </button>
      </div>
    </div>
  );
}
