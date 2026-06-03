import { useEffect, useState } from 'react';
import { useSocialStore } from '../socialStore';
import { useUniverseStore } from '../universeStore';
import { Heart, MessageCircle, Globe } from 'lucide-react';
import { formatDate } from '../helpers';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { posts, initializeSocial, likePost, addComment } = useSocialStore();
  const { realms, fetchUniverse } = useUniverseStore();
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeStoryRealm, setActiveStoryRealm] = useState<string | null>(null);

  useEffect(() => {
    fetchUniverse();
    initializeSocial();
  }, []);

  const handleLike = (postId: string) => {
    likePost(postId);
  };

  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    addComment(postId, commentText);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const selectedStoryRealmData = realms.find((r) => r.name === activeStoryRealm);

  return (
    <div className="home-feed-container">
      
      {/* Active Realms Stories (Instagram Style) */}
      <div className="stories-container">
        {realms.map((r) => (
          <div
            key={r.name}
            onClick={() => setActiveStoryRealm(r.name)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: '2px solid var(--primary)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg)'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'var(--text-1)'
              }}>
                {r.name[0]}
              </div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '6px', textAlign: 'center', width: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Main Feed Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {posts.map((post) => (
          <article
            key={post.id}
            className="home-post-article"
          >
            {/* Post Header */}
            <div style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  onClick={() => onNavigate('profile', { user: post.user })}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: post.user.avatar_color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {post.user.display_name[0].toUpperCase()}
                </div>
                <div>
                  <div
                    onClick={() => onNavigate('profile', { user: post.user })}
                    style={{ fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                  >
                    {post.user.username}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{post.realm}</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                {formatDate(post.created_at)}
              </span>
            </div>

            {/* Post Content Body */}
            <div style={{ padding: '20px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-3)',
                textTransform: 'uppercase',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                ARCHETYPE: {post.archetype}
              </div>
              <p style={{ fontSize: '15px', color: 'var(--text-1)', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                "{post.text}"
              </p>
            </div>

            {/* Action Bar */}
            <div style={{ padding: '12px 16px', display: 'flex', gap: '16px' }}>
              <button
                onClick={() => handleLike(post.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: post.has_liked ? 'var(--danger)' : 'var(--text-2)' }}
              >
                <Heart size={20} fill={post.has_liked ? 'var(--danger)' : 'none'} />
                <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{post.likes}</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-2)' }}>
                <MessageCircle size={20} />
                <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{post.comments.length}</span>
              </div>
            </div>

            {/* Comments List */}
            {post.comments.length > 0 && (
              <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {post.comments.map((c, idx) => (
                  <div key={idx} style={{ fontSize: '13px', lineHeight: '1.4' }}>
                    <strong style={{ color: 'var(--text-1)', marginRight: '6px' }}>{c.username}</strong>
                    <span style={{ color: 'var(--text-2)' }}>{c.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Form */}
            <form
              onSubmit={(e) => handleAddComment(e, post.id)}
              style={{
                display: 'flex',
                borderTop: '1px solid var(--border)',
                padding: '8px 16px'
              }}
            >
              <input
                type="text"
                className="input-field"
                style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px 0', fontSize: '13px' }}
                placeholder="Add a comment..."
                value={commentInputs[post.id] || ''}
                onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
              />
              <button
                type="submit"
                style={{ padding: '0 8px', color: 'var(--primary)', fontWeight: '600', fontSize: '13px' }}
                disabled={!(commentInputs[post.id] || '').trim()}
              >
                Post
              </button>
            </form>
          </article>
        ))}
      </div>

      {/* Realms Chronicle / Story Modal */}
      {activeStoryRealm && (
        <div className="modal-overlay" onClick={() => setActiveStoryRealm(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', borderRadius: 'var(--radius-lg)' }}>
            <div className="modal-sheet__header">
              <span className="badge" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                {activeStoryRealm}
              </span>
              <button onClick={() => setActiveStoryRealm(null)} style={{ color: 'var(--text-2)' }}>
                Close
              </button>
            </div>
            <div className="modal-sheet__body" style={{ textAlign: 'center', padding: '16px 0' }}>
              <Globe size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
              <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '8px' }}>
                COLLECTIVE ENERGY LEVEL
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-1)', marginBottom: '16px' }}>
                {selectedStoryRealmData?.population || 100} Dreamers Connected
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: '1.6', textAlign: 'justify' }}>
                The collective consciousness of D-NET is drifting through the {activeStoryRealm}. Telepathic resonances have increased, mapping key archetypes inside this portal.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
