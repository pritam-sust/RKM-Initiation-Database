'use client';

import { LayoutDashboard, Plus, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../LanguageProvider';

interface AdminNavbarProps {
  onAddPerson?: () => void;
}

export default function AdminNavbar({ onAddPerson }: AdminNavbarProps) {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <div className="bg-white border-bottom shadow-sm mb-4">
      <div className="container py-2.5 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-1 p-1 bg-light rounded-pill border border-slate-200">
          <Link
            href="/admin/dashboard"
            className={`btn btn-sm rounded-pill d-flex align-items-center gap-1 px-3.5 py-1.5 fw-semibold transition-all ${
              pathname === '/admin/dashboard'
                ? 'bg-white text-dark shadow-sm border border-slate-200'
                : 'btn-link text-secondary text-decoration-none hover-text-dark border-0'
            }`}
          >
            <LayoutDashboard size={15} className={pathname === '/admin/dashboard' ? 'text-primary' : ''} />
            <span>{t('adminDashboard')}</span>
          </Link>
          <Link
            href="/admin/import"
            className={`btn btn-sm rounded-pill d-flex align-items-center gap-1 px-3.5 py-1.5 fw-semibold transition-all ${
              pathname === '/admin/import'
                ? 'bg-white text-dark shadow-sm border border-slate-200'
                : 'btn-link text-secondary text-decoration-none hover-text-dark border-0'
            }`}
          >
            <UploadCloud size={15} className={pathname === '/admin/import' ? 'text-success' : ''} />
            <span>{t('importDocuments')}</span>
          </Link>
        </div>

        {onAddPerson && (
          <button
            type="button"
            className="btn-rkm-primary btn-sm px-3.5 py-1.5"
            onClick={onAddPerson}
          >
            <Plus size={16} />
            <span>{t('addNewPerson')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
