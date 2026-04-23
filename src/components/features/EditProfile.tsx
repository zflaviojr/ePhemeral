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
          color: var(--text-primary);
          background: white;
          position: sticky;
          top: 0;
          border-bottom: 1px solid var(--border-color);
        }
        .rounded-header { border-bottom-left-radius: 35px; border-bottom-right-radius: 35px; margin: 0 4px; }
        .shadow-glow { box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        
        .back-btn { background: none; border: none; cursor: pointer; color: var(--text-primary); display: flex; align-items: center; padding: 8px; border-radius: 50%; }
        
        .header-title-wrapper { flex: 1; text-align: center; }
        .edit-header h2 { font-size: 1.1rem; margin: 0; font-weight: 600; }

        .edit-content { padding: 25px 20px; }
        
        .image-edit { position: relative; margin-bottom: 60px; }
        .banner-edit {
          height: 150px;
          background-color: var(--primary-light);
          background-size: cover;
          background-position: center;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
        }
        .avatar-edit {
          width: 100px;
          height: 100px;
          background-color: white;
          background-size: cover;
          background-position: center;
          border-radius: 50%;
          border: 4px solid var(--bg-grey);
          position: absolute;
          bottom: -50px;
          left: 20px;
          z-index: 5;
        }
        
        .edit-img-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.25);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1; /* Always visible as requested */
          cursor: pointer;
          border-radius: inherit;
        }
        
        .form-card { display: flex; flex-direction: column; gap: 20px; margin-top: 20px; }
        .form-group { display: flex; flex-direction: column; gap: var(--space-xs); }
        .form-group label { font-size: 0.9rem; color: var(--text-secondary); font-weight: 500; }
        
        .input-base { border: 1px solid var(--border-color); padding: 12px; border-radius: var(--radius-md); outline: none; font-size: 1rem; }
        textarea.input-base { min-height: 100px; resize: none; }
      `}</style>
    </div>
  );
};
