'use client';

import { useLanguage } from './LanguageProvider';

export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="mt-auto py-4 bg-white border-top border-slate-200">
      <div className="container text-center">
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-2.5">
          <span className="chip-tag chip-orange">{t('renunciation')}</span>
          <span className="chip-tag chip-blue">{t('jnana')}</span>
          <span className="chip-tag chip-green">{t('karma')}</span>
          <span className="chip-tag chip-maroon">{t('bhakti')}</span>
        </div>
        <p className="small mb-0.5 text-secondary" style={{ fontSize: '0.8125rem' }}>
          © {new Date().getFullYear()} {t('appTitle')}. {language === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
        </p>
        <p className="extra-small text-muted mb-0" style={{ fontSize: '0.75rem' }}>
          {t('appSubTitle')}
        </p>
      </div>
    </footer>
  );
}
