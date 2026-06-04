import { useState } from 'react';
import { useAuthStore } from '../authStore';
import { useSocialStore } from '../socialStore';
import {
  ArrowLeft, User, Lock, Bell, Moon, Eye, HelpCircle, Info, Shield,
  CloudUpload, CloudDownload, Database, Trash2, LogOut, ChevronRight,
  Globe, Heart, Star, Palette, MessageSquare
} from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { user, updateProfile, signOut } = useAuthStore();
  const { backupChats, restoreChats } = useSocialStore();

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Edit Profile state
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPronouns, setEditPronouns] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editGender, setEditGender] = useState('Prefer not to say');
  const [editLocation, setEditLocation] = useState('');
  const [saving, setSaving] = useState(false);

  // Settings toggles
  const [darkMode, setDarkMode] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [likeNotifications, setLikeNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [encryptMessages, setEncryptMessages] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);

  const openEditProfile = () => {
    setEditName(user?.display_name || '');
    setEditUsername(user?.username || user?.email.split('@')[0] || '');
    setEditPronouns(user?.pronouns || '');
    setEditBio(user?.bio || '');
    setEditWebsite(user?.website || '');
    setEditGender(user?.gender || 'Prefer not to say');
    setEditLocation(user?.location || '');
    setActiveSection('edit_profile');
  };

  const handleSaveProfile = async () => {
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
    setActiveSection(null);
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      await backupChats();
      alert('✅ Chat backup successful!');
    } catch (err) {
      alert('❌ Backup failed');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await restoreChats();
      alert('✅ Chats restored successfully!');
    } catch (err) {
      alert('❌ Restore failed');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure? This will clear all local data including chat history, dreams, and settings.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await signOut();
    }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
        background: value ? 'var(--primary)' : 'var(--border)', position: 'relative', transition: 'background 0.3s ease',
        flexShrink: 0
      }}
    >
      <span style={{
        width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px',
        left: value ? '22px' : '2px', transition: 'left 0.3s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }} />
    </button>
  );

  const SettingsItem = ({ icon: Icon, label, subtitle, onClick, danger, rightContent }: {
    icon: any; label: string; subtitle?: string; onClick?: () => void; danger?: boolean; rightContent?: React.ReactNode;
  }) => (
    <div
      role="button"
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', width: '100%',
        background: 'none', border: 'none', cursor: onClick ? 'pointer' : 'default',
        borderRadius: 'var(--radius-md)', textAlign: 'left', transition: 'background 0.2s ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
    >
      <Icon size={22} style={{ color: danger ? 'var(--danger)' : 'var(--text-2)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', color: danger ? 'var(--danger)' : 'var(--text-1)', fontWeight: 400 }}>{label}</div>
        {subtitle && <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>{subtitle}</div>}
      </div>
      {rightContent || (onClick && <ChevronRight size={18} style={{ color: 'var(--text-3)', flexShrink: 0 }} />)}
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div style={{ padding: '20px 16px 8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {title}
    </div>
  );

  // Sub-sections
  if (activeSection === 'edit_profile') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setActiveSection(null)} style={{ background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer', display: 'flex', padding: 0 }}><ArrowLeft size={24} /></button>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Edit Profile</h2>
          </div>
          <button onClick={handleSaveProfile} disabled={saving || !editName.trim()} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}>
            {saving ? 'Saving...' : 'Done'}
          </button>
        </div>
        
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</label>
            <input type="text" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Username</label>
            <input type="text" className="input-field" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="username" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Pronouns</label>
            <input type="text" className="input-field" value={editPronouns} onChange={(e) => setEditPronouns(e.target.value)} placeholder="they/them" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Bio</label>
            <textarea className="input-field" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Subconscious explorer. Dream journaler." rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)', outline: 'none', resize: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Links</label>
            <input type="url" className="input-field" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} placeholder="https://yoursite.com" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Gender</label>
            <select className="input-field" value={editGender} onChange={(e) => setEditGender(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
              <option value="Prefer not to say">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Location</label>
            <input type="text" className="input-field" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="Dream City, Subconscious" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)', outline: 'none' }} />
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'notifications') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setActiveSection(null)} style={{ background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer', display: 'flex', padding: 0 }}><ArrowLeft size={24} /></button>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Notifications</h2>
        </div>
        <SectionHeader title="Push Notifications" />
        <SettingsItem icon={Bell} label="Push Notifications" subtitle="Get notified about activity" rightContent={<Toggle value={pushNotifications} onChange={setPushNotifications} />} />
        <SectionHeader title="Types" />
        <SettingsItem icon={MessageSquare} label="Messages" subtitle="Notify when you receive messages" rightContent={<Toggle value={messageNotifications} onChange={setMessageNotifications} />} />
        <SettingsItem icon={Heart} label="Likes" subtitle="Notify when someone likes your post" rightContent={<Toggle value={likeNotifications} onChange={setLikeNotifications} />} />
        <SettingsItem icon={MessageSquare} label="Comments" subtitle="Notify when someone comments" rightContent={<Toggle value={commentNotifications} onChange={setCommentNotifications} />} />
      </div>
    );
  }

  if (activeSection === 'privacy') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setActiveSection(null)} style={{ background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer', display: 'flex', padding: 0 }}><ArrowLeft size={24} /></button>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Privacy</h2>
        </div>
        <SectionHeader title="Account Privacy" />
        <SettingsItem icon={Lock} label="Private Account" subtitle="Only approved followers can see your dreams" rightContent={<Toggle value={privateAccount} onChange={setPrivateAccount} />} />
        <SettingsItem icon={Eye} label="Activity Status" subtitle="Show when you're active" rightContent={<Toggle value={showActivity} onChange={setShowActivity} />} />
        <SectionHeader title="Messages" />
        <SettingsItem icon={Shield} label="End-to-End Encryption" subtitle="AES-256-GCM encryption for all messages" rightContent={<Toggle value={encryptMessages} onChange={setEncryptMessages} />} />
        <SettingsItem icon={Eye} label="Read Receipts" subtitle="Let others know when you've seen their messages" rightContent={<Toggle value={readReceipts} onChange={setReadReceipts} />} />
      </div>
    );
  }

  if (activeSection === 'data') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setActiveSection(null)} style={{ background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer', display: 'flex', padding: 0 }}><ArrowLeft size={24} /></button>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Data & Storage</h2>
        </div>
        <SectionHeader title="Backup" />
        <SettingsItem
          icon={CloudUpload}
          label={isBackingUp ? 'Backing up...' : 'Backup Chats'}
          subtitle="Save your encrypted chats to the cloud"
          onClick={handleBackup}
        />
        <SettingsItem
          icon={CloudDownload}
          label={isRestoring ? 'Restoring...' : 'Restore Chats'}
          subtitle="Restore chats from cloud backup"
          onClick={handleRestore}
        />
        <SectionHeader title="Storage" />
        <SettingsItem
          icon={Trash2}
          label="Clear All Data"
          subtitle="Remove all local data, chats, and cached dreams"
          onClick={handleClearData}
          danger
        />
      </div>
    );
  }

  // Main settings page
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer', display: 'flex', padding: 0 }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Settings</h2>
      </div>

      {/* Profile Card */}
      <div
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 16px',
          borderBottom: '1px solid var(--border)', cursor: 'pointer'
        }}
      >
        {(user as any)?.avatar_url ? (
          <img
            src={(user as any).avatar_url}
            alt="Profile"
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
            fontSize: '22px', color: '#fff'
          }}>
            {(user?.display_name?.[0] || 'D').toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-1)' }}>{user?.display_name}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>{user?.email}</div>
        </div>
        <ChevronRight size={20} style={{ color: 'var(--text-3)' }} />
      </div>

      {/* Settings Sections */}
      <SectionHeader title="Account" />
      <SettingsItem icon={User} label="Edit Profile" subtitle="Name, bio, avatar, website" onClick={openEditProfile} />
      <SettingsItem icon={Lock} label="Privacy" subtitle="Account privacy, activity status" onClick={() => setActiveSection('privacy')} />
      <SettingsItem icon={Shield} label="Security" subtitle="Password, login activity" onClick={() => {}} />

      <SectionHeader title="Preferences" />
      <SettingsItem icon={Bell} label="Notifications" subtitle="Messages, likes, comments" onClick={() => setActiveSection('notifications')} />
      <SettingsItem icon={Moon} label="Dark Mode" subtitle="Toggle dark theme" rightContent={<Toggle value={darkMode} onChange={setDarkMode} />} />
      <SettingsItem icon={Palette} label="Theme" subtitle="Customize app appearance" onClick={() => {}} />
      <SettingsItem icon={Globe} label="Language" subtitle="English" onClick={() => {}} />

      <SectionHeader title="Data & Storage" />
      <SettingsItem icon={Database} label="Data & Storage" subtitle="Backup, restore, clear data" onClick={() => setActiveSection('data')} />
      <SettingsItem icon={Star} label="Favorites" subtitle="Manage saved items" onClick={() => {}} />

      <SectionHeader title="Help" />
      <SettingsItem icon={HelpCircle} label="Help Center" subtitle="FAQ, contact support" onClick={() => {}} />
      <SettingsItem icon={Info} label="About" subtitle="D-NET v1.0.0" onClick={() => {}} />

      <SectionHeader title="" />
      <SettingsItem icon={LogOut} label="Log Out" subtitle={user?.email || ''} onClick={handleLogout} danger />

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-3)', fontSize: '12px' }}>
        <div style={{ marginBottom: '4px' }}>D-NET · Dream Network</div>
        <div>Version 1.0.0</div>
      </div>
    </div>
  );
}
