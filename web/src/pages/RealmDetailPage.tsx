import { useEffect, useState } from 'react';
import { useUniverseStore } from '../universeStore';
import { getEmotionColor } from '../helpers';
import type { RealmDetail } from '../types';
import { ArrowLeft, X } from 'lucide-react';

interface RealmDetailPageProps {
  realmName: string;
  onBack: () => void;
}

export default function RealmDetailPage({ realmName, onBack }: RealmDetailPageProps) {
  const { fetchRealmDetail, isLoading } = useUniverseStore();
  const [detail, setDetail] = useState<RealmDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetchRealmDetail(realmName);
      if (res) setDetail(res);
    })();
  }, [realmName]);

  if (isLoading || !detail) {
    return <div className="loader-screen"><div className="spinner" /><div className="loader-text">Entering {realmName}...</div></div>;
  }

  return (
    <div>
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 20 }}>
        <ArrowLeft size={18} /> Back
      </button>

      {/* Hero */}
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 6 }}>{detail.name}</h1>
      <span className="badge" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)', marginBottom: 16, display: 'inline-flex' }}>
        {detail.population} dreamers
      </span>

      {/* Live stats */}
      <div className="flex-row" style={{ marginTop: 12, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{detail.today_count} people joined this realm today</span>
      </div>

      {detail.user_visits > 0 && (
        <div className="stat-pill" style={{ background: 'var(--glow-dim)', border: '1px solid var(--glow)', color: 'var(--glow)', marginBottom: 24, display: 'inline-flex' }}>
          <span style={{ fontSize: 12 }}>&#9733;</span> You visited this realm {detail.user_visits} times
        </div>
      )}

      {/* Chronicle */}
      <div style={{ marginTop: 20, marginBottom: 28 }}>
        <div className="section-label">Today's Collective Dream</div>
      <div className="chronicle-card" style={{ borderLeftColor: 'var(--border-glow)', cursor: 'pointer' }} onClick={() => setModalOpen(true)}>
          <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any }}>
            {detail.chronicle}
          </p>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--primary)', display: 'inline-block', marginTop: 8, cursor: 'pointer' }}>
            Read full chronicle
          </span>
        </div>
      </div>

      {/* Common Symbols */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-label">Common Symbols</div>
        <div className="flex-row flex-wrap">
          {detail.common_symbols.map((s) => <span className="symbol-tag" key={s}>#{s}</span>)}
        </div>
      </div>

      {/* Emotions */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-label">Dominant Emotions</div>
        <div className="card">
          {Object.entries(detail.emotions).map(([emotion, pct]) => {
            const color = getEmotionColor(emotion);
            return (
              <div className="emotion-bar" key={emotion}>
                <div className="emotion-bar__header">
                  <span className="emotion-bar__label">{emotion}</span>
                  <span className="emotion-bar__pct" style={{ color }}>{pct}%</span>
                </div>
                <div className="emotion-bar__track">
                  <div className="emotion-bar__fill" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Chronicle Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-sheet__header">
              <span className="badge" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{detail.name}</span>
              <button onClick={() => setModalOpen(false)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-2)' }}>
                <X size={22} />
              </button>
            </div>
            <div className="modal-sheet__body">{detail.chronicle}</div>
          </div>
        </div>
      )}
    </div>
  );
}
