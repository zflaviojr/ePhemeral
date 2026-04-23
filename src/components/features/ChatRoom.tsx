import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useEphemeralStore } from '../../hooks/useEphemeralStore';
import { ArrowLeft, Send, Image as ImageIcon, Users, Info, X } from 'lucide-react';
import { Button, Card } from '../base/Base';

interface ChatRoomProps {
  onViewChange: (view: 'discovery') => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ onViewChange }) => {
  const { t } = useTranslation();
  const { activeRoom, messages, addMessage, user, setActiveRoom, joinRoom, leaveRoom, socket } = useEphemeralStore();
  const [inputText, setInputText] = useState('');
  const [showMembers, setShowMembers] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [activeSenders, setActiveSenders] = useState<Record<string, boolean>>({});
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  
  // Exit animation state
  const [localParticipants, setLocalParticipants] = useState<any[]>([]);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAnnounced = useRef(false);

  useEffect(() => {
    if (socket && user && activeRoom && !hasAnnounced.current) {
      joinRoom(activeRoom.id, user);
      addMessage({
        id: Math.random().toString(36).substr(2, 9),
        senderId: 'system',
        senderName: 'Sistema',
        text: `${user.name} entrou na sala`,
        type: 'text'
      });
      hasAnnounced.current = true;
    }
  }, [socket?.id, activeRoom?.id, user?.id]);

  useEffect(() => {
    if (!activeRoom) return;
    const storeParts = activeRoom.participants || [];
    const currentIds = new Set(storeParts.map(p => p.id));
    const leftParticipants = localParticipants.filter(p => !currentIds.has(p.id) && !exitingIds.has(p.id));
    
    if (leftParticipants.length > 0) {
      setExitingIds(prev => {
        const next = new Set(prev);
        leftParticipants.forEach(p => next.add(p.id));
        return next;
      });
      setTimeout(() => {
        setExitingIds(prev => {
          const next = new Set(prev);
          leftParticipants.forEach(p => next.delete(p.id));
          return next;
        });
        setLocalParticipants(storeParts);
      }, 1000);
    } else {
      setLocalParticipants(storeParts);
    }
  }, [activeRoom?.participants]);

  useEffect(() => {
    if (isAutoScrollEnabled && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAutoScrollEnabled]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setIsAutoScrollEnabled(scrollHeight - scrollTop - clientHeight < 60);
    }
  };

  useEffect(() => {
    const latestMsg = messages[messages.length - 1];
    if (latestMsg && latestMsg.senderId !== 'system') {
      setActiveSenders(prev => ({ ...prev, [latestMsg.senderId]: true }));
      const timer = setTimeout(() => {
        setActiveSenders(prev => ({ ...prev, [latestMsg.senderId]: false }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSend = () => {
    if ((inputText.trim() || pendingImage) && user) {
      addMessage({
        id: Math.random().toString(36).substr(2, 9),
        senderId: user.id,
        senderName: user.name,
        text: inputText,
        type: pendingImage ? 'media' : 'text',
        mediaUrl: pendingImage || undefined
      });
      setInputText('');
      setPendingImage(null);
      setIsAutoScrollEnabled(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPendingImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const confirmLeave = () => {
    if (user && activeRoom) {
      addMessage({
        id: Math.random().toString(36).substr(2, 9),
        senderId: 'system',
        senderName: 'Sistema',
        text: `${user.name} saiu da sala`,
        type: 'text'
      });
      leaveRoom(activeRoom.id, user.id);
    }
    setIsLeaving(true);
    setTimeout(() => {
      setActiveRoom(null);
      onViewChange('discovery');
    }, 800);
  };

  if (!activeRoom) return null;

  const displayParticipants = [
    ...localParticipants,
    ...localParticipants.filter(p => exitingIds.has(p.id))
  ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  return (
    <div className={`chat-container ${isLeaving ? 'animate-leave' : ''}`}>
      <header className="chat-header glass-panel rounded-header shadow-glow">
        <button className="header-btn" onClick={() => setShowLeaveConfirm(true)}>
          <ArrowLeft size={22} />
        </button>
        <div className="room-info-header">
          <h2>{activeRoom.name}</h2>
          <div className="room-meta">
            <span className="room-type-tag">{activeRoom.type === 'fixed' ? 'Premium' : 'Efêmera'}</span>
            <span className="creator-header-tag">by {activeRoom.createdBy || 'Sistema'}</span>
          </div>
        </div>
        <button className="header-btn" onClick={() => setShowMembers(!showMembers)}>
          <Users size={22} />
        </button>
      </header>

      <div className="chat-body-v-layout">
        <div className="chat-middle-section">
          <aside className={`members-sidebar glass-panel ${showMembers ? 'open' : 'closed'}`}>
            <div className="sidebar-scroll">
              {displayParticipants.map(p => (
                <div 
                  key={p.id} 
                  className={`member-avatar ${activeSenders[p.id] ? 'pulse-glow' : ''} ${exitingIds.has(p.id) ? 'member-exit' : ''}`}
                  style={{ 
                    backgroundImage: p.avatar ? `url(${p.avatar})` : 'none',
                    backgroundColor: p.avatar ? 'transparent' : 'white',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  } as any}
                  title={p.name}
                >
                  {!p.avatar && p.name[0]}
                </div>
              ))}
            </div>
          </aside>

          <div className="chat-messages-area" ref={scrollRef} onScroll={handleScroll}>
            <div className="ephemeral-alert-pill">
              <span className="info-icon-wrapper"><Info size={12} /></span>
              <span>{t('chat.ephemeral_note')}</span>
            </div>
            {messages.map((msg) => {
              if (msg.senderId === 'system') {
                return (
                  <div key={msg.id} className="system-msg-center">
                    <span>{msg.text}</span>
                  </div>
                );
              }

              const age = Date.now() - msg.timestamp;
              const isDissolving = age > (10 * 60 * 1000) - 8000;
              
              return (
                <div key={msg.id} className={`msg-wrapper ${msg.senderId === user?.id ? 'msg-own' : ''} ${isDissolving ? 'msg-dissolve' : ''}`}>
                  {msg.senderId !== user?.id && <div className="msg-sender">{msg.senderName}</div>}
                  <div className="msg-bubble shadow-sm">
                    {msg.type === 'media' && msg.mediaUrl && (
                      <div className="msg-media">
                        <img src={msg.mediaUrl} alt="Content" />
                      </div>
                    )}
                    {msg.text && <div className="msg-text">{msg.text}</div>}
                    <div className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {pendingImage && (
          <div className="image-preview-stage-full glass-panel shadow-glow">
            <div className="preview-container">
              <img src={pendingImage} alt="Pending" />
              <button className="remove-preview-btn" onClick={() => setPendingImage(null)}>
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <footer className="chat-footer-full glass-panel">
          <input type="file" id="chat-file" hidden accept="image/*" onChange={handleFileChange} />
          <button className="footer-action" onClick={() => document.getElementById('chat-file')?.click()}>
            <ImageIcon size={24} />
          </button>
          <input 
            type="text" 
            className="chat-input-pill"
            placeholder={t('chat.placeholder')}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="send-action-btn" onClick={handleSend} disabled={!inputText.trim() && !pendingImage}>
            <Send size={24} />
          </button>
        </footer>
      </div>

      {showLeaveConfirm && (
        <div className="modal-overlay">
           <Card className="modal-popup-card glass-panel">
              <h3>{t('chat.leave_confirm_title')}</h3>
              <p>{t('chat.leave_confirm_msg')}</p>
              <div className="modal-btns">
                <Button variant="secondary" onClick={() => setShowLeaveConfirm(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant="danger" onClick={confirmLeave} className="danger-btn">
                  {t('common.leave')}
                </Button>
              </div>
           </Card>
        </div>
      )}

      <style>{`
        .chat-container { 
          height: 100vh; height: 100dvh; width: 100vw;
          display: flex; flex-direction: column; background: var(--bg-chat); font-family: 'Inter', sans-serif; position: relative; overflow: hidden; 
        }
        .chat-header { display: flex; align-items: center; padding: 15px 20px; gap: 15px; z-index: 100; color: white; background: rgba(138, 136, 251, 0.4); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; }
        .rounded-header { border-bottom-left-radius: 35px; border-bottom-right-radius: 35px; margin: 0 4px; }
        .shadow-glow { box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
        .header-btn { background: none; border: none; color: white; cursor: pointer; display: flex; align-items: center; padding: 8px; border-radius: 50%; }
        
        .room-info-header { flex: 1; min-width: 0; }
        .room-info-header h2 { margin: 0; font-size: 1.1rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .room-meta { display: flex; align-items: center; gap: 8px; }
        .room-type-tag { font-size: 0.6rem; background: rgba(255,255,255,0.2); padding: 1px 8px; border-radius: 8px; font-weight: 700; text-transform: uppercase; }
        .creator-header-tag { font-size: 0.65rem; color: rgba(255,255,255,0.8); font-weight: 500; font-style: italic; }

        .chat-body-v-layout { flex: 1; display: flex; flex-direction: column; min-height: 0; position: relative; width: 100%; }
        .chat-middle-section { flex: 1; display: flex; min-height: 0; width: 100%; }

        .members-sidebar { width: 75px; background: rgba(255, 255, 255, 0.08); border-top-right-radius: 35px; border-bottom-right-radius: 35px; margin: 5px 10px 5px 0; transition: width 0.3s; display: flex; flex-direction: column; align-items: center; padding: 15px 0; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-left: none; flex-shrink: 0; }
        .members-sidebar.closed { width: 0; padding: 0; margin: 0; overflow: hidden; opacity: 0; }
        
        .sidebar-scroll { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; padding: 0 10px; scrollbar-width: none; height: 100%; }
        .member-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; color: var(--primary-dark); background: white; transition: all 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.15); border: 2px solid rgba(255,255,255,0.5); }
        .pulse-glow { animation: pulseGlowAnimate 2s infinite ease-in-out; }
        @keyframes pulseGlowAnimate {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          50% { box-shadow: 0 0 20px 5px rgba(255, 255, 255, 0.4); }
        }
        
        .member-exit { animation: smokeEffectExit 1s forwards ease-in-out; }
        @keyframes smokeEffectExit {
          0% { opacity: 1; filter: blur(0); transform: scale(1); }
          100% { opacity: 0; filter: blur(10px); transform: scale(1.5) translateY(-20px); }
        }

        .chat-messages-area { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; min-width: 0; }
        
        .ephemeral-alert-pill { align-self: center; background: rgba(0,0,0,0.2); color: white; padding: 6px 16px; border-radius: 20px; font-size: 0.7rem; display: flex; align-items: center; gap: 6px; margin-bottom: 10px; font-weight: 500; }
        .system-msg-center { align-self: center; text-align: center; margin-bottom: 5px; }
        .system-msg-center span { font-size: 0.65rem; color: rgba(255,255,255,0.5); font-weight: 600; padding: 2px 10px; }

        .msg-wrapper { display: flex; flex-direction: column; max-width: 82%; align-self: flex-start; }
        .msg-own { align-self: flex-end; }
        .msg-dissolve { animation: smokeEffect 6s forwards ease-in-out; pointer-events: none; }
        
        @keyframes smokeEffect {
          0% { opacity: 1; filter: blur(0); transform: translateY(0); }
          100% { opacity: 0; filter: blur(15px); transform: translateY(-50px) scale(1.1); }
        }

        .msg-sender { font-size: 0.7rem; color: rgba(255,255,255,0.9); margin: 0 0 4px 8px; font-weight: 700; }
        .msg-bubble { background: white; color: #333; padding: 10px 14px; border-radius: 18px; border-bottom-left-radius: 4px; line-height: 1.5; font-size: 0.95rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .msg-own .msg-bubble { background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); color: white; border-bottom-left-radius: 18px; border-bottom-right-radius: 4px; box-shadow: 0 4px 12px rgba(138, 136, 251, 0.2); }
        
        .msg-text { word-break: break-word; font-weight: 500; }
        .msg-time { font-size: 0.6rem; color: rgba(0,0,0,0.3); text-align: right; margin-top: 4px; font-weight: 600; }
        .msg-own .msg-time { color: rgba(255,255,255,0.5); }
        
        .msg-media img { max-width: 100%; border-radius: 12px; display: block; margin-bottom: 8px; }

        .image-preview-stage-full { position: absolute; bottom: 100px; left: 50%; transform: translateX(-50%); z-index: 100; padding: 10px; border-radius: 20px; }
        .preview-container { position: relative; max-height: 200px; }
        .preview-container img { max-height: 200px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
        .remove-preview-btn { position: absolute; top: -10px; right: -10px; background: white; border: none; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary-dark); cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }

        .chat-footer-full { 
          padding: 15px 20px 35px; 
          display: flex; 
          gap: 12px; 
          align-items: center; 
          background: white; 
          border-top-left-radius: 35px; 
          border-top-right-radius: 35px; 
          box-shadow: 0 -5px 30px rgba(0,0,0,0.1); 
          z-index: 10; 
          width: 100%;
          flex-shrink: 0;
        }
        .chat-input-pill { flex: 1; border: none; background: #f0f2f5; padding: 16px 22px; border-radius: 25px; outline: none; font-size: 1rem; color: #333 !important; font-weight: 500; }
        .footer-action, .send-action-btn { background: none; border: none; color: var(--primary-color); cursor: pointer; padding: 10px; transition: transform 0.2s; }
        .send-action-btn:disabled { opacity: 0.3; }

        .modal-popup-card { width: 100%; max-width: 320px; background: white; border-radius: 32px; padding: 30px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.3); }
        .modal-btns { display: flex; gap: 12px; margin-top: 25px; justify-content: center; }
      `}</style>
    </div>
  );
};
