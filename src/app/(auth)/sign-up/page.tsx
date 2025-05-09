"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from "../../providers/ThemeProvider";
import { useSupabase } from "../../providers/SupabaseProvider";
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../lib/LanguageContext';
import { useTranslation } from '../../../lib/i18n';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { showAuthNotification } from '../../../lib/auth-notifications';

export default function SignUp() {
  const { dark, toggleTheme } = useTheme();
  const { signUp, signIn } = useSupabase();
  const router = useRouter();
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    console.log('Idioma do navegador:', navigator.language);
    console.log('Idioma atual da aplicação:', language);
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setShowConfirmModal(false);
    setConfirmError(null);
    
    try {
      const { error } = await signUp(email, password, name, company);
      
      if (error) {
        showAuthNotification.signUpError(language, error.message);
      } else {
        showAuthNotification.signUpSuccess(language);
        setShowConfirmModal(true);
      }
    } catch (err: any) {
      showAuthNotification.signUpError(language, err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAfterConfirm = async () => {
    setConfirmError(null);
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setConfirmError(t('auth.confirmEmailError'));
      } else {
        router.push('/chat');
      }
    } catch (err: any) {
      setConfirmError(t('auth.confirmEmailError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-auth-gradient relative">
      <div className="w-full h-screen md:h-auto md:max-w-md flex flex-col justify-center md:justify-start md:pt-12 md:pb-12 rounded-none md:rounded-3xl shadow-2xl border border-white/30">
        <div className="flex-1 flex flex-col justify-center px-6">
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-3xl font-semibold text-white text-left">{t('auth.signUp')}</h1>
              <button
                onClick={toggleTheme}
                className="md:hidden p-2 rounded-full bg-white/30 hover:bg-white/50 text-white focus:outline-none"
                aria-label={dark ? t('settings.lightMode') : t('settings.darkMode')}
              >
                {dark ? (
                  <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5 text-yellow-400'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636' />
                    <circle cx='12' cy='12' r='5' fill='currentColor' />
                  </svg>
                ) : (
                  <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5 text-gray-700'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z' />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-white/80 text-left text-base leading-tight w-full mb-4">{t('auth.signUpWithGoogle')}</p>
          </div>
          
          {error && (
            <div className="mx-6 mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
              {error}
            </div>
          )}
          
          <form className="w-full flex flex-col gap-2" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-y-1">
              <label className="text-white/90 text-sm font-medium" htmlFor="name">{t('auth.name')}</label>
              <input
                id="name"
                type="text"
                placeholder={t('auth.namePlaceholder')}
                className="auth-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-y-1">
              <label className="text-white/90 text-sm font-medium" htmlFor="email">{t('auth.email')}</label>
              <input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-y-1">
              <label className="text-white/90 text-sm font-medium" htmlFor="password">{t('auth.password')}</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="auth-input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-black dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-y-1">
              <label className="text-white/90 text-sm font-medium" htmlFor="company">{t('auth.company')}</label>
              <input
                id="company"
                type="text"
                placeholder={t('auth.companyPlaceholder')}
                className="auth-input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('auth.signUp')}
            </button>
          </form>
          
          <a href="/sign-in" className="mt-6 text-white/80 text-sm text-center block underline font-medium hover:text-blue-200">
            {t('auth.haveAccount')} {t('auth.signIn')}
          </a>
        </div>
      </div>
      
      <button
        className="hidden md:block absolute top-4 right-4 bg-white/40 rounded-full p-2 hover:bg-white/60 transition-colors"
        onClick={toggleTheme}
        aria-label={dark ? t('settings.lightMode') : t('settings.darkMode')}
        type="button"
      >
        {dark ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636" />
            <circle cx="12" cy="12" r="5" fill="currentColor" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
          </svg>
        )}
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-auth-gradient bg-opacity-80 rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center border border-white/30 backdrop-blur-md relative">
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
              onClick={() => setShowConfirmModal(false)}
              aria-label={t('common.close')}
              type="button"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold text-white mb-4 drop-shadow">{t('auth.confirmEmailTitle')}</h2>
            <p className="text-white/90 mb-4 text-center drop-shadow">{t('auth.confirmEmailMessage')}</p>
            {confirmError && <div className="mb-2 text-red-300 text-sm text-center">{confirmError}</div>}
            <button
              className="auth-button mt-2"
              onClick={handleContinueAfterConfirm}
              disabled={loading}
            >
              {loading ? t('common.loading') : t('auth.confirmEmailCta')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 