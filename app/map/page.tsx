'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/components/AssessmentContext';
import { StatusKey, ChecklistSection } from '@/types';
import { getSectionsForBand } from '@/lib/compute';
import FirstMapLogo from '@/components/FirstMapLogo';

const STATUSES: { id: StatusKey; label: string; icon: string }[] = [
  { id: 'ZVLADA', label: 'Zvládá', icon: '✓' },
  { id: 'DOPOMOC', label: 'Dopomoc', icon: '↗' },
  { id: 'NEZVLADA', label: 'Nezvládá', icon: '○' },
];

const STATUS_CHIP_STYLE: Record<StatusKey, { bg: string; color: string; selBg: string }> = {
  ZVLADA:   { bg: '#E6F9F4', color: '#2D8A70', selBg: '#7DCFB6' },
  DOPOMOC:  { bg: '#FEF3E8', color: '#C07030', selBg: '#F6A96C' },
  NEZVLADA: { bg: '#F3EEFF', color: '#7B5DA3', selBg: '#B8A1E3' },
};

function getSectionColor(zvladaPct: number, answered: number) {
  if (answered === 0) return null;
  if (zvladaPct >= 80) return { bg: '#E6F9F4', color: '#2D8A70', label: 'Silná oblast' };
  if (zvladaPct >= 40) return { bg: '#FEF3E8', color: '#C07030', label: 'Pracovat' };
  return { bg: '#FFF0F0', color: '#C0444A', label: 'Zvýšená podpora' };
}

function SectionCard({ section, isActive, onActivate, statuses, dispatch }: {
  section: ChecklistSection;
  isActive: boolean;
  onActivate: () => void;
  statuses: Record<string, StatusKey>;
  dispatch: any;
}) {
  const itemIds = section.items.map(i => i.id);
  const answered = itemIds.filter(id => statuses[id]).length;
  const zvlada = itemIds.filter(id => statuses[id] === 'ZVLADA').length;
  const zvladaPct = answered > 0 ? (zvlada / answered) * 100 : 0;
  const color = getSectionColor(zvladaPct, answered);
  const allDone = answered === section.items.length;

  return (
    <div id={`section-${section.id}`} className="card" style={{ marginBottom: '16px', scrollMarginTop: '160px' }}>
      <button
        onClick={onActivate}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', padding: 0, marginBottom: isActive ? '16px' : 0 }}
      >
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div style={{ fontWeight: '800', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {section.title}
            {allDone && color && (
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: color.color, display: 'inline-block', flexShrink: 0 }} title={color.label} />
            )}
          </div>
          <div style={{ fontSize: '13px', color: '#888', fontWeight: '600', marginTop: '2px' }}>
            {answered}/{section.items.length} odpovězeno
            {allDone && color && <span style={{ marginLeft: '8px', color: color.color, fontWeight: '700' }}>· {color.label}</span>}
          </div>
        </div>
        <span style={{ fontSize: '20px', color: '#aaa', transform: isActive ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, display: 'inline-block' }}>▾</span>
      </button>

      {isActive && (
        <>
          {section.items.map((item, idx) => (
            <div key={item.id} style={{ borderBottom: idx < section.items.length - 1 ? '1px solid var(--bg)' : 'none', paddingBottom: '14px', marginBottom: '14px' }}>
              <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '10px', lineHeight: 1.4 }}>{item.text}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {STATUSES.map(s => {
                  const selected = statuses[item.id] === s.id;
                  const st = STATUS_CHIP_STYLE[s.id];
                  return (
                    <button key={s.id} onClick={() => dispatch({ type: 'SET_STATUS', itemId: item.id, status: s.id })}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', borderRadius: '999px', padding: '8px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: `2px solid ${selected ? st.selBg : 'transparent'}`, background: selected ? st.selBg : st.bg, color: selected ? 'white' : st.color, transform: selected ? 'scale(1.04)' : 'scale(1)', transition: 'all 0.12s' }}>
                      {s.icon} {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <textarea className="input-field" rows={2} placeholder="Poznámka k sekci..." style={{ marginTop: '4px', resize: 'none', fontSize: '14px' }}
            onChange={e => dispatch({ type: 'SET_SECTION_NOTE', sectionId: section.id, note: e.target.value })}
            defaultValue=""
          />
          <button className="btn-ghost" style={{ fontSize: '13px', padding: '6px 10px', marginTop: '8px' }}
            onClick={() => { if (confirm('Smazat odpovědi v této sekci?')) dispatch({ type: 'RESET_SECTION', sectionId: section.id, itemIds }); }}>
            ↺ Reset sekce
          </button>
        </>
      )}
    </div>
  );
}

export default function MapPage() {
  const { state, dispatch } = useAssessment();
  const router = useRouter();
  const sections = getSectionsForBand(state.ageBandId);
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? '');
  const navRef = useRef<HTMLDivElement>(null);

  const allItems = sections.flatMap(s => s.items);
  const totalItems = allItems.length;
  const answeredCount = allItems.filter(item => state.statuses[item.id]).length;
  const progress = totalItems > 0 ? answeredCount / totalItems : 0;

  if (!state.ageBandId) {
    router.replace('/studio');
    return null;
  }

  const scrollNav = (dir: 'left' | 'right') => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: dir === 'right' ? 160 : -160, behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setTimeout(() => {
      const el = document.getElementById(`section-${sectionId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    const btn = document.getElementById(`nav-${sectionId}`);
    if (btn && navRef.current) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Top bar: logo + Restart + Mapování */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--muted)', position: 'sticky', top: 0, zIndex: 20 }}>
        {/* Brand bar */}
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FirstMapLogo size={28} />
          <span style={{ fontWeight: '800', fontSize: '17px', flex: 1, color: 'var(--primary)' }}>FirstMap</span>
          <button className="btn-ghost" style={{ fontSize: '13px', padding: '6px 12px', color: '#888', border: '1px solid var(--muted)', borderRadius: '999px' }}
            onClick={() => { if (confirm('Opravdu začít znovu? Všechna data budou smazána.')) { dispatch({ type: 'RESET_ALL' }); router.replace('/'); } }}>
            ↺ Restart
          </button>
          <button className="btn-ghost" style={{ fontSize: '13px', padding: '6px 12px', background: 'var(--primary)', color: 'white', borderRadius: '999px', fontWeight: '700' }}
            onClick={() => router.push('/studio')}>
            Mapování
          </button>
        </div>

        {/* Progress */}
        <div style={{ padding: '0 16px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '12px', color: '#888', fontWeight: '600' }}>
              {state.childNickname && <span>{state.childNickname} · </span>}
              {state.ageBandId} let
            </span>
            <span style={{ fontSize: '12px', color: '#888', fontWeight: '700' }}>{answeredCount}/{totalItems}</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        {/* Category nav strip with arrows */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px 10px', gap: '4px' }}>
          <button onClick={() => scrollNav('left')}
            style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--muted)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#888', cursor: 'pointer' }}>
            ‹
          </button>
          <div ref={navRef} style={{ display: 'flex', overflowX: 'auto', flex: 1, gap: '6px', scrollbarWidth: 'none' }}>
            {sections.map(section => {
              const itemIds = section.items.map(i => i.id);
              const answered = itemIds.filter(id => state.statuses[id]).length;
              const zvlada = itemIds.filter(id => state.statuses[id] === 'ZVLADA').length;
              const zvladaPct = answered > 0 ? (zvlada / answered) * 100 : 0;
              const allDone = answered === section.items.length;
              const color = getSectionColor(zvladaPct, answered);
              const isActive = activeSection === section.id;
              return (
                <button id={`nav-${section.id}`} key={section.id} onClick={() => scrollToSection(section.id)}
                  style={{ flexShrink: 0, padding: '5px 11px', borderRadius: '999px', border: `2px solid ${isActive ? 'var(--primary)' : allDone && color ? color.color : 'var(--muted)'}`, background: isActive ? 'var(--primary)' : allDone && color ? color.bg : 'var(--white)', color: isActive ? 'white' : allDone && color ? color.color : '#666', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s', cursor: 'pointer' }}>
                  {allDone && color && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isActive ? 'white' : color.color, flexShrink: 0 }} />}
                  {section.title}
                </button>
              );
            })}
          </div>
          <button onClick={() => scrollNav('right')}
            style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--muted)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#888', cursor: 'pointer' }}>
            ›
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="container" style={{ paddingTop: '16px' }}>
        {sections.map(section => (
          <SectionCard key={section.id} section={section}
            isActive={activeSection === section.id}
            onActivate={() => setActiveSection(activeSection === section.id ? '' : section.id)}
            statuses={state.statuses} dispatch={dispatch}
          />
        ))}
      </div>

      {/* Sticky bottom */}
      <div className="no-print" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg)', borderTop: '1px solid var(--muted)', padding: '14px 20px', zIndex: 10 }}>
        <div className="container" style={{ padding: 0 }}>
          <button className="btn-primary" onClick={() => router.push('/draft')}>Zobrazit návrh →</button>
        </div>
      </div>
    </div>
  );
}
