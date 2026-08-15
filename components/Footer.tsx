'use client';

import React from 'react';
import { useLanguage } from './LanguageProvider';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-dark text-white-50 py-4 mt-auto border-top border-secondary-subtle">
      <div className="container text-center">
        <p className="small mb-1 text-white-50">
          © {new Date().getFullYear()} {t('appTitle')}. All rights reserved.
        </p>
        <p className="extra-small text-secondary mb-0">
          Built with Next.js, PostgreSQL & Bootstrap 5.3 | Supporting Bengali & English Unicode
        </p>
      </div>
    </footer>
  );
}
