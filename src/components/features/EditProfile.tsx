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
      <header className="edit-header">
        <button className="back-btn" onClick={() => onViewChange('settings')}>
          <ArrowLeft size={22} />
        </button>
        <h2>{t('profile.edit_profile')}</h2>
        <div style={{ width: 40 }}></div>
      </header>

      <div className="edit-content">
        <section className="image-edit">
          <div className="banner-edit" style={{ backgroundImage: `url(${formData.banner})` }}>
            <input type="file" id="edit-banner" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
            <button className="edit-img-overlay" onClick={() => document.getElementById('edit-banner')?.click()}>
              <Camera />
            </button>
          </div>
          <div className="avatar-edit" style={{ backgroundImage: `url(${formData.avatar})` }}>
            <input type="file" id="edit-avatar" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
            <button className="edit-img-overlay" onClick={() => document.getElementById('edit-avatar')?.click()}>
              <Camera />
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
        }
        .edit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md);
          background: var(--bg-white);
          position: sticky;
          top: 0;
          z-index: 10;
          border-bottom: 1px solid var(--border-color);
        }
        .back-btn { background: none; border: none; cursor: pointer; color: var(--text-primary); display: flex; align-items: center; }
        .edit-header h2 { font-size: 1.1rem; margin: 0; }
        .edit-content { padding: var(--space-md); }
        
        .image-edit { position: relative; margin-bottom: 60px; }
        .banner-edit {
          height: 150px;
          background-color: var(--primary-light);
          background-size: cover;
          background-position: center;
          border-radius: var(--radius-lg);
          position: relative;
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
        }
        .edit-img-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.3);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
          cursor: pointer;
          border-radius: inherit;
        }
        .banner-edit:hover .edit-img-overlay, .avatar-edit:hover .edit-img-overlay { opacity: 1; }
        
        .form-card { display: flex; flex-direction: column; gap: var(--space-md); }
        .form-group { display: flex; flex-direction: column; gap: var(--space-xs); }
        .form-group label { font-size: 0.9rem; color: var(--text-secondary); font-weight: 500; }
        textarea.input-base { min-height: 100px; resize: none; border: 1px solid var(--border-color); padding: 12px; border-radius: var(--radius-md); outline: none; }
        .input-base { border: 1px solid var(--border-color); padding: 12px; border-radius: var(--radius-md); outline: none; }
      `}</style>
    </div>
  );
};
