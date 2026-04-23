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
      <header className="edit-header rounded-header shadow-glow">
        <button className="back-btn" onClick={() => onViewChange('settings')}>
          <ArrowLeft size={22} />
        </button>
        <div className="header-title-wrapper">
          <h2>{t('profile.edit_profile')}</h2>
        </div>
        <div style={{ width: 40 }}></div>
      </header>

      <div className="edit-content">
        <section className="image-edit">
          <div className="banner-edit" style={{ backgroundImage: `url(${formData.banner})` }}>
            <input type="file" id="edit-banner" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
            <button className="edit-img-overlay" onClick={() => document.getElementById('edit-banner')?.click()}>
              <Camera size={26} />
            </button>
          </div>
          <div className="avatar-edit" style={{ backgroundImage: `url(${formData.avatar})` }}>
            <input type="file" id="edit-avatar" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
            <button className="edit-img-overlay" onClick={() => document.getElementById('edit-avatar')?.click()}>
              <Camera size={24} />
            </button>
          </div>
        </section>

        <Card className="form-card">
          <div className="form-group">
            <label className="label-pattern">{t('auth.name')}</label>
            <input 
              className="input-base"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="label-pattern">{t('auth.welcome_msg')}</label>
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
        .edit-profile-container {
          min-height: 100vh;
          background: var(--bg-grey);
          font-family: 'Inter', sans-serif;
        }
        .edit-header {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          gap: 15px;
          z-index: 100;
          color: var(--text-main);
          background: white;
          position: sticky;
          top: 0;
          border-bottom: 1px solid var(--border-color);
        }
        .rounded-header { border-bottom-left-radius: 35px; border-bottom-right-radius: 35px; margin: 0 4px; }
        .shadow-glow { box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        
        .back-btn { background: none; border: none; cursor: pointer; color: var(--text-main); display: flex; align-items: center; padding: 8px; border-radius: 50%; transition: background 0.2s; }
        .back-btn:hover { background: rgba(0,0,0,0.05); }
        
        .header-title-wrapper { flex: 1; text-align: center; }
        .edit-header h2 { font-size: 1.1rem; margin: 0; font-weight: 800; color: var(--text-main); }

        .edit-content { padding: 25px 20px; }
        
        .image-edit { position: relative; margin-bottom: 60px; }
        .banner-edit { height: 160px; background-color: var(--primary-light); background-size: cover; background-position: center; border-radius: 25px; position: relative; overflow: hidden; }
        .avatar-edit { width: 110px; height: 110px; background-color: white; background-size: cover; background-position: center; border-radius: 50%; border: 5px solid var(--bg-grey); position: absolute; bottom: -55px; left: 20px; z-index: 5; box-shadow: var(--shadow-md); }
        
        .edit-img-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); border: none; color: white; display: flex; align-items: center; justify-content: center; opacity: 1; cursor: pointer; border-radius: inherit; transition: background 0.3s; }
        .edit-img-overlay:hover { background: rgba(0,0,0,0.5); }
        
        .form-card { display: flex; flex-direction: column; gap: 20px; margin-top: 20px; border-radius: 30px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .label-pattern { font-size: 0.9rem; color: var(--text-main); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 5px; opacity: 0.9; }
        
        .input-base { border: 1px solid var(--border-color); padding: 14px; border-radius: 15px; outline: none; font-size: 1rem; color: var(--text-main); background: white; transition: border-color 0.2s; }
        .input-base:focus { border-color: var(--primary-color); }
        textarea.input-base { min-height: 120px; resize: none; }
      `}</style>
    </div>
  );
};
