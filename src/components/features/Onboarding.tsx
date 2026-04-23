import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEphemeralStore } from '../../hooks/useEphemeralStore';
import { Button, Card } from '../base/Base';
import { Camera, Image as ImageIcon, Check } from 'lucide-react';

interface OnboardingProps {
  onViewChange: (view: 'discovery') => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onViewChange }) => {
  const { t } = useTranslation();
  const setUser = useEphemeralStore((state) => state.setUser);
  const [step, setStep] = useState<'phone' | 'profile'>('phone');
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    welcomeMessage: '',
    avatar: '',
    banner: ''
  });

  const handleIdentify = () => {
    if (formData.phone.length > 5) {
      setStep('profile');
    }
  };

  const handleFinish = () => {
    if (formData.name) {
      setUser({
        id: Math.random().toString(36).substr(2, 9),
        ...formData
      });
      onViewChange('discovery');
    }
  };

  return (
    <div className="onboarding-container">
      <div className="brand-section">
        <h1>{t('common.app_name')}</h1>
        <p className="subtitle">{t('auth.subtitle')}</p>
      </div>

      <Card className="onboarding-card glass-panel shadow-glow">
        {step === 'phone' ? (
          <div className="step-content">
            <h2>{t('auth.welcome')}</h2>
            <p>{t('auth.identify_desc', 'Identifique-se para começar:')}</p>
            <input 
              className="input-base"
              type="tel" 
              placeholder={t('auth.phone_placeholder')}
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <Button onClick={handleIdentify} variant="primary" fluid>{t('auth.identify')}</Button>
          </div>
        ) : (
          <div className="step-content">
            <h2>{t('auth.creating_profile')}</h2>
            
            <div className="form-group">
              <label>{t('auth.name')}</label>
              <input 
                className="input-base"
                type="text" 
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>{t('auth.welcome_msg')}</label>
              <textarea 
                className="input-base"
                placeholder="Uma frase para seu perfil"
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({...formData, welcomeMessage: e.target.value})}
              />
            </div>

            <div className="profile-uploads-grid">
               <div className="upload-item">
                 <input 
                   type="file" 
                   id="avatar-input" 
                   hidden 
                   accept="image/*" 
                   onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) {
                       const reader = new FileReader();
                       reader.onloadend = () => setFormData({...formData, avatar: reader.result as string});
                       reader.readAsDataURL(file);
                     }
                   }}
                 />
                 <button 
                   className={`upload-circle-btn ${formData.avatar ? 'success' : 'primary'}`}
                   onClick={() => document.getElementById('avatar-input')?.click()}
                 >
                   {formData.avatar ? <Check size={24} /> : <Camera size={24} />}
                   <span>{t('auth.upload_avatar', 'Foto')}</span>
                 </button>
               </div>
               <div className="upload-item">
                 <input 
                   type="file" 
                   id="banner-input" 
                   hidden 
                   accept="image/*" 
                   onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) {
                       const reader = new FileReader();
                       reader.onloadend = () => setFormData({...formData, banner: reader.result as string});
                       reader.readAsDataURL(file);
                     }
                   }}
                 />
                 <button 
                   className={`upload-banner-btn ${formData.banner ? 'success' : 'secondary'}`}
                   onClick={() => document.getElementById('banner-input')?.click()}
                 >
                   {formData.banner ? <Check size={20} /> : <ImageIcon size={20} />}
                   <span>{t('auth.upload_banner', 'Banner')}</span>
                 </button>
               </div>
            </div>

            <Button onClick={handleFinish} variant="primary" fluid>{t('auth.finish')}</Button>
          </div>
        )}
      </Card>
      
      <style>{`
        .onboarding-container { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--space-lg); background: linear-gradient(135deg, var(--primary-light) 0%, var(--bg-grey) 100%); font-family: 'Inter', sans-serif; }
        .brand-section { text-align: center; margin-bottom: var(--space-xl); }
        .brand-section h1 { color: var(--primary-dark); font-size: 3.5rem; margin: 0; font-weight: 900; letter-spacing: -2px; }
        .subtitle { color: var(--primary-color); font-weight: 600; font-size: 1.1rem; }
        
        .onboarding-card { width: 100%; max-width: 400px; padding: 30px; border-radius: 32px; animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .shadow-glow { box-shadow: 0 20px 60px rgba(138, 136, 251, 0.2); }
        
        .step-content { display: flex; flex-direction: column; gap: 20px; }
        .step-content h2 { margin: 0; color: var(--primary-dark); font-size: 1.5rem; font-weight: 800; }
        .step-content p { color: var(--text-secondary); font-size: 0.9rem; margin-top: -10px; }

        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 0.85rem; font-weight: 700; color: var(--primary-dark); margin-left: 4px; }
        
        .profile-uploads-grid { display: flex; gap: 15px; align-items: center; margin: 10px 0; }
        .upload-item { flex: 1; display: flex; flex-direction: column; align-items: center; }
        
        .upload-circle-btn, .upload-banner-btn { border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; transition: all 0.3s; width: 100%; border-radius: 20px; padding: 15px; font-weight: 700; font-size: 0.8rem; }
        
        .upload-circle-btn.primary { background: var(--primary-color); color: white; }
        .upload-banner-btn.secondary { background: var(--primary-light); color: var(--primary-dark); }
        .success { background: #4CAF50 !important; color: white !important; }
        
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
