import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';
import { encryptMessage } from './crypto';
import { supabase } from './supabaseClient';
import { useAuthStore } from './authStore';

export interface SocialUser {
  id: string;
  username: string;
  display_name: string;
  avatar_color: string;
  bio: string;
  followers: number;
  following: number;
  is_following: boolean;
}

export interface Post {
  id: string;
  user: SocialUser;
  archetype: string;
  text: string;
  realm: string;
  likes: number;
  has_liked: boolean;
  comments: { username: string; text: string }[];
  created_at: string;
}

export interface ChatMessage {
  senderId: string;
  text: string;
  timestamp: string; // ISO string
  seen?: boolean;
  encrypted?: boolean; // true if text is AES-256-GCM encrypted
}

export interface ChatThread {
  id: string;
  ownerId: string; // The user ID who owns this inbox thread
  user: SocialUser | { id: string; username: string; display_name: string; is_ai: boolean }; // The OTHER user
  messages: ChatMessage[];
  isPinned?: boolean;
  isUnread?: boolean;
}

interface SocialState {
  users: SocialUser[];
  posts: Post[];
  threads: ChatThread[];
  deletedPartnerIds: string[];
  activeThreadId: string | null;
  isLoading: boolean;

  initializeSocial: () => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, commentText: string) => void;
  toggleFollow: (userId: string) => void;
  sendMessage: (threadId: string, text: string) => Promise<void>;
  createThread: (user: SocialUser) => string;
  backupChats: () => Promise<void>;
  restoreChats: () => Promise<void>;
  syncDirectMessages: () => Promise<void>;
  deleteThread: (threadId: string) => void;
  togglePinThread: (threadId: string) => void;
  toggleUnreadThread: (threadId: string) => void;
  markThreadAsRead: (threadId: string) => void;
}

const MOCK_USERS: SocialUser[] = [
  { id: 'u_1', username: 'selene_dreamer', display_name: 'Selene Luna', avatar_color: '#8B8BF5', bio: 'Exploring deep lucidity and cosmic ocean portals. 🌌', followers: 231, following: 145, is_following: false },
  { id: 'u_2', username: 'chronos_key', display_name: 'Chronos', avatar_color: '#9B7EC8', bio: 'Searching for time keys in the falling cities.', followers: 512, following: 89, is_following: true },
  { id: 'u_3', username: 'aura_mind', display_name: 'Aura', avatar_color: '#7BA5B5', bio: 'Chasing the glowing forest whispers.', followers: 104, following: 210, is_following: false },
  { id: 'u_4', username: 'nebula_flow', display_name: 'Nebula', avatar_color: '#C4A962', bio: 'Just float through the void. ✨', followers: 389, following: 400, is_following: false },
];

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
  users: MOCK_USERS,
  posts: [],
  threads: [],
  deletedPartnerIds: [],
  activeThreadId: null,
  isLoading: false,

  initializeSocial: () => {
    // Generate some interesting global posts combining chronicles and dream archetypes
    const initialPosts: Post[] = [
      {
        id: 'p_1',
        user: MOCK_USERS[0],
        archetype: 'Floating Ocean Currents',
        text: 'I was floating over deep, glowing currents last night. The water felt warm, and when I reached out, stars came up from the deep.',
        realm: 'Ocean Realm',
        likes: 42,
        has_liked: false,
        comments: [
          { username: 'chronos_key', text: 'Amazing! I saw similar currents in the Maze.' }
        ],
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'p_2',
        user: MOCK_USERS[1],
        archetype: 'The Falling Towers',
        text: 'Skyscrapers were falling down around me like soft blocks. But they never hit the ground, they just drifted away like clouds.',
        realm: 'Falling City',
        likes: 128,
        has_liked: true,
        comments: [
          { username: 'aura_mind', text: 'This represents transition. Did you feel anxious?' }
        ],
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'p_3',
        user: MOCK_USERS[2],
        archetype: 'Whispering Trees',
        text: 'The trees spoke to me in ancient syllables. They said the boundary between realms is starting to dissolve.',
        realm: 'Lost Forest',
        likes: 19,
        has_liked: false,
        comments: [],
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ];
    set({ posts: initialPosts });
  },

  likePost: (postId) => {
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likes: p.has_liked ? p.likes - 1 : p.likes + 1,
            has_liked: !p.has_liked
          };
        }
        return p;
      })
    }));
  },

  addComment: (postId, commentText) => {
    const userJson = localStorage.getItem('dnet_user');
    const username = userJson ? JSON.parse(userJson).display_name : 'anonymous';
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, { username, text: commentText }]
          };
        }
        return p;
      })
    }));
  },

  toggleFollow: (userId) => {
    set((state) => ({
      users: state.users.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            is_following: !u.is_following,
            followers: u.is_following ? u.followers - 1 : u.followers + 1
          };
        }
        return u;
      })
    }));
  },

  sendMessage: async (threadId, text) => {
    const { useAuthStore } = await import('./authStore');
    const currentUserId = useAuthStore.getState().user?.id || 'me';
    const aiId = 'ai_dguide';
    const now = new Date().toISOString();

    const currentThread = get().threads.find((t) => t.id === threadId);
    if (!currentThread) return;

    const isAiThread = (currentThread.user as any).is_ai;
    const partnerId = currentThread.user.id;

    // Encrypt message for real user threads, plaintext for AI
    let storedText = text;
    let encrypted = false;
    if (!isAiThread) {
      storedText = await encryptMessage(text, currentUserId, partnerId);
      encrypted = true;
    }

    const myMsg: ChatMessage = { senderId: currentUserId, text: storedText, timestamp: now, encrypted };

    set((state) => ({
      threads: state.threads.map((t) => {
        if (t.id === threadId) {
          return { ...t, messages: [...t.messages, myMsg] };
        }
        return t;
      })
    }));

    if (isAiThread) {
      // D-Guide AI response via API (plaintext for AI to process)
      try {
        const updatedThread = get().threads.find((t) => t.id === threadId)!;
        const mappedMessages = updatedThread.messages.map((m) => ({
          role: m.senderId === currentUserId ? 'user' as const : 'assistant' as const,
          content: m.text
        }));
        const res = await api.post('/api/chat', { messages: mappedMessages });
        const replyText = res.data.response;
        set((state) => ({
          threads: state.threads.map((t) => {
            if (t.id === threadId) {
              return {
                ...t,
                messages: [...t.messages, { senderId: aiId, text: replyText, timestamp: new Date().toISOString(), encrypted: false }]
              };
            }
            return t;
          })
        }));
      } catch (err) {
        console.error('AI chat failed:', err);
      }
    } else {
      // Real user threads: Sync the message to the recipient's inbox locally
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        set((state) => {
          let recipientThread = state.threads.find(t => t.ownerId === partnerId && t.user.id === currentUserId);
          let newThreads = [...state.threads];

          if (!recipientThread) {
            recipientThread = {
              id: 't_' + Date.now() + '_recp',
              ownerId: partnerId,
              user: {
                id: currentUser.id,
                username: currentUser.email?.split('@')[0] || 'dreamer',
                display_name: (currentUser as any).user_metadata?.display_name || currentUser.email?.split('@')[0] || 'Dreamer',
                is_ai: false
              } as any,
              messages: []
            };
            newThreads.push(recipientThread);
          }

          // Add message to recipient's thread (with seen: false)
          newThreads = newThreads.map(t => {
            if (t.id === recipientThread!.id) {
              return { ...t, isUnread: true, messages: [...t.messages, { ...myMsg, seen: false }] };
            }
            return t;
          });

          return { threads: newThreads };
        });
      }

      // Also push to Supabase for cross-device sync
      supabase.from('chat_messages').insert({
        sender_id: currentUserId,
        receiver_id: partnerId,
        encrypted_text: storedText
      }).then(({ error }) => {
        if (error && error.code !== 'PGRST205') {
          console.error('Failed to sync to chat_messages:', error);
        }
      });
    }
  },

  createThread: (user) => {
    const currentUserId = useAuthStore.getState().user?.id || 'me';

    const existing = get().threads.find((t) => t.ownerId === currentUserId && t.user.id === user.id);
    if (existing) {
      set({ activeThreadId: existing.id });
      return existing.id;
    }
    const newId = 't_' + Date.now();
    const newThread: ChatThread = {
      id: newId,
      ownerId: currentUserId,
      user,
      messages: []
    };
    set((state) => ({
      threads: [newThread, ...state.threads],
      activeThreadId: newId
    }));
    return newId;
  },

  backupChats: async () => {
    const { useAuthStore } = await import('./authStore');
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    // Only backup this user's threads
    const myThreads = get().threads.filter(t => t.ownerId === user.id);
    const { error } = await supabase
      .from('chat_backups')
      .upsert({ user_id: user.id, threads_data: myThreads, updated_at: new Date().toISOString() });
    
    if (error) console.error('Failed to backup chats:', error);
  },

  restoreChats: async () => {
    const { useAuthStore } = await import('./authStore');
    const user = useAuthStore.getState().user;
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_backups')
      .select('threads_data')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Failed to restore chats:', error);
      return;
    }

    if (data && data.threads_data) {
      const restoredThreads = data.threads_data as ChatThread[];
      // Keep other users' threads local, update this user's threads
      set((state) => ({
        threads: [
          ...state.threads.filter(t => t.ownerId !== user.id),
          ...restoredThreads
        ]
      }));
    }
  },

  syncDirectMessages: async () => {
    const { useAuthStore } = await import('./authStore');
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Fetch all messages where user is sender or receiver
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: true });

    if (error) {
      if (error.code === 'PGRST205') {
        console.warn('Sync skipped: Please create chat_messages table in Supabase SQL editor.');
        return;
      }
      console.error('Failed to sync chat messages:', error);
      return;
    }
    
    if (!data) return;

    // We will merge these messages into the user's threads.
    // For simplicity, we can reconstruct the threads or just append missing messages.
    // Let's just rebuild the threads based on existing threads + new messages.
    set((state) => {
      let myThreads = state.threads.filter(t => t.ownerId === user.id);
      const otherThreads = state.threads.filter(t => t.ownerId !== user.id);

      // Get list of deleted partner IDs to skip
      const deletedIds = state.deletedPartnerIds || [];

      // Process each message
      data.forEach(msg => {
        const isMeSender = msg.sender_id === user.id;
        const partnerId = isMeSender ? msg.receiver_id : msg.sender_id;

        // Skip messages from partners the user has deleted
        if (deletedIds.includes(partnerId)) return;
        
        let thread = myThreads.find(t => t.user.id === partnerId);
        if (!thread) {
          // If we don't have the user's profile, we create a placeholder thread.
          // Ideally we would fetch the profile, but this is a quick sync.
          thread = {
            id: 't_' + partnerId,
            ownerId: user.id,
            user: {
              id: partnerId,
              username: 'dreamer_' + partnerId.substring(0, 4),
              display_name: 'Dreamer',
              is_ai: false
            } as any,
            messages: []
          };
          myThreads.push(thread);
        }

        // Check if message already exists by timestamp and text
        const exists = thread.messages.find(m => m.timestamp === msg.created_at && m.text === msg.encrypted_text);
        if (!exists) {
          thread.messages.push({
            senderId: msg.sender_id,
            text: msg.encrypted_text,
            timestamp: msg.created_at,
            encrypted: true,
            seen: isMeSender ? true : false
          });
          if (!isMeSender) thread.isUnread = true;
        }
      });

      // Sort messages in each thread by timestamp
      myThreads.forEach(t => {
        t.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      });

      return { threads: [...otherThreads, ...myThreads] };
    });
  },

  deleteThread: (threadId) => set((state) => {
    const threadToDelete = state.threads.find(t => t.id === threadId);
    const partnerId = threadToDelete?.user?.id;
    return {
      threads: state.threads.filter((t) => t.id !== threadId),
      activeThreadId: state.activeThreadId === threadId ? null : state.activeThreadId,
      deletedPartnerIds: partnerId && !(state.deletedPartnerIds || []).includes(partnerId)
        ? [...(state.deletedPartnerIds || []), partnerId]
        : (state.deletedPartnerIds || [])
    };
  }),

  togglePinThread: (threadId) => set((state) => ({
    threads: state.threads.map((t) => t.id === threadId ? { ...t, isPinned: !t.isPinned } : t)
  })),

  toggleUnreadThread: (threadId) => set((state) => ({
    threads: state.threads.map((t) => t.id === threadId ? { ...t, isUnread: !t.isUnread } : t)
  })),

  markThreadAsRead: (threadId) => set((state) => ({
    threads: state.threads.map((t) => {
      if (t.id === threadId) {
        return {
          ...t,
          isUnread: false,
          messages: t.messages.map(m => ({ ...m, seen: true }))
        };
      }
      return t;
    })
  }))
}),
{
  name: 'dnet-social-storage',
  partialize: (state) => ({ threads: state.threads, deletedPartnerIds: state.deletedPartnerIds }),
}
));
