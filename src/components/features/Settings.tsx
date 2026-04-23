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
      <header className="settings-header glass-panel rounded-header shadow-glow">
        <h1 className="title-main-color">{t('profile.settings')}</h1>
      </header>

      <section className="profile-hero">
        <div className="banner-mock shadow-sm" style={{ backgroundImage: `url(${user?.banner})`, backgroundSize: 'cover' }}></div>
        <div className="profile-info-row">
          <div className="avatar-large" style={{ backgroundImage: `url(${user?.avatar})`, backgroundSize: 'cover' }}>
            {!user?.avatar && user?.name?.[0]}
          </div>
          <div className="text-info">
             <h2 className="title-main-color">{user?.name}</h2>
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
             <User size={20} className="icon-main-color" />
             <span className="text-main-color">{t('profile.edit_profile')}</span>
           </div>
           <ChevronRight size={20} className="chevron-muted" />
        </Card>

        <Card className="setting-item" onClick={toggleDarkMode}>
           <div className="setting-label">
             {isDarkMode ? <Sun size={20} className="icon-main-color" /> : <Moon size={20} className="icon-main-color" />}
             <span className="text-main-color">{t('profile.dark_mode')}</span>
           </div>
           <div className={`tab-switch ${isDarkMode ? 'active' : ''}`}>
              <div className="switch-knob"></div>
           </div>
        </Card>

        <Card className="setting-item" onClick={() => setShowVerification(true)}>
           <div className="setting-label">
             <Shield size={20} className="icon-main-color" />
             <span className="text-main-color">{t('profile.owner_verification')}</span>
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
           <ChevronRight size={18} className="danger-text" />
        </Card>
      </div>

      {showVerification && (
        <div className="modal-overlay">
          <Card className="modal-popup-card">
            <h3 className="title-main-color">{t('profile.owner_verification')}</h3>
            <p className="modal-desc">Envie seus documentos para verificar sua propriedade.</p>
            <div className="verify-inputs">
              <div className="upload-box glass-panel">
                <FileText className="icon-main-color" />
                <span className="label-standard text-main-color">{t('profile.upload_id')}</span>
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
              <h3 className="title-main-color">{t('profile.logout_confirm_title')}</h3>
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
        .settings-container { padding: 0 0 100px; min-height: 100vh; background-color: var(--bg-grey); font-family: 'Inter', sans-serif; }
        .settings-header { padding: 25px 20px; margin-bottom: 20px; text-align: center; }
        .settings-header h1 { font-size: 1.5rem; margin: 0; font-weight: 800; }
        
        .rounded-header { border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; margin: 0 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .title-main-color { color: var(--primary-dark); }
        .icon-main-color { color: var(--primary-dark); }
        .text-main-color { color: var(--primary-dark); font-weight: 700; opacity: 0.8; }

        .profile-hero { margin-bottom: var(--space-xl); padding: 0 20px; }
        .banner-mock { height: 130px; background: linear-gradient(45deg, var(--primary-color), var(--primary-dark)); border-radius: 25px; }
        .profile-info-row { display: flex; align-items: flex-end; gap: var(--space-md); margin-top: -45px; padding: 0 15px; }
        .avatar-large { width: 90px; height: 90px; background: white; border: 4px solid var(--bg-grey); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 800; color: var(--primary-dark); box-shadow: var(--shadow-md); background-size: cover; background-position: center; }
        .text-info h2 { margin: 0; font-size: 1.3rem; font-weight: 800; }
        .text-info p { margin: 2px 0 0; color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; }
        .welcome-card { margin-top: 15px; border-radius: 20px; padding: 15px; }
        .welcome-card p { margin: 0; font-size: 0.9rem; font-style: italic; color: var(--text-secondary); line-height: 1.4; }

        .settings-list { display: flex; flex-direction: column; gap: 12px; padding: 0 20px; }
        .setting-item { display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-radius: 24px; padding: 18px 20px; transition: transform 0.2s; }
        .setting-label { display: flex; align-items: center; gap: 14px; }
        
        .chevron-muted { color: var(--text-secondary); opacity: 0.5; }
        .danger-text { color: #FF7E67 !important; font-weight: 700; }
        
        .tab-switch { width: 44px; height: 24px; background: #E0E0E0; border-radius: 12px; position: relative; transition: background 0.3s; }
        .tab-switch.active { background: var(--primary-color); }
        .switch-knob { width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.3s; }
        .tab-switch.active .switch-knob { transform: translateX(20px); }

        .modal-popup-card { text-align: center; max-width: 340px; border-radius: 32px; padding: 30px; }
        .modal-desc { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.5; }
        .upload-box { height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; border-radius: 20px; border: 2px dashed var(--border-color); cursor: pointer; }
        
        .logout-item { border: 1px solid rgba(255, 126, 103, 0.1); }
        .modal-actions, .modal-btns { display: flex; gap: 12px; margin-top: 25px; justify-content: center; }
      `}</style>
    </div>
  );
};
