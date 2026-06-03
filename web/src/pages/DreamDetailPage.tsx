import { useEffect, useState } from 'react';
import { useDreamStore } from '../dreamStore';
import { getEmotionColor } from '../helpers';
import type { DreamAnalysis } from '../types';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface DreamDetailPageProps {
  dreamId: string;
  onNavigate: (page: string, params?: any) => void;
  onBack: () => void;
}

export default function DreamDetailPage({ dreamId, onNavigate, onBack }: DreamDetailPageProps) {
  const { fetchDreamDetail, isLoading } = useDreamStore();
  const [detail, setDetail] = useState<DreamAnalysis | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetchDreamDetail(dreamId);
      if (res) setDetail(res);
    })();
  }, [dreamId]);

  if (isLoading || !detail) {
    return (
      <div className="loader-screen">
        <div className="spinner" />
        <div className="loader-text">Entering the dream memory...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 20 }}>
        <ArrowLeft size={18} /> Back
      </button>

      {/* Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span className="badge" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{detail.realm}</span>
        {detail.pattern_note && <span style={{ fontSize: 12, color: 'var(--glow)', fontStyle: 'italic' }}>{detail.pattern_note}</span>}
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1.2, marginBottom: 6 }}>{detail.archetype}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 28 }}>{detail.theme}</p>

      {/* Emotion Resonance */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-label">Emotion Resonance</div>
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

      {/* Symbols */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-label">Extracted Symbols</div>
        <div className="flex-row flex-wrap">
          {detail.symbols.map((s) => <span className="symbol-tag" key={s}>#{s}</span>)}
        </div>
      </div>

      {/* AI Insight */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-label">AI Subconscious Insight</div>
        <div className="insight-card" style={{ borderLeftColor: 'var(--border-glow)' }}>{detail.insight}</div>
      </div>

      {/* Explore Realm CTA */}
      <button
        className="btn btn-primary btn-block"
        onClick={() => onNavigate('realm-detail', { realmName: detail.realm })}
      >
        Explore {detail.realm} <ChevronRight size={18} />
      </button>
    </div>
  );
}
