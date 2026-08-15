'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { Shield, Key, User, AlertCircle, LogIn } from 'lucide-react';

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
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden w-100" style={{ maxWidth: '450px' }}>
        <div className="card-header bg-dark text-white p-4 text-center border-0">
          <div className="bg-primary bg-opacity-20 text-primary rounded-circle w-16 h-16 d-flex align-items-center justify-content-center mx-auto mb-3">
            <Shield className="w-8 h-8 text-warning" />
          </div>
          <h3 className="h4 fw-bold text-white mb-1">{t('loginTitle')}</h3>
          <p className="small text-white-50 mb-0">Authorized Administration Access Only</p>
        </div>

        <div className="card-body p-4 p-md-5">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 rounded-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark">{t('username')}</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-secondary">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  className="form-control form-control-lg bg-light border-start-0"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-dark">{t('password')}</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-secondary">
                  <Key className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  className="form-control form-control-lg bg-light border-start-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 rounded-pill font-semibold shadow-sm d-flex align-items-center justify-content-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>{t('loginBtn')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="card-footer bg-light p-3 text-center border-0">
          <span className="extra-small text-muted">
            Default credentials: <code className="text-dark">admin</code> / <code className="text-dark">admin123</code>
          </span>
        </div>
      </div>
    </div>
  );
}
