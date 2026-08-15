'use client';

import React from 'react';
import { useLanguage } from './LanguageProvider';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto py-4 bg-white border-top border-slate-200">
      <div className="container text-center">
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-2">
          <span className="chip-tag chip-orange">Renunciation</span>
          <span className="chip-tag chip-blue">Jnana</span>
          <span className="chip-tag chip-green">Karma</span>
          <span className="chip-tag chip-maroon">Bhakti</span>
        </div>
        <p className="small mb-0.5 text-secondary" style={{ fontSize: '0.8125rem' }}>
          © {new Date().getFullYear()} {t('appTitle')}. All rights reserved.
        </p>
        <p className="extra-small text-muted mb-0" style={{ fontSize: '0.75rem' }}>
          Ramakrishna Math & Ramakrishna Mission Initiation Database
        </p>
      </div>
    </footer>
  );
}
