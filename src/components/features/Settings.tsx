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
        <div className="banner-mock shadow-sm" style={{ backgroundImage: `url(${user?.banner})`, backgroundSize: 'cover' }}></div>
        <div className="profile-info-row">
          <div className="avatar-large" style={{ backgroundImage: `url(${user?.avatar})`, backgroundSize: 'cover' }}>
            {!user?.avatar && user?.name?.[0]}
          </div>
          <div className="text-info">
             <h2>{user?.name}</h2>
             <p>{user?.phone}</p>
          </div>
        </div>
        <Card className="welcome-card glass-panel">
           <p>"{user?.welcomeMessage || 'Bem-vindo ao meu perfil!'}"</p>
        </Card>
      </section>

      <div className="settings-list">
        <Card className="setting-item" onClick={() => onViewChange('edit-profile')}>
           <div className="setting-label">
             <User size={20} className="icon-primary" />
             <span>{t('profile.edit_profile')}</span>
           </div>
           <ChevronRight size={20} className="chevron-muted" />
        </Card>

        <Card className="setting-item" onClick={toggleDarkMode}>
           <div className="setting-label">
             {isDarkMode ? <Sun size={20} className="icon-primary" /> : <Moon size={20} className="icon-primary" />}
             <span>{t('profile.dark_mode')}</span>
           </div>
           <div className={`tab-switch ${isDarkMode ? 'active' : ''}`}>
              <div className="switch-knob"></div>
           </div>
        </Card>

        <Card className="setting-item" onClick={() => setShowVerification(true)}>
           <div className="setting-label">
             <Shield size={20} className="icon-primary" />
             <span>{t('profile.owner_verification')}</span>
           </div>
           <div className={`status-container ${verificationStatus}`}>
              {verificationStatus === 'verified' && <CheckCircle size={20} className="icon-success" />}
              {verificationStatus === 'pending' && <span className="mini-loader"></span>}
              <ChevronRight size={20} className="chevron-muted" />
           </div>
        </Card>

        <Card className="setting-item logout-item" onClick={() => setShowLogoutConfirm(true)}>
           <div className="setting-label danger-text">
             <X size={20} />
             <span>{t('profile.logout', 'Sair do App')}</span>
           </div>
           <ChevronRight size={20} className="danger-text" />
        </Card>
      </div>

      {showVerification && (
        <div className="modal-overlay">
          <Card className="modal-popup-card">
            <h3>{t('profile.owner_verification')}</h3>
            <p className="modal-desc">Envie seus documentos para verificar sua propriedade.</p>
            <div className="verify-inputs">
              <div className="upload-box glass-panel">
                <FileText className="icon-primary" />
                <span className="label-standard">{t('profile.upload_id')}</span>
              </div>
            </div>
            <div className="modal-actions">
               <Button variant="secondary" onClick={() => setShowVerification(false)}>{t('common.cancel')}</Button>
               <Button onClick={handleVerify} disabled={verificationStatus !== 'none'}>{t('common.confirm')}</Button>
            </div>
          </Card>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="modal-overlay">
           <Card className="modal-popup-card">
              <h3>{t('profile.logout_confirm_title')}</h3>
              <p className="modal-desc">{t('profile.logout_confirm_msg')}</p>
              <div className="modal-btns">
                <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant="danger" onClick={confirmLogout}>
                  {t('common.leave')}
                </Button>
              </div>
           </Card>
        </div>
      )}

      <style>{`
        .settings-container { padding: var(--space-lg) var(--space-md) 100px; min-height: 100vh; background-color: var(--bg-grey); }
        .settings-header h1 { font-size: 1.8rem; color: var(--text-main); margin-bottom: var(--space-lg); font-weight: 800; padding: 0 5px; }
        
        .profile-hero { margin-bottom: var(--space-xl); }
        .banner-mock { height: 130px; background: linear-gradient(45deg, var(--primary-color), var(--primary-dark)); border-radius: 25px; }
        .profile-info-row { display: flex; align-items: flex-end; gap: var(--space-md); margin-top: -45px; padding: 0 20px; }
        .avatar-large { width: 90px; height: 90px; background: white; border: 4px solid var(--bg-grey); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 800; color: var(--primary-color); box-shadow: var(--shadow-md); background-size: cover; background-position: center; }
        .text-info h2 { margin: 0; font-size: 1.3rem; font-weight: 800; color: var(--text-main); }
        .text-info p { margin: 2px 0 0; color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; }
        .welcome-card { margin-top: 15px; border-radius: 20px; padding: 15px; }
        .welcome-card p { margin: 0; font-size: 0.9rem; font-style: italic; color: var(--text-secondary); line-height: 1.4; }

        .settings-list { display: flex; flex-direction: column; gap: 12px; }
        .setting-item { display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-radius: 20px; padding: 18px 20px; border: 1px solid rgba(0,0,0,0.02); transition: transform 0.2s; }
        .setting-item:active { transform: scale(0.98); }
        
        .setting-label { display: flex; align-items: center; gap: 14px; font-weight: 600; color: var(--text-main); font-size: 1rem; }
        .icon-primary { color: var(--primary-color); }
        .chevron-muted { color: var(--text-secondary); opacity: 0.5; }
        .danger-text { color: #FF7E67 !important; }
        
        .tab-switch { width: 44px; height: 24px; background: #E0E0E0; border-radius: 12px; position: relative; transition: background 0.3s; }
        .tab-switch.active { background: var(--primary-color); }
        .switch-knob { width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.3s; }
        .tab-switch.active .switch-knob { transform: translateX(20px); }

        .modal-popup-card { text-align: center; max-width: 340px; }
        .modal-popup-card h3 { font-weight: 800; color: var(--text-main); margin-bottom: 10px; }
        .modal-desc { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.5; }
        .upload-box { height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; border-radius: 20px; border: 2px dashed var(--border-color); cursor: pointer; }
        .label-standard { font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
        
        .logout-item { border: 1px solid rgba(255, 126, 103, 0.1); }
      `}</style>
    </div>
  );
};
