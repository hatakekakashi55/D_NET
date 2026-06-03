import { useEffect, useState } from 'react';
import { useUniverseStore } from '../universeStore';
import { formatDate } from '../helpers';
import type { Chronicle } from '../types';
import { X } from 'lucide-react';

export default function ChroniclePage() {
  const { chronicles, isLoading, fetchChronicles } = useUniverseStore();
  const [selected, setSelected] = useState<Chronicle | null>(null);

  useEffect(() => { fetchChronicles(); }, []);

  if (isLoading && chronicles.length === 0) {
    return <div className="loader-screen"><div className="spinner" /><div className="loader-text">Weaving collective dream chronicles...</div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dream Chronicles</h1>
        <p>Daily stories woven from sleeping minds</p>
      </div>

      {chronicles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">&#9783;</div>
          <div className="empty-state__title">Chronicles are empty</div>
          <div className="empty-state__text">No stories have been woven yet. Record more dreams to generate daily chronicles.</div>
        </div>
      ) : (
        chronicles.map((c) => (
          <div
            className="chronicle-card"
            key={c.id}
            style={{ borderLeftColor: 'var(--border-glow)' }}
            onClick={() => setSelected(c)}
          >
            <div className="chronicle-card__header">
              <span className="badge" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{c.realm_name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{formatDate(c.generated_date)}</span>
            </div>
            <div className="chronicle-card__story">{c.story}</div>
          </div>
        ))
      )}

      {/* Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-sheet__header">
              <span className="badge" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{selected.realm_name}</span>
              <button onClick={() => setSelected(null)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-2)' }}>
                <X size={22} />
              </button>
            </div>
            <div className="modal-sheet__body">{selected.story}</div>
          </div>
        </div>
      )}
    </div>
  );
}
