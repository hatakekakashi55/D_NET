import { useState, useEffect } from 'react';
import type { SocialUser } from '../socialStore';
import { Search } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface SearchPageProps {
  onSelectUser: (user: SocialUser) => void;
}

export default function SearchPage({ onSelectUser }: SearchPageProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('display_name', `%${query}%`)
        .limit(20);
      
      setIsSearching(false);
      if (!error && data) {
        setSearchResults(data);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div>
      <div className="page-header">
        <h1>Search</h1>
        <p style={{ color: 'var(--text-3)' }}>Search dreamers across the subconscious network</p>
      </div>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <input
          type="text"
          className="input-field"
          style={{ width: '100%', paddingLeft: '44px' }}
          placeholder="Search username or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search size={18} color="var(--text-3)" style={{ position: 'absolute', left: '16px', top: '15px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {query.trim() === '' ? (
          <div className="empty-state">
            <div className="empty-state__text">Search for dreamers to view their profile</div>
          </div>
        ) : isSearching ? (
          <div className="empty-state">
            <div className="empty-state__text">Searching...</div>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__text">No dreamers found matching "{query}"</div>
          </div>
        ) : (
          searchResults.map((u) => {
            const safeUsername = u.username || (u.email ? u.email.split('@')[0] : 'dreamer');
            return (
              <div
                key={u.id}
                onClick={() => onSelectUser({ ...u, username: safeUsername, avatar_color: '#8B8BF5', followers: u.followers || 0, following: u.following || 0, is_following: false })}
                style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={safeUsername} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--border-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}>
                    {u.display_name ? u.display_name[0].toUpperCase() : safeUsername[0].toUpperCase()}
                  </div>
                )}
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.display_name || safeUsername}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.is_ai ? 'AI Assistant' : `@${safeUsername}`}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                View Profile
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
