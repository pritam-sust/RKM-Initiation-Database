'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { AlertCircle, Key, LogIn, Shield, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('loginError'));
        setIsLoading(false);
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('An error occurred during login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center flex-grow-1">
      <div className="rkm-card w-100 overflow-hidden" style={{ maxWidth: '420px' }}>
        <div className="p-4 text-center border-bottom bg-slate-50">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2.5"
            style={{ width: '3.25rem', height: '3.25rem', background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', color: '#ffffff', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)' }}
          >
            <Shield size={24} />
          </div>
          <h3 className="h5 fw-bold text-dark mb-0.5">{t('loginTitle')}</h3>
          <p className="extra-small text-muted mb-0" style={{ fontSize: '0.8rem' }}>Authorized Access Only</p>
        </div>

        <div className="p-4 bg-white">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2 px-3 rounded-3 small">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label-custom">{t('username')}</label>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control-custom ps-4"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <User size={15} className="position-absolute text-muted" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label-custom">{t('password')}</label>
              <div className="position-relative">
                <input
                  type="password"
                  className="form-control-custom ps-4"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Key size={15} className="position-absolute text-muted" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn-rkm-primary w-100 py-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>{t('loginBtn')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
