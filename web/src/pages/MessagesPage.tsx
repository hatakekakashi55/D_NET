import { useState, useRef, useEffect } from 'react';
import { useSocialStore } from '../socialStore';
import type { ChatMessage } from '../socialStore';
import { formatMarkdown } from '../helpers';
import { ArrowLeft, Search, Phone, Video, Info, Image as ImageIcon, Mic, PlusCircle, MessageSquare, Camera, X, Lock, CloudUpload, CloudDownload, MoreVertical, Pin, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../authStore';
import { supabase } from '../supabaseClient';
import { decryptMessage } from '../crypto';

const D_GUIDE = {
  id: '9b2a4e19-b91f-4af9-879c-cc71d82b36ad',
  username: 'dguide',
  display_name: 'D-NET Dream Guide',
  is_ai: true,
  avatar_color: '#8B8BF5',
  bio: 'AI Subconscious Analyst'
} as any;

function getRelativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/** Renders a single message bubble, decrypting on-the-fly if needed */
function DecryptedBubble({ m, isMe, isFirst: _isFirst, isLast, isVeryLast, borderRadius, myUserId, partnerId }: {
  m: ChatMessage; isMe: boolean; isFirst: boolean; isLast: boolean; isVeryLast: boolean; borderRadius: string; myUserId: string; partnerId: string;
}) {
  const [text, setText] = useState(m.encrypted ? '🔒 Decrypting...' : m.text);

  useEffect(() => {
    if (m.encrypted) {
      decryptMessage(m.text, myUserId, partnerId).then(setText);
    } else {
      setText(m.text);
    }
  }, [m.text, m.encrypted, myUserId, partnerId]);

  return (
    <div style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: isLast ? '12px' : '2px' }}>
      <div
        className="msg-content"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }}
        style={{ background: isMe ? 'linear-gradient(135deg, var(--primary), #4CC9F0)' : 'var(--surface)', borderRadius, padding: '10px 16px', fontSize: '15px', lineHeight: '1.4', color: isMe ? '#fff' : 'var(--text-1)', wordBreak: 'break-word' }}
      />
      {isLast && (
        <span style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px', marginLeft: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {m.encrypted && <Lock size={10} />}
          {getRelativeTime(m.timestamp)}
          {isMe && isVeryLast && <span style={{ marginLeft: '4px', color: 'var(--primary)' }}>· Seen</span>}
        </span>
      )}
    </div>
  );
}

/** Renders a small preview of the last message in the thread list */
function DecryptedPreview({ m, myUserId, partnerId }: { m: ChatMessage; myUserId: string; partnerId: string; }) {
  const [text, setText] = useState(m.encrypted ? '🔒 ...' : m.text);

  useEffect(() => {
    if (m.encrypted) {
      decryptMessage(m.text, myUserId, partnerId).then(setText);
    } else {
      setText(m.text);
    }
  }, [m.text, m.encrypted, myUserId, partnerId]);

  return <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{text}</span>;
}

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { threads, activeThreadId, sendMessage, createThread, backupChats, restoreChats, syncDirectMessages } = useSocialStore();
  
  const myThreads = threads.filter(t => t.ownerId === user?.id);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [menuThreadId, setMenuThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync real-time messages on mount
  useEffect(() => {
    if (user) syncDirectMessages();
  }, [user]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeThread = myThreads.find((t) => t.id === activeThreadId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages, isSending]);

  useEffect(() => {
    if (isMobile && !!activeThreadId) {
      document.body.classList.add('chat-active');
    } else {
      document.body.classList.remove('chat-active');
    }
    return () => {
      document.body.classList.remove('chat-active');
    };
  }, [isMobile, activeThreadId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !input.trim() || isSending) return;

    const textToSend = input;
    setInput('');
    setIsSending(true);

    try {
      await sendMessage(activeThread.id, textToSend);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const openGuideChat = () => {
    const threadId = createThread(D_GUIDE);
    useSocialStore.setState({ activeThreadId: threadId });
    setShowSearch(false);
    setSearchQuery('');
  };

  const openUserChat = (u: any) => {
    const safeUser = { ...u, username: u.username || u.email?.split('@')[0] || 'dreamer', avatar_color: '#8B8BF5', followers: 0, following: 0, is_following: false };
    const threadId = createThread(safeUser);
    useSocialStore.setState({ activeThreadId: threadId });
    setShowSearch(false);
    setSearchQuery('');
  };

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const run = async () => {
      setIsSearching(true);
      const { data } = await supabase.from('profiles').select('*').ilike('display_name', `%${searchQuery}%`).limit(15);
      setIsSearching(false);
      setSearchResults(data || []);
    };
    const t = setTimeout(run, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [showSearch]);

  const showList = !isMobile || !activeThreadId;
  const showChat = !isMobile || !!activeThreadId;

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      border: isMobile ? 'none' : '1px solid var(--border)',
      borderRadius: isMobile ? '0' : 'var(--radius-lg)',
      background: 'var(--bg-elevated)'
    }}>
      {/* Sidebar - Threads list */}
      {showList && (
        <div style={{
          width: isMobile ? '100%' : '350px',
          borderRight: isMobile ? 'none' : '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-elevated)'
        }}>
          <div style={{
            padding: '20px 20px 12px 20px',
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {user?.display_name || 'Messages'}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={async () => {
                  setIsBackingUp(true);
                  await backupChats();
                  setIsBackingUp(false);
                  alert('Chats backed up successfully!');
                }}
                disabled={isBackingUp}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}
                title="Backup Chats to Cloud"
              >
                <CloudUpload size={20} />
              </button>
              <button 
                onClick={async () => {
                  setIsRestoring(true);
                  await restoreChats();
                  setIsRestoring(false);
                  alert('Chats restored successfully!');
                }}
                disabled={isRestoring}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}
                title="Restore Chats from Cloud"
              >
                <CloudDownload size={20} />
              </button>
            </div>
          </div>

          {/* Search bar trigger */}
          <div style={{ padding: '0 16px 12px 16px' }}>
            {showSearch ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', padding: '8px 14px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--primary)' }}>
                <Search size={14} color="var(--primary)" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search dreamers..."
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: '14px' }}
                />
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: 0 }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setShowSearch(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', padding: '10px 16px', borderRadius: 'var(--radius-pill)', cursor: 'text', border: '1px solid var(--border)' }}
              >
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(45deg, #8B8BF5, #4CC9F0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Search size={12} strokeWidth={3} />
                </div>
                <span style={{ color: 'var(--text-2)', fontSize: '14px', flex: 1 }}>Ask D-Guide AI or search...</span>
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px 8px' }}>
            {showSearch ? (
              /* Search Results Panel */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {/* Ask D-Guide button always at top */}
                <div
                  onClick={openGuideChat}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'var(--primary-dim)', border: '1px solid rgba(161,161,245,0.2)', marginBottom: '8px' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #8B8BF5, #4CC9F0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, fontSize: '18px' }}>✦</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--primary)' }}>Ask D-Guide</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Chat with the AI dream analyst</div>
                  </div>
                </div>

                {/* Divider */}
                {searchQuery.trim() && <div style={{ fontSize: '11px', color: 'var(--text-3)', padding: '4px 12px 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Dreamers</div>}

                {/* Results */}
                {isSearching ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '24px', fontSize: '14px' }}>Searching...</div>
                ) : searchResults.length === 0 && searchQuery.trim() ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '24px', fontSize: '14px' }}>No dreamers found</div>
                ) : (
                  searchResults.map((u) => (
                    <div key={u.id} onClick={() => openUserChat(u)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'transparent', transition: 'background 0.2s ease' }}>
                      {u.avatar_url ? (
                        <img src={u.avatar_url} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--border-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', flexShrink: 0, fontSize: '18px' }}>
                          {(u.display_name || u.email || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.display_name || u.email?.split('@')[0]}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>@{u.username || u.email?.split('@')[0]}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : myThreads.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)', padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <MessageSquare size={32} />
                </div>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-1)', fontSize: '18px' }}>Your Messages</h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                  Send private messages to other dreamers, or chat with D-Guide AI to analyze your subconscious.
                </p>
                <button className="btn btn-primary" onClick={openGuideChat} style={{ marginTop: '24px' }}>
                  Chat with D-Guide
                </button>
              </div>
            ) : (
              myThreads
                .sort((a, b) => {
                  if (a.isPinned && !b.isPinned) return -1;
                  if (!a.isPinned && b.isPinned) return 1;
                  return 0;
                })
                .map((t) => (
                <div
                  key={t.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: t.id === activeThreadId ? 'var(--surface)' : 'transparent', transition: 'background 0.2s ease', position: 'relative' }}
                  onClick={() => {
                    useSocialStore.setState({ activeThreadId: t.id });
                    if (t.isUnread) useSocialStore.getState().toggleUnreadThread(t.id);
                  }}
                  onMouseLeave={() => setMenuThreadId(null)}
                >
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: (t.user as any).avatar_color || 'var(--border-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px', color: '#fff', flexShrink: 0, position: 'relative' }}>
                    {t.user.display_name[0].toUpperCase()}
                    {t.isUnread && <span style={{ position: 'absolute', top: 2, right: 2, width: 12, height: 12, background: 'var(--primary)', borderRadius: '50%', border: '2px solid var(--bg)' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontWeight: 400, fontSize: '14px', color: 'var(--text-1)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{t.user.display_name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-3)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', gap: '4px' }}>
                      {t.messages.length > 0 ? (
                        <DecryptedPreview m={t.messages[t.messages.length - 1]} myUserId={user?.id || ''} partnerId={t.user.id} />
                      ) : (
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>Tap to chat</span>
                      )}
                      {t.messages.length > 0 && <span>· {getRelativeTime(t.messages[t.messages.length - 1]?.timestamp)}</span>}
                    </div>
                  </div>
                  
                  {/* Context Menu Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuThreadId(menuThreadId === t.id ? null : t.id); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {t.isPinned && <Pin size={14} style={{ marginRight: 4 }} />}
                    <MoreVertical size={16} />
                  </button>

                  {/* Context Menu Dropdown */}
                  {menuThreadId === t.id && (
                    <div style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '4px', zIndex: 10, display: 'flex', flexDirection: 'column', minWidth: '160px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); useSocialStore.getState().togglePinThread(t.id); setMenuThreadId(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer', textAlign: 'left', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}
                      >
                        <Pin size={16} /> {t.isPinned ? 'Unpin' : 'Pin to top'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); useSocialStore.getState().toggleUnreadThread(t.id); setMenuThreadId(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer', textAlign: 'left', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}
                      >
                        {t.isUnread ? <Eye size={16} /> : <EyeOff size={16} />} {t.isUnread ? 'Mark as read' : 'Mark as unread'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); useSocialStore.getState().deleteThread(t.id); setMenuThreadId(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', textAlign: 'left', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}
                      >
                        <Trash2 size={16} /> Delete chat
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Messaging Panel */}
      {showChat && activeThread && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', minWidth: 0, maxWidth: '100%', overflowX: 'hidden' }}>
          {/* Thread Header - Instagram Style */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-elevated)',
            height: '70px',
            minWidth: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px', minWidth: 0, flex: 1 }}>
              {isMobile && (
                <button
                  onClick={() => useSocialStore.setState({ activeThreadId: null })}
                  style={{ background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0, marginRight: '4px' }}
                >
                  <ArrowLeft size={24} />
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: (activeThread.user as any).avatar_color || 'var(--border-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: '#fff',
                  fontSize: '15px',
                  flexShrink: 0
                }}>
                  {activeThread.user.display_name[0].toUpperCase()}
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-1)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {activeThread.user.display_name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {(activeThread.user as any).is_ai ? 'AI Assistant' : `@${activeThread.user.username}`}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px', color: 'var(--text-1)', flexShrink: 0, marginLeft: '8px' }}>
              <Phone size={22} strokeWidth={1.5} style={{ cursor: 'pointer' }} />
              <Video size={24} strokeWidth={1.5} style={{ cursor: 'pointer' }} />
              <Info size={24} strokeWidth={1.5} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {/* Message Logs */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {activeThread.messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '40px 0' }}>
                <div style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: (activeThread.user as any).avatar_color || 'var(--border-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '40px',
                  color: '#fff',
                  marginBottom: '16px'
                }}>
                  {activeThread.user.display_name[0].toUpperCase()}
                </div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{activeThread.user.display_name}</h3>
                <p style={{ margin: 0, color: 'var(--text-3)', fontSize: '14px' }}>
                  {(activeThread.user as any).is_ai ? 'D-NET Artificial Intelligence' : 'D-NET Dreamer'}
                </p>
                <button className="btn btn-secondary" style={{ marginTop: '16px', borderRadius: 'var(--radius-pill)', padding: '6px 16px' }}>View Profile</button>
              </div>
            )}
            
            {activeThread.messages.map((m, idx) => {
              const isMe = m.senderId === user?.id;
              const prev = activeThread.messages[idx - 1];
              const next = activeThread.messages[idx + 1];
              const isFirst = !prev || prev.senderId !== m.senderId;
              const isLast = !next || next.senderId !== m.senderId;
              const isVeryLast = idx === activeThread.messages.length - 1;

              const borderRadius = isMe
                ? `18px ${isFirst ? '18px' : '4px'} ${isLast ? '18px' : '4px'} 18px`
                : `${isFirst ? '18px' : '4px'} 18px 18px ${isLast ? '18px' : '4px'}`;

              return (
                <DecryptedBubble
                  key={idx}
                  m={m}
                  isMe={isMe}
                  isFirst={isFirst}
                  isLast={isLast}
                  isVeryLast={isVeryLast}
                  borderRadius={borderRadius}
                  myUserId={user?.id || ''}
                  partnerId={activeThread.user.id}
                />
              );
            })}
            {isSending && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '75%' }}>
                <div style={{
                  background: 'var(--surface)',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '12px 16px',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <span className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-3)', borderRadius: '50%', animation: 'typing 1s infinite 0s' }} />
                  <span className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-3)', borderRadius: '50%', animation: 'typing 1s infinite 0.2s' }} />
                  <span className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-3)', borderRadius: '50%', animation: 'typing 1s infinite 0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Instagram Style Input Bar */}
          <div style={{ padding: '16px 20px', background: 'var(--bg-elevated)' }}>
            <form onSubmit={handleSend} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 12px',
              border: '1px solid var(--border)'
            }}>
              <button type="button" style={{ border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '50%', background: 'var(--primary-dim)' }}>
                <Camera size={20} strokeWidth={2} />
              </button>
              
              <input
                type="text"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-1)',
                  fontSize: '15px',
                  padding: '4px 0'
                }}
                placeholder="Message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isSending}
              />
              
              {input.trim() ? (
                <button
                  type="submit"
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '15px', padding: '0 8px' }}
                  disabled={isSending}
                >
                  Send
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-1)', paddingRight: '4px', flexShrink: 0 }}>
                  <Mic size={22} strokeWidth={1.5} style={{ cursor: 'pointer' }} />
                  <ImageIcon size={22} strokeWidth={1.5} style={{ cursor: 'pointer' }} />
                  <PlusCircle size={22} strokeWidth={1.5} style={{ cursor: 'pointer' }} />
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {showChat && !activeThread && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '96px', height: '96px', borderRadius: '50%', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <MessageSquare size={40} strokeWidth={1.5} />
          </div>
          <h2 style={{ margin: '0 0 8px 0', color: 'var(--text-1)' }}>Your Messages</h2>
          <p style={{ margin: 0, maxWidth: '300px' }}>Send private photos and messages to a friend or guide.</p>
          <button className="btn btn-primary" style={{ marginTop: '24px' }}>Send message</button>
        </div>
      )}
      
      {/* Add the typing animation keyframes if not present */}
      <style>{`
        @keyframes typing {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
