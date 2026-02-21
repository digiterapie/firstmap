'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAssessment } from '@/components/AssessmentContext';
import { StatusKey, ChecklistSection } from '@/types';
import checklistData from '@/data/checklist.json';

const checklist = checklistData as { sections: ChecklistSection[] };

const STATUSES: { id: StatusKey; label: string; icon: string }[] = [
  { id: 'CAN_DO', label: 'Zvládne', icon: '✓' },
  { id: 'WITH_HELP', label: 'S pomocí', icon: '↗' },
  { id: 'CANNOT', label: 'Zatím ne', icon: '○' },
  { id: 'NOT_TESTED', label: 'Nezkoušeno', icon: '?' },
  { id: 'NOT_INTERESTED', label: 'Nezájem', icon: '–' },
];

function StatusChip({ status, selected, onSelect }: { status: typeof STATUSES[0], selected: boolean, onSelect: () => void }) {
  return (
    <button
      className={`chip chip-${status.id.toLowerCase()} ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span>{status.icon}</span>
      <span>{status.label}</span>
    </button>
  );
}

function SectionCard({ section }: { section: ChecklistSection }) {
  const { state, dispatch } = useAssessment();
  const [open, setOpen] = useState(true);

  const itemIds = section.items.map(i => i.id);
  const answered = itemIds.filter(id => state.statuses[id]).length;
  const total = itemIds.length;

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      {/* Section header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          padding: 0,
          marginBottom: open ? '16px' : 0,
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: '800', fontSize: '16px' }}>{section.title}</div>
          <div style={{ fontSize: '13px', color: '#888', fontWeight: '600' }}>
            {answered}/{total} odpovězeno
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {answered === total && total > 0 && (
            <span style={{ color: 'var(--green)', fontSize: '20px' }}>✓</span>
          )}
          <span style={{ fontSize: '20px', color: '#aaa', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            ▾
          </span>
        </div>
      </button>

      {open && (
        <>
          {/* Items */}
          {section.items.map(item => (
            <div key={item.id} style={{
              borderBottom: '1px solid var(--bg)',
              paddingBottom: '16px',
              marginBottom: '16px',
            }}>
              <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '10px', lineHeight: 1.4 }}>
                {item.text}
                <span style={{ marginLeft: '6px', fontSize: '11px', color: '#aaa', fontWeight: '500' }}>
                  ≥{item.expected_age}r.
                </span>
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
              }}>
                {STATUSES.map(s => (
                  <StatusChip
                    key={s.id}
                    status={s}
                    selected={state.statuses[item.id] === s.id}
                    onSelect={() => dispatch({ type: 'SET_STATUS', itemId: item.id, status: s.id })}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Section note */}
          <textarea
            className="input-field"
            rows={2}
            placeholder="Poznámka k sekci..."
            value={state.sectionNotes[section.id] || ''}
            onChange={e => dispatch({ type: 'SET_SECTION_NOTE', sectionId: section.id, note: e.target.value })}
            style={{ marginBottom: '10px', resize: 'none' }}
          />

          {/* Reset section */}
          <button
            className="btn-ghost"
            style={{ fontSize: '13px', padding: '6px 10px' }}
            onClick={() => {
              if (confirm('Smazat odpovědi v této sekci?')) {
                dispatch({ type: 'RESET_SECTION', sectionId: section.id, itemIds: itemIds });
              }
            }}
          >
            ↺ Reset sekce
          </button>
        </>
      )}
    </div>
  );
}

export default function MapPage() {
  const { state } = useAssessment();
  const router = useRouter();

  const allItems = checklist.sections.flatMap(s => s.items);
  const totalItems = allItems.length;
  const answeredCount = allItems.filter(item => state.statuses[item.id]).length;
  const progress = totalItems > 0 ? answeredCount / totalItems : 0;

  if (!state.ageBandId) {
    router.replace('/studio');
    return null;
  }

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
        <div className="container" style={{ padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <Link href="/studio" style={{ fontSize: '20px' }}>←</Link>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontWeight: '800', fontSize: '17px' }}>
                Mapování
                {state.childNickname && <span style={{ fontWeight: '500', color: '#888', fontSize: '14px' }}> · {state.childNickname}</span>}
              </h2>
            </div>
            <span style={{ fontSize: '13px', color: '#888', fontWeight: '600' }}>
              {answeredCount}/{totalItems}
            </span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="container" style={{ paddingTop: '8px' }}>
        {checklist.sections.map(section => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>

      {/* Sticky bottom action */}
      <div className="no-print" style={{
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
          <button
            className="btn-primary"
            onClick={() => router.push('/draft')}
          >
            Zobrazit návrh →
          </button>
        </div>
      </div>
    </div>
  );
}
