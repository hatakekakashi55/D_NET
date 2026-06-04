import { useEffect, useState } from 'react';
import { useAuthStore } from './authStore';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/UniversePage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import { Home, Search, Compass, MessageCircle, User, LogOut, Settings } from 'lucide-react';
import { useSocialStore } from './socialStore';

type Tab = 'home' | 'search' | 'explore' | 'messages' | 'profile' | 'settings';

function App() {
  const { isAuthenticated, isLoading, initialize, signOut } = useAuthStore();
  const { initializeSocial } = useSocialStore();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null); // For viewing other profiles

  useEffect(() => {
    initialize();
    initializeSocial();
  }, []);

  if (isLoading) {
    return (
      <div className="loader-screen" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <div className="loader-text">Loading dream sphere...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const navigateToTab = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedUser(null);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    if (selectedUser) {
      return (
        <ProfilePage
          onNavigate={(page) => {
            if (page === 'profile') {
              setSelectedUser(null);
              setActiveTab('profile');
            } else if (page === 'messages') {
              setActiveTab('messages');
            }
          }}
          onBack={() => setSelectedUser(null)}
          viewedUser={selectedUser}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={(page, params) => {
          if (page === 'profile') {
            if (params?.user) setSelectedUser(params.user);
            else setActiveTab('profile');
          } else if (page === 'messages') {
            setActiveTab('messages');
          }
        }} />;
      case 'search':
        return <SearchPage onSelectUser={(user) => setSelectedUser(user)} />;
      case 'explore':
        return <ExplorePage onNavigate={() => {}} />;
      case 'messages':
        return <MessagesPage />;
      case 'profile':
        return <ProfilePage onNavigate={(page) => {
          if (page === 'home') setActiveTab('home');
          if (page === 'settings') setActiveTab('settings');
        }} onBack={() => setActiveTab('home')} />;
      case 'settings':
        return <SettingsPage onBack={() => setActiveTab('profile')} />;
      default:
        return <HomePage onNavigate={() => {}} />;
    }
  };

  const menuItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'search' as const, label: 'Search', icon: Search },
    { id: 'explore' as const, label: 'Explore', icon: Compass },
    { id: 'messages' as const, label: 'Messages', icon: MessageCircle },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Top Header (Insta Style) */}
      <div className="mobile-header">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.5px' }}>D-NET</span>
        {activeTab === 'profile' && !selectedUser ? (
          <button onClick={() => setActiveTab('settings')} style={{ color: 'var(--text-1)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Settings size={22} />
          </button>
        ) : (
          <button onClick={() => navigateToTab('messages')} style={{ color: 'var(--text-1)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <MessageCircle size={22} />
          </button>
        )}
      </div>

      <div className="app-shell" style={{ background: 'var(--bg)' }}>
        
        {/* Instagram Left Navigation Sidebar */}
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{
          width: '240px',
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
          padding: '24px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div className="sidebar-brand" style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.5px', marginBottom: '32px', paddingLeft: '12px' }}>
              D-NET
            </div>

            <div className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${activeTab === item.id && !selectedUser ? 'active' : ''}`}
                    onClick={() => navigateToTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      width: '100%',
                      textAlign: 'left',
                      fontSize: '15px'
                    }}
                  >
                    <Icon size={22} className="icon" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sidebar-footer">
            <button
              className="nav-item"
              onClick={() => navigateToTab('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                width: '100%',
                marginBottom: '8px'
              }}
            >
              <Settings size={22} />
              <span>Settings</span>
            </button>
            <button
              className="nav-item"
              onClick={signOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                width: '100%',
                color: 'var(--danger)'
              }}
            >
              <LogOut size={22} />
              <span>Log Out</span>
            </button>
          </div>
        </nav>

        {/* Main Content viewport */}
        <main className={`main-content ${activeTab === 'messages' ? 'main-content--messages' : ''}`} style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg)'
        }}>
          <div style={{ 
            width: '100%', 
            maxWidth: activeTab === 'messages' ? '100%' : '600px',
            height: activeTab === 'messages' ? '100%' : 'auto'
          }}>
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Instagram Style) */}
      <div className="mobile-bottom-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`mobile-nav-item ${activeTab === item.id && !selectedUser ? 'active' : ''}`}
              onClick={() => navigateToTab(item.id)}
            >
              <Icon size={22} />
            </button>
          );
        })}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 99, backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default App;
