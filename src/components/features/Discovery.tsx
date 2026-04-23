import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useEphemeralStore, getUserColor } from '../../hooks/useEphemeralStore';
import { Button, Card } from '../base/Base';
import { MapPin, Clock, PlusCircle, X, ChevronRight, ShieldCheck, Zap, User } from 'lucide-react';

interface DiscoveryProps {
  onViewChange: (view: 'chat' | 'settings') => void;
}

export const Discovery: React.FC<DiscoveryProps> = ({ onViewChange }) => {
  const { t } = useTranslation();
  const { rooms, setActiveRoom, addRoom, recentInteractions, pruneRecentInteractions, setLocation, location, user } = useEphemeralStore();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newRoomName, setNewRoomName] = React.useState('');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: -23.5505, lng: -46.6333 }),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [setLocation]);

  useEffect(() => {
    const interval = setInterval(pruneRecentInteractions, 60000);
    return () => clearInterval(interval);
  }, [pruneRecentInteractions]);

  const handleJoinRoom = (room: any) => {
    if (!room) return;
    setActiveRoom(room);
    onViewChange('chat');
  };

  const handleCreateRoom = () => {
    if (newRoomName.trim() && user) {
      addRoom({
        id: Math.random().toString(36).substr(2, 9),
        name: newRoomName,
        type: 'adhoc',
        distance: 0,
        expiresAt: Date.now() + 3600000,
        createdBy: user.name
      });
      setNewRoomName('');
      setShowCreateModal(false);
    }
  };

  return (
    <div className="discovery-container">
      <header className="discovery-header glass-panel rounded-header">
        <div className="header-top">
          <h1>ePhemeral - {t('rooms.discovery')}</h1>
          <button className="add-room-btn" onClick={() => setShowCreateModal(true)}>
             <PlusCircle size={28} />
          </button>
        </div>
        <div className="location-badge">
          <MapPin size={16} />
          <span>{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Obtendo localização...'}</span>
        </div>
      </header>

      <div className="sections-wrapper">
        <section className="discovery-section">
          <div className="section-title">
            <Zap size={16} className="icon-fixed" />
            <h2>{t('rooms.fixed_rooms', 'Salas Fixas')}</h2>
          </div>
          <div className="horizontal-scroll">
            {rooms.filter(r => r.type === 'fixed').map(room => (
              <Card key={room.id} className="room-card fixed-type" onClick={() => handleJoinRoom(room)}>
                <div className="card-top">
                  <ShieldCheck size={14} className="verified-icon" />
                  <span>Verified</span>
                </div>
                <h3>{room.name}</h3>
                <div className="creator-tag">
                   <User size={10} />
                   <span>{room.createdBy || 'Sistema'}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="discovery-section">
          <div className="section-title">
            <Clock size={16} className="icon-adhoc" />
            <h2>{t('rooms.ephemeral_rooms', 'Salas Efêmeras')}</h2>
          </div>
          <div className="horizontal-scroll">
            {rooms.filter(r => r.type === 'adhoc').map(room => (
              <Card key={room.id} className="room-card adhoc-type" onClick={() => handleJoinRoom(room)}>
                <div className="adhoc-icon">T</div>
                <h3>{room.name}</h3>
                <div className="creator-tag">
                   <User size={10} />
                   <span>{room.createdBy || 'Anônimo'}</span>
                </div>
                <div className="timer-info">
                   <Clock size={12} />
                   <span>Expira logo</span>
                </div>
              </Card>
            ))}
            {rooms.filter(r => r.type === 'adhoc').length === 0 && <p className="empty-msg">Nenhuma sala ativa</p>}
          </div>
        </section>

        <section className="discovery-section">
          <div className="section-title">
            <h2>{t('profile.recent_contacts', 'Contatos Recentes')}</h2>
          </div>
          <div className="interactions-list">
            {recentInteractions.length === 0 ? (
              <p className="empty-msg">Nenhum contato recente</p>
            ) : (
              recentInteractions.map(interaction => (
                <Card key={interaction.user.id} className="contact-item">
                  <div className="contact-avatar-wrapper">
                    <div 
                      className="contact-avatar"
                      style={{ 
                        backgroundColor: getUserColor(interaction.user.id),
                        backgroundImage: interaction.user.avatar ? `url(${interaction.user.avatar})` : 'none'
                      } as any}
                    >
                      {!interaction.user.avatar && interaction.user.name[0]}
                    </div>
                  </div>
                  <div className="contact-info">
                    <h4>{interaction.user.name}</h4>
                    <span>Online</span>
                  </div>
                  <ChevronRight size={18} color="#ccc" />
                </Card>
              ))
            )}
          </div>
        </section>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="create-room-modal-card glass-panel">
            <div className="modal-header">
              <h3>{t('rooms.create_adhoc')}</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <input 
                className="input-base"
                placeholder="Nome da sala"
                autoFocus
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
              />
              <Button onClick={handleCreateRoom} fluid>{t('common.confirm')}</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .discovery-container { padding-bottom: 110px; background-color: var(--bg-grey); min-height: 100vh; font-family: 'Inter', sans-serif; }
        .discovery-header { padding: 20px; margin-bottom: 15px; }
        .rounded-header { border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .header-top { display: flex; justify-content: space-between; align-items: center; }
        .discovery-header h1 { font-size: 1.4rem; color: var(--primary-dark); font-weight: 800; margin: 0; }
        .location-badge { display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 0.8rem; margin-top: 6px; font-weight: 500; }
        
        .sections-wrapper { padding: 0 20px; display: flex; flex-direction: column; gap: 20px; }
        .discovery-section { display: flex; flex-direction: column; }
        
        .section-title { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .section-title h2 { font-size: 1rem; color: var(--primary-dark); font-weight: 700; margin: 0; opacity: 0.8; }
        
        /* Room Cards */
        .horizontal-scroll { display: flex; gap: 12px; overflow-x: auto; padding: 5px 0 15px; scrollbar-width: none; }
        .horizontal-scroll::-webkit-scrollbar { display: none; }
        
        .room-card { min-width: 140px; padding: 15px; border-radius: 24px; cursor: pointer; text-align: center; border: 1px solid rgba(0,0,0,0.03); transition: all 0.3s; background: white; position: relative; }
        .room-card:active { transform: scale(0.95); }
        .room-card h3 { font-size: 0.9rem; margin: 10px 0 2px; font-weight: 700; color: #333; }
        
        .creator-tag { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 0.6rem; color: var(--text-secondary); margin-bottom: 8px; }

        .fixed-type { border-top: 5px solid var(--primary-color); box-shadow: 0 15px 35px rgba(138, 136, 251, 0.1); }
        .card-top { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 0.65rem; color: #4CAF50; font-weight: 800; text-transform: uppercase; }

        .adhoc-type { border-top: 5px dashed #FF7E67; box-shadow: 0 15px 35px rgba(255, 126, 103, 0.1); }
        .adhoc-icon { width: 36px; height: 36px; background: #FF7E67; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-weight: 900; font-size: 1.1rem; }
        .timer-info { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 0.7rem; color: #FF7E67; font-weight: 600; }

        .interactions-list { display: flex; flex-direction: column; gap: 10px; }
        .contact-item { display: flex; align-items: center; gap: 15px; padding: 12px 18px; border-radius: 24px; }
        .contact-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; background-size: cover; background-position: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .contact-info h4 { margin: 0; font-size: 1rem; font-weight: 700; color: #333; }
        .contact-info span { font-size: 0.75rem; color: var(--text-secondary); }
        
        .empty-msg { font-size: 0.8rem; color: #999; text-align: center; padding: 10px; width: 100%; }
        .add-room-btn { background: none; border: none; color: var(--primary-color); cursor: pointer; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .create-room-modal-card { width: 100%; max-width: 360px; background: white; border-radius: 32px; padding: 35px 30px 30px; box-shadow: 0 25px 50px rgba(0,0,0,0.2); position: relative; }
        .close-btn { position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.05); border: none; color: #999; cursor: pointer; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .close-btn:hover { background: rgba(0,0,0,0.1); color: var(--primary-dark); }
        .modal-header { margin-bottom: 20px; padding-right: 30px; }
        .modal-header h3 { margin: 0; font-size: 1.3rem; color: var(--primary-dark); font-weight: 800; line-height: 1.2; }
        .modal-body { display: flex; flex-direction: column; gap: 20px; }
      `}</style>
    </div>
  );
};
