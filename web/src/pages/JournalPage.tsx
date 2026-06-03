import { useEffect, useState } from 'react';
import { useDreamStore } from '../dreamStore';
import { formatDate } from '../helpers';

const FILTERS = ['All', 'Ocean Realm', 'Falling City', 'Lost Forest', 'Flying Realm', 'Void', 'Being Watched', 'Shadow Maze'];

interface JournalPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function JournalPage({ onNavigate }: JournalPageProps) {
  const { dreams, isLoading, fetchHistory } = useDreamStore();
  const [filter, setFilter] = useState('All');

  useEffect(() => { fetchHistory(); }, []);

  const filtered = filter === 'All' ? dreams : dreams.filter((d) => d.realm === filter);

  if (isLoading && dreams.length === 0) {
    return <div className="loader-screen"><div className="spinner" /><div className="loader-text">Reading dream scrolls...</div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Subconscious Journal</h1>
        <p>History of your recorded dreams</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button className={`filter-chip ${filter === f ? 'active' : ''}`} key={f} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {/* Dream List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">&#9789;</div>
          <div className="empty-state__title">Journal is empty</div>
          <div className="empty-state__text">
            {filter === 'All' ? 'Your dream journal is empty. Record your first dream.' : `No dreams recorded in the ${filter} yet.`}
          </div>
        </div>
      ) : (
        filtered.map((d) => (
          <div className="dream-card" key={d.id} onClick={() => onNavigate('dream-detail', { dreamId: d.id })}>
            <div className="dream-card__strip" style={{ background: d.realm_color }} />
            <div className="dream-card__body">
              <div className="dream-card__top">
                <span className="dream-card__archetype">{d.archetype}</span>
                <span className="dream-card__date">{formatDate(d.created_at)}</span>
              </div>
              <div className="dream-card__preview">{d.preview}</div>
            </div>
            <div className="dream-card__badge">
              <span className="badge" style={{ background: `${d.realm_color}20`, color: d.realm_color }}>{d.realm}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
