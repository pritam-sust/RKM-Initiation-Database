'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import { BookOpen, Shield, LogOut, LayoutDashboard, UploadCloud, Globe, Menu, X } from 'lucide-react';

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
    <header className="bg-dark text-white border-bottom border-secondary-subtle sticky-top shadow-sm">
      <div className="container py-2">
        <div className="d-flex align-items-center justify-content-between">
          {/* Logo & Title */}
          <Link href="/" className="d-flex align-items-center text-decoration-none text-white gap-2">
            <div className="bg-primary p-2 rounded-3 text-white d-flex align-items-center justify-content-center shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="h5 mb-0 fw-bold tracking-tight text-white">{t('appTitle')}</h1>
              <p className="small mb-0 text-white-50 d-none d-sm-block">{t('appSubTitle')}</p>
            </div>
          </Link>

          {/* Desktop Right Navigation */}
          <div className="d-none d-md-flex align-items-center gap-3">
            {/* Language Switcher Toggle */}
            <div className="btn-group btn-group-sm bg-secondary bg-opacity-25 p-1 rounded-pill border border-secondary" role="group">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 fw-medium transition-all ${
                  language === 'bn' ? 'btn-primary text-white shadow-sm' : 'btn-link text-white-50 text-decoration-none'
                }`}
                onClick={() => setLanguage('bn')}
              >
                বাংলা
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 fw-medium transition-all ${
                  language === 'en' ? 'btn-primary text-white shadow-sm' : 'btn-link text-white-50 text-decoration-none'
                }`}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
            </div>

            {isAdmin ? (
              <div className="d-flex align-items-center gap-2">
                <Link
                  href="/admin/dashboard"
                  className={`btn btn-sm ${
                    pathname === '/admin/dashboard' ? 'btn-light fw-semibold' : 'btn-outline-light'
                  } d-flex align-items-center gap-1.5`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t('adminDashboard')}</span>
                </Link>
                <Link
                  href="/admin/import"
                  className={`btn btn-sm ${
                    pathname === '/admin/import' ? 'btn-light fw-semibold' : 'btn-outline-light'
                  } d-flex align-items-center gap-1.5`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{t('importDocuments')}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-sm btn-danger d-flex align-items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="btn btn-sm btn-outline-light d-flex align-items-center gap-1.5 rounded-pill px-3"
              >
                <Shield className="w-4 h-4 text-warning" />
                <span>{t('adminLogin')}</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="d-md-none d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="d-md-none mt-3 pt-3 border-top border-secondary-subtle">
            <div className="d-flex justify-content-center mb-3">
              <div className="btn-group btn-group-sm bg-secondary bg-opacity-25 p-1 rounded-pill" role="group">
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 ${language === 'bn' ? 'btn-primary' : 'btn-link text-white-50'}`}
                  onClick={() => setLanguage('bn')}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 ${language === 'en' ? 'btn-primary' : 'btn-link text-white-50'}`}
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
                className="btn btn-sm btn-outline-light text-start"
              >
                {t('appTitle')}
              </Link>
              {isAdmin ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-sm btn-outline-light text-start"
                  >
                    {t('adminDashboard')}
                  </Link>
                  <Link
                    href="/admin/import"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-sm btn-outline-light text-start"
                  >
                    {t('importDocuments')}
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="btn btn-sm btn-danger text-start"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-sm btn-warning text-start text-dark fw-bold"
                >
                  {t('adminLogin')}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
