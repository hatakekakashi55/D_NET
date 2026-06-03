import { useEffect } from 'react';
import { useUniverseStore } from '../universeStore';

interface UniversePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function UniversePage({ onNavigate }: UniversePageProps) {
  const { realms, totalDreamers, dreamsToday, mostCommonSymbol, isLoading, error, fetchUniverse } = useUniverseStore();

  useEffect(() => { fetchUniverse(); }, []);

  if (isLoading && realms.length === 0) {
    return <div className="loader-screen"><div className="spinner" /><div className="loader-text">Loading realms...</div></div>;
  }

  if (error && realms.length === 0) {
    return <div className="empty-state"><div className="empty-state__title">Unable to load universe</div><div className="empty-state__text">{error}</div></div>;
  }

  return (
    <div>
      <div className="page-header"><h1>Dream Universe</h1></div>

      {/* Globe */}
      <div className="globe-container">
        <div className="globe-ring globe-ring--2" />
        <div className="globe-ring globe-ring--1" />
        <div className="globe-core" />
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stats-bar__col">
          <div className="stats-bar__val">{totalDreamers.toLocaleString()}</div>
          <div className="stats-bar__lbl">Dreamers</div>
        </div>
        <div className="stats-bar__divider" />
        <div className="stats-bar__col">
          <div className="stats-bar__val">{dreamsToday.toLocaleString()}</div>
          <div className="stats-bar__lbl">Active Today</div>
        </div>
        {mostCommonSymbol && (<>
          <div className="stats-bar__divider" />
          <div className="stats-bar__col">
            <div className="stats-bar__val">#{mostCommonSymbol}</div>
            <div className="stats-bar__lbl">Top Symbol</div>
          </div>
        </>)}
      </div>

      {/* Realm Grid */}
      <div className="section-title">Active Realms</div>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {realms.map((r) => (
          <div className="realm-card" key={r.name} onClick={() => onNavigate('realm-detail', { realmName: r.name })}>
            <div className="realm-card__body">
              <div className="realm-card__name">{r.name}</div>
              <div className="realm-card__pop">{r.population} dreamers</div>
            </div>
            <div className="realm-card__line" style={{ background: 'var(--border-glow)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
