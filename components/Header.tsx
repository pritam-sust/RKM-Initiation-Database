'use client';

import { LayoutDashboard, LogOut, Menu, Shield, UploadCloud, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageProvider';
import RkmLogo from './RkmLogo';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/admin/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(data.authenticated === true);
      })
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    setIsAdmin(false);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="rkm-navbar">
      <div className="container py-2">
        <div className="d-flex align-items-center justify-content-between">
          {/* Authentic RKM Brand Logo & Name */}
          <Link href="/" className="d-flex align-items-center text-decoration-none gap-3 group">
            {/* Sacred Emblem */}
            <RkmLogo size={44} className="transition-transform group-hover-scale" />

            {/* Hierarchical Institutional Branding */}
            <div className="d-flex flex-column justify-content-center">
              {/* Institution Eyebrow */}
              <div
                className="d-flex align-items-center gap-1 fw-bold"
                style={{
                  fontSize: '0.6875rem',
                  color: '#f59e0b',
                  letterSpacing: language === 'bn' ? '0' : '0.06em',
                  textTransform: language === 'bn' ? 'none' : 'uppercase',
                  lineHeight: '1.2',
                }}
              >
                <span>{language === 'bn' ? 'শ্রীরামকৃষ্ণ মঠ ও রামকৃষ্ণ মিশন' : 'Ramakrishna Math & Ramakrishna Mission'}</span>
              </div>

              {/* Primary Application Name */}
              <div className="d-flex align-items-center gap-2 mt-0.5">
                <span
                  className="text-white fw-bold"
                  style={{
                    fontSize: '1.125rem',
                    lineHeight: '1.2',
                    letterSpacing: '0',
                  }}
                >
                  {t('appTitle')}
                </span>
                <span
                  className="d-none d-lg-inline-block px-2 py-0.5 rounded-pill"
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: '600',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#93c5fd',
                    border: '1px solid rgba(147, 197, 253, 0.25)',
                    lineHeight: '1.1',
                  }}
                >
                  {language === 'bn' ? 'ডিজিটাল আর্কাইভ' : 'Digital Archive'}
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Right Navigation */}
          <div className="d-none d-md-flex align-items-center gap-2">
            {/* Language Switcher Toggle */}
            <div className="lang-toggle-container" role="group">
              <button
                type="button"
                className={`lang-btn ${language === 'bn' ? 'active' : ''}`}
                onClick={() => setLanguage('bn')}
              >
                বাংলা
              </button>
              <button
                type="button"
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
            </div>

            {isAdmin ? (
              <div className="d-flex align-items-center gap-2">
                <Link
                  href="/admin/dashboard"
                  className={`nav-link-btn ${pathname === '/admin/dashboard' ? 'active' : ''}`}
                >
                  <LayoutDashboard size={15} />
                  <span>{t('adminDashboard')}</span>
                </Link>
                <Link
                  href="/admin/import"
                  className={`nav-link-btn ${pathname === '/admin/import' ? 'active' : ''}`}
                >
                  <UploadCloud size={15} />
                  <span>{t('importDocuments')}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-link-btn logout border-0"
                >
                  <LogOut size={15} />
                  <span>{t('logout')}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className={`nav-link-btn ${pathname === '/admin/login' ? 'active' : ''}`}
              >
                <Shield size={15} className="text-warning" />
                <span>{t('adminLogin')}</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="d-md-none d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-outline-light rounded-3 p-1.5 border-opacity-25"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="d-md-none mt-3 pt-3 border-top border-white border-opacity-10 animate-fade-in">
            <div className="d-flex justify-content-center mb-3">
              <div className="lang-toggle-container">
                <button
                  type="button"
                  className={`lang-btn ${language === 'bn' ? 'active' : ''}`}
                  onClick={() => setLanguage('bn')}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                  onClick={() => setLanguage('en')}
                >
                  English
                </button>
              </div>
            </div>

            <div className="d-flex flex-column gap-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link-btn text-start w-100 justify-content-start"
              >
                {t('appTitle')}
              </Link>
              {isAdmin ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="nav-link-btn text-start w-100 justify-content-start"
                  >
                    <LayoutDashboard size={15} />
                    <span>{t('adminDashboard')}</span>
                  </Link>
                  <Link
                    href="/admin/import"
                    onClick={() => setMobileMenuOpen(false)}
                    className="nav-link-btn text-start w-100 justify-content-start"
                  >
                    <UploadCloud size={15} />
                    <span>{t('importDocuments')}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="nav-link-btn logout text-start w-100 justify-content-start mt-1"
                  >
                    <LogOut size={15} />
                    <span>{t('logout')}</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="nav-link-btn text-start w-100 justify-content-start mt-1"
                >
                  <Shield size={15} className="text-warning" />
                  <span>{t('adminLogin')}</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
