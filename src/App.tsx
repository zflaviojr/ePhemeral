import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEphemeralStore } from './hooks/useEphemeralStore';
import { Onboarding } from './components/features/Onboarding';
import { Discovery } from './components/features/Discovery';
import { ChatRoom } from './components/features/ChatRoom';
import { Settings } from './components/features/Settings';
import { EditProfile } from './components/features/EditProfile';

type View = 'auth' | 'profile-setup' | 'discovery' | 'chat' | 'settings' | 'edit-profile';

function App() {
  const { t } = useTranslation();
  const { user, activeRoom, pruneMessages, initSocket } = useEphemeralStore();
  const [currentView, setCurrentView] = useState<View>('auth');

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  // Timer Global para mensagens efêmeras (10 minutos)
  // No demo, vamos rodar a cada 5 segundos para limpar mensagens expiradas
  useEffect(() => {
    const interval = setInterval(() => {
      pruneMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [pruneMessages]);

  // Redirecionamento baseado no estado do usuário
  useEffect(() => {
    if (!user) {
      setCurrentView('auth');
    } else if (currentView === 'auth') {
      setCurrentView('discovery');
    }
  }, [user]);

  // Função para renderizar a view atual
  const renderView = () => {
    switch (currentView) {
      case 'auth':
      case 'profile-setup':
        return <Onboarding onViewChange={setCurrentView} />;
      case 'discovery':
        return <Discovery onViewChange={setCurrentView} />;
      case 'chat':
        return activeRoom ? <ChatRoom onViewChange={setCurrentView} /> : <Discovery onViewChange={setCurrentView} />;
      case 'settings':
        return <Settings onViewChange={setCurrentView} />;
      case 'edit-profile':
        return <EditProfile onViewChange={setCurrentView} />;
      default:
        return <Discovery onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="app-container">
      <main className="main-content">
        {renderView()}
      </main>
      
      {/* Navegação inferior para mobile */}
      {user && currentView !== 'chat' && (
        <nav className="bottom-nav glass-panel">
          <button onClick={() => setCurrentView('discovery')} className={currentView === 'discovery' ? 'active' : ''}>
            {t('rooms.discovery')}
          </button>
          <button onClick={() => setCurrentView('settings')} className={currentView === 'settings' ? 'active' : ''}>
            {t('profile.settings')}
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
