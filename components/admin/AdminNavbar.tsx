'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../LanguageProvider';
import { LayoutDashboard, UploadCloud, PlusCircle } from 'lucide-react';

interface AdminNavbarProps {
  onAddPerson?: () => void;
}

export default function AdminNavbar({ onAddPerson }: AdminNavbarProps) {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <div className="bg-body border-bottom shadow-sm mb-4">
      <div className="container py-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <ul className="nav nav-pills gap-1">
          <li className="nav-item">
            <Link
              href="/admin/dashboard"
              className={`nav-link rounded-pill d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold ${
                pathname === '/admin/dashboard' ? 'active bg-primary text-white' : 'text-dark'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('adminDashboard')}</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              href="/admin/import"
              className={`nav-link rounded-pill d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold ${
                pathname === '/admin/import' ? 'active bg-primary text-white' : 'text-dark'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>{t('importDocuments')}</span>
            </Link>
          </li>
        </ul>

        {onAddPerson && (
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5 shadow-sm"
            onClick={onAddPerson}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addNewPerson')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
