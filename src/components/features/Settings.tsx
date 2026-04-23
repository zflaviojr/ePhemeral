import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEphemeralStore } from '../../hooks/useEphemeralStore';
import { Button, Card } from '../base/Base';
import { User, Moon, Sun, Shield, FileText, CheckCircle, ChevronRight, X } from 'lucide-react';

interface SettingsProps {
  onViewChange: (view: 'discovery' | 'edit-profile') => void;
}

export const Settings: React.FC<SettingsProps> = ({ onViewChange }) => {
  const { t } = useTranslation();
  const { user } = useEphemeralStore();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'verified'>('none');

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
  };

  const handleVerify = () => {
    setVerificationStatus('pending');
    setTimeout(() => {
      setVerificationStatus('verified');
    }, 3000);
  };

  const confirmLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>{t('profile.settings')}</h1>
      </header>

      <section className="profile-hero">
        <div className="banner-mock" style={{ backgroundImage: `url(${user?.banner})`, backgroundSize: 'cover' }}></div>
        <div className="profile-info-row">
          <div className="avatar-large" style={{ backgroundImage: `url(${user?.avatar})`, backgroundSize: 'cover' }}>
            {!user?.avatar && user?.name?.[0]}
          </div>
          <div className="text-info">
             <h2>{user?.name}</h2>
             <p>{user?.phone}</p>
          </div>
        </div>
        <Card className="welcome-card">
           <p>"{user?.welcomeMessage || 'Bem-vindo ao meu perfil!'}"</p>
        </Card>
      </section>

      <div className="settings-list">
        <Card className="setting-item" onClick={() => onViewChange('edit-profile')}>
           <div className="setting-label">
             <User size={20} />
             <span>{t('profile.edit_profile')}</span>
           </div>
           <ChevronRight size={20} />
        </Card>

        <Card className="setting-item" onClick={toggleDarkMode}>
           <div className="setting-label">
             {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             <span>{t('profile.dark_mode')}</span>
           </div>
           <div className={`toggle-switch ${isDarkMode ? 'active' : ''}`}></div>
        </Card>

        <Card className="setting-item" onClick={() => setShowVerification(true)}>
           <div className="setting-label">
             <Shield size={20} />
             <span>{t('profile.owner_verification')}</span>
           </div>
           <div className={`status-icon ${verificationStatus}`}>
              {verificationStatus === 'verified' && <CheckCircle size={20} />}
              {verificationStatus === 'pending' && <span className="loader"></span>}
              <ChevronRight size={20} />
           </div>
        </Card>

        <Card className="setting-item logout-item" onClick={() => setShowLogoutConfirm(true)}>
           <div className="setting-label">
             <X size={20} />
             <span>{t('profile.logout', 'Sair do App')}</span>
           </div>
           <ChevronRight size={20} />
        </Card>
      </div>

      {showVerification && (
        <div className="modal-overlay">
          <div className="modal-popup-card">
            <h3>{t('profile.owner_verification')}</h3>
            <p>Para ser dono de uma sala fixa, envie seus documentos:</p>
            <div className="verify-inputs">
              <div className="upload-box">
                <FileText />
                <span>{t('profile.upload_id')}</span>
              </div>
            </div>
            <div className="modal-actions">
               <Button variant="secondary" onClick={() => setShowVerification(false)}>{t('common.cancel')}</Button>
               <Button onClick={handleVerify} disabled={verificationStatus !== 'none'}>{t('common.confirm')}</Button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="modal-overlay">
           <Card className="modal-popup-card">
              <h3>{t('profile.logout_confirm_title', 'Sair do App?')}</h3>
              <p>{t('profile.logout_confirm_msg', 'Você precisará se identificar novamente para acessar suas salas.')}</p>
              <div className="modal-btns">
                <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)}>
                  {t('common.cancel', 'Voltar')}
                </Button>
                <Button variant="danger" onClick={confirmLogout}>
                  {t('common.leave', 'Sair Agora')}
                </Button>
              </div>
           </Card>
        </div>
      )}

      <style>{`
        .settings-container { padding: var(--space-lg); padding-bottom: 100px; background-color: var(--bg-grey); min-height: 100vh; font-family: 'Inter', sans-serif; }
        .settings-header h1 { font-size: 2rem; color: var(--primary-dark); margin-bottom: var(--space-lg); font-weight: 800; }
        .profile-hero { position: relative; margin-bottom: var(--space-xl); }
        .banner-mock { height: 120px; background: linear-gradient(45deg, var(--primary-color), var(--primary-light)); border-radius: var(--radius-lg); }
        .profile-info-row { display: flex; align-items: flex-end; gap: var(--space-md); margin-top: -40px; padding: 0 var(--space-md); }
        .avatar-large { width: 80px; height: 80px; background: white; border: 4px solid var(--bg-grey); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; color: var(--primary-dark); box-shadow: var(--shadow-md); background-size: cover; background-position: center; }
        .text-info h2 { margin: 0; font-size: 1.4rem; font-weight: 700; }
        .welcome-card { margin-top: var(--space-md); font-style: italic; color: var(--text-secondary); text-align: center; border-radius: 20px; }
        .settings-list { display: flex; flex-direction: column; gap: var(--space-md); }
        .setting-item { display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-radius: 20px; }
        .setting-label { display: flex; align-items: center; gap: var(--space-md); font-weight: 600; color: #444; }
        .modal-popup-card { background: white; width: 100%; max-width: 360px; padding: 30px; border-radius: 32px; box-shadow: 0 25px 50px rgba(0,0,0,0.2); text-align: center; }
        .modal-actions, .modal-btns { display: flex; gap: 12px; margin-top: 25px; justify-content: center; }
        .logout-item { margin-top: var(--space-xl); border: 1px solid rgba(255, 126, 103, 0.2); }
        .logout-item .setting-label { color: #FF7E67; }
      `}</style>
    </div>
  );
};
