import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../authStore';
import { useDreamStore } from '../dreamStore';
import { useSocialStore } from '../socialStore';
import type { SocialUser } from '../socialStore';
import api from '../api';
import { supabase } from '../supabaseClient';
import { ArrowLeft, MessageSquare, UserPlus, UserMinus, Grid3X3, Camera, Link, MapPin, Moon, Star, Zap } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: string, params?: any) => void;
  onBack: () => void;
  viewedUser?: SocialUser | null;
}

export default function ProfilePage({ onNavigate, onBack, viewedUser }: ProfilePageProps) {
  const { user, updateProfile, signOut } = useAuthStore();
  const { dreams, fetchHistory } = useDreamStore();
  const { users, toggleFollow, createThread, posts } = useSocialStore();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_dreams: 0, longest_streak: 0, realms_visited: 0, days_active: 0 });
  const [isEditing, setIsEditing] = useState(false);
  
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPronouns, setEditPronouns] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editGender, setEditGender] = useState('Prefer not to say');
  const [editLocation, setEditLocation] = useState('');
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'posts' | 'insights'>('posts');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSelf = !viewedUser || viewedUser.id === 'self';
  const activeUser = viewedUser ? users.find((u) => u.id === viewedUser.id) : null;

  // Instant load from cached auth state — no spinner for self
  useEffect(() => {
    if (isSelf) {
      setLoading(false);
      fetchHistory();
      api.get('/api/profile/patterns')
        .then((res) => {
          if (res.data?.stats) setStats(res.data.stats);
        })
        .catch(() => {
          setStats({
            total_dreams: dreams.length,
            longest_streak: dreams.length,
            realms_visited: 1,
            days_active: 1,
          });
        });
    } else {
      setLoading(false);
    }
  }, [isSelf]);

  // Update stats when dreams change
  useEffect(() => {
    if (isSelf && dreams.length > 0) {
      setStats(s => ({ ...s, total_dreams: dreams.length }));
    }
  }, [dreams.length]);

  const userPosts = isSelf
    ? dreams.map((d) => ({ id: d.id, archetype: d.archetype, text: d.preview, realm: d.realm }))
    : posts.filter((p) => p.user.id === viewedUser?.id);

  const handleMessage = () => {
    if (!activeUser) return;
    createThread(activeUser);
    onNavigate('messages');
  };

  const openEdit = () => {
    setEditName(user?.display_name || '');
    setEditUsername(user?.username || user?.email.split('@')[0] || '');
    setEditPronouns(user?.pronouns || '');
    setEditBio(user?.bio || '');
    setEditWebsite(user?.website || '');
    setEditGender(user?.gender || 'Prefer not to say');
    setEditLocation(user?.location || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      display_name: editName,
      username: editUsername,
      pronouns: editPronouns,
      bio: editBio,
      website: editWebsite,
      gender: editGender,
      location: editLocation
    });
    setSaving(false);
    setIsEditing(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0 || !user) {
        return;
      }
      setUploadingImage(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      await updateProfile({ avatar_url: data.publicUrl });
    } catch (error) {
      console.error("Error uploading image: ", error);
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const displayName = isSelf ? user?.display_name : (activeUser?.display_name || viewedUser?.display_name);
  const avatarUrl = isSelf ? (user as any)?.avatar_url : (activeUser as any)?.avatar_url;
  const bioText = isSelf ? (user?.bio || '') : (activeUser?.bio || '');
  const username = isSelf ? user?.display_name : (activeUser?.username || viewedUser?.display_name);
  const defaultInitial = (displayName?.[0] || 'D').toUpperCase();

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '24px' }}>
      {/* Top Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isSelf && (
            <button className="btn btn-ghost" onClick={onBack} style={{ padding: '8px' }}>
              <ArrowLeft size={20} />
            </button>
          )}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: 'var(--text-1)' }}>
            @{username?.toLowerCase().replace(/\s+/g, '')}
          </span>
        </div>
        <button id="trigger-edit-profile" onClick={openEdit} style={{ display: 'none' }} />
      </div>

      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
        {/* Avatar Area */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '86px',
            height: '86px',
            borderRadius: '50%',
            background: 'var(--surface)',
            border: '2px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            cursor: isSelf ? 'pointer' : 'default',
            overflow: 'hidden'
          }}
            onClick={isSelf ? triggerFileInput : undefined}
          >
            {uploadingImage ? (
              <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }} />
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'var(--text-2)' }}>{defaultInitial}</span>
            )}
          </div>
          {isSelf && (
            <button
              onClick={triggerFileInput}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--primary)',
                border: '2px solid var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Change Profile Picture"
            >
              <Camera size={14} color="#fff" />
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
        </div>

        {/* Stats Row */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-around', marginBottom: '16px' }}>
            {[
              { val: userPosts.length, label: 'Dreams' },
              { val: isSelf ? 12 : (activeUser?.followers ?? 0), label: 'Followers' },
              { val: isSelf ? 8 : (activeUser?.following ?? 0), label: 'Following' },
            ].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: 'var(--text-1)' }}>{val}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          {isSelf ? (
            <button
              className="btn btn-ghost desktop-only"
              onClick={openEdit}
              style={{ width: '100%', fontSize: '13px', fontWeight: 600, padding: '8px' }}
            >
              Edit Profile
            </button>
          ) : activeUser ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={activeUser.is_following ? 'btn btn-ghost' : 'btn btn-primary'}
                onClick={() => toggleFollow(activeUser.id)}
                style={{ flex: 1, fontSize: '13px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {activeUser.is_following ? <><UserMinus size={14} />Unfollow</> : <><UserPlus size={14} />Follow</>}
              </button>
              <button
                className="btn btn-ghost"
                onClick={handleMessage}
                style={{ flex: 1, fontSize: '13px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <MessageSquare size={14} />Message
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Bio & Info */}
      <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-1)', marginBottom: '4px' }}>
          {displayName}
        </div>
        {bioText && (
          <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.5', marginBottom: '6px' }}>
            {bioText}
          </div>
        )}
        {isSelf && (user as any)?.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-3)', marginBottom: '4px' }}>
            <MapPin size={12} /> {(user as any).location}
          </div>
        )}
        {isSelf && (user as any)?.website && (
          <a href={(user as any).website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--primary)', marginBottom: '4px', textDecoration: 'none' }}>
            <Link size={12} /> {(user as any).website.replace(/^https?:\/\//, '')}
          </a>
        )}

        {/* Dream Stats Highlights */}
        {isSelf && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            {[
              { icon: Moon, label: `${stats.total_dreams} Dreams`, color: 'var(--primary)' },
              { icon: Zap, label: `${stats.longest_streak} Day Streak`, color: '#C4A962' },
              { icon: Star, label: `${stats.realms_visited} Realms`, color: '#4CC9F0' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-pill)', padding: '4px 10px',
                fontSize: '11px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)'
              }}>
                <Icon size={11} color={color} />
                {label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
        {([['posts', <Grid3X3 size={16} />, 'Posts'], ['insights', <Star size={16} />, 'Insights']] as const).map(([tab, icon, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'posts' | 'insights')}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '12px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
              color: activeTab === tab ? 'var(--text-1)' : 'var(--text-3)',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {activeTab === 'posts' && (
        userPosts.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌙</div>
            <div className="empty-state__title">No dreams yet</div>
            {isSelf && (
              <>
                <div className="empty-state__text">Record your first dream to begin your journey.</div>
                <button className="btn btn-primary" onClick={() => onNavigate('record')} style={{ marginTop: '16px' }}>
                  Record Dream
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="profile-posts-grid">
            {userPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {post.realm || 'Dream'}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', margin: 0 }}>
                  {post.text}
                </p>
                <div style={{ fontWeight: 600, fontSize: '11px', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                  {post.archetype}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Total Dreams Recorded', val: stats.total_dreams, icon: '🌙', color: 'var(--primary)' },
            { label: 'Longest Dream Streak', val: `${stats.longest_streak} days`, icon: '🔥', color: '#C4A962' },
            { label: 'Dream Realms Visited', val: stats.realms_visited, icon: '🌌', color: '#4CC9F0' },
            { label: 'Days Active', val: stats.days_active, icon: '📅', color: '#46A758' },
          ].map(({ label, val, icon, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '16px',
            }}>
              <div style={{ fontSize: '28px' }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{
            width: '100%', maxWidth: '440px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
            padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', margin: 0 }}>Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</label>
              <input type="text" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" style={{ width: '100%' }} />
            </div>

            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Username</label>
              <input type="text" className="input-field" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="username" style={{ width: '100%' }} />
            </div>

            {/* Pronouns */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Pronouns</label>
              <input type="text" className="input-field" value={editPronouns} onChange={(e) => setEditPronouns(e.target.value)} placeholder="they/them" style={{ width: '100%' }} />
            </div>

            {/* Bio */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Bio</label>
              <textarea className="input-field" value={editBio} onChange={(e) => setEditBio(e.target.value)}
                placeholder="Subconscious explorer. Dream journaler." rows={3}
                style={{ width: '100%', resize: 'none', height: '72px', minHeight: 'unset' }} />
            </div>

            {/* Links / Website */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Links</label>
              <input type="url" className="input-field" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} placeholder="https://yoursite.com" style={{ width: '100%' }} />
            </div>

            {/* Gender */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Gender</label>
              <select className="input-field" value={editGender} onChange={(e) => setEditGender(e.target.value)} style={{ width: '100%', appearance: 'none', cursor: 'pointer' }}>
                <option value="Prefer not to say">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Location</label>
              <input type="text" className="input-field" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="Dream City, Subconscious" style={{ width: '100%' }} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-ghost" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving || !editName.trim()} style={{ flex: 1 }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              <button 
                className="btn btn-ghost" 
                onClick={signOut} 
                style={{ width: '100%', color: 'var(--danger)', border: '1px solid var(--danger)', marginTop: '8px' }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
