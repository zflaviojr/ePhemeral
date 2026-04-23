import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEphemeralStore } from '../../hooks/useEphemeralStore';
import { Button, Card } from '../base/Base';
import { ArrowLeft, Camera } from 'lucide-react';

interface EditProfileProps {
  onViewChange: (view: 'settings') => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ onViewChange }) => {
  const { t } = useTranslation();
  const { user, updateUser } = useEphemeralStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    welcomeMessage: user?.welcomeMessage || '',
    avatar: user?.avatar || '',
    banner: user?.banner || ''
  });

  const handleSave = () => {
    updateUser(formData);
    onViewChange('settings');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({...formData, [field]: reader.result as string});
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="edit-profile-container">
      <header className="edit-header glass-panel rounded-header shadow-glow">
        <button className="header-btn" onClick={() => onViewChange('settings')}>
          <ArrowLeft size={22} />
        </button>
        <div className="header-title-wrapper">
          <h2>{t('profile.edit_profile')}</h2>
        </div>
        <div style={{ width: 40 }}></div> {/* Spacer to center title if needed or balance layout */}
      </header>

      <div className="edit-content">
        <section className="image-edit">
          <div className="banner-edit" style={{ backgroundImage: `url(${formData.banner})` }}>
            <input type="file" id="edit-banner" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
            <button className="edit-img-overlay" onClick={() => document.getElementById('edit-banner')?.click()}>
              <Camera />
            </button>
          </div>
          <div className="avatar-edit shadow-glow" style={{ backgroundImage: `url(${formData.avatar})` }}>
            <input type="file" id="edit-avatar" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
            <button className="edit-img-overlay" onClick={() => document.getElementById('edit-avatar')?.click()}>
              <Camera />
            </button>
          </div>
        </section>

        <Card className="form-card glass-panel">
          <div className="form-group">
            <label>{t('auth.name')}</label>
            <input 
              className="input-base"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>{t('auth.welcome_msg')}</label>
            <textarea 
              className="input-base"
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({...formData, welcomeMessage: e.target.value})}
            />
          </div>
          <Button onClick={handleSave} fluid>{t('common.save')}</Button>
        </Card>
      </div>

      <style>{`
        .edit-profile-container { min-height: 100vh; background: var(--bg-chat); font-family: 'Inter', sans-serif; }
        .edit-header { display: flex; align-items: center; padding: 15px 20px; gap: 15px; z-index: 100; color: white; background: rgba(138, 136, 251, 0.4); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.1); }
        .rounded-header { border-bottom-left-radius: 35px; border-bottom-right-radius: 35px; margin: 0 4px; }
        .shadow-glow { box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
        .header-btn { background: none; border: none; color: white; cursor: pointer; display: flex; align-items: center; padding: 8px; border-radius: 50%; transition: background 0.2s; }
        
        .header-title-wrapper { flex: 1; text-align: center; }
        .header-title-wrapper h2 { margin: 0; font-size: 1.1rem; font-weight: 800; }

        .edit-content { padding: 25px 20px; }
        
        .image-edit { position: relative; margin-bottom: 70px; }
        .banner-edit { height: 160px; background-color: rgba(255,255,255,0.1); background-size: cover; background-position: center; border-radius: 25px; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
        .avatar-edit { width: 110px; height: 110px; background-color: white; background-size: cover; background-position: center; border-radius: 50%; border: 5px solid var(--bg-chat); position: absolute; bottom: -55px; left: 20px; z-index: 5; }
        
        .edit-img-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); border: none; color: white; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; cursor: pointer; border-radius: inherit; }
        .banner-edit:hover .edit-img-overlay, .avatar-edit:hover .edit-img-overlay { opacity: 1; }
        
        .form-card { gap: 20px; padding: 25px; border-radius: 30px; margin-top: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 0.85rem; color: rgba(255,255,255,0.7); font-weight: 700; margin-left: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
        .input-base { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 12px 18px; border-radius: 15px; outline: none; font-size: 1rem; transition: border-color 0.2s; }
        .input-base:focus { border-color: var(--primary-color); }
        textarea.input-base { min-height: 100px; resize: none; }
      `}</style>
    </div>
  );
};
