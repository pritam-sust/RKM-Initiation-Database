'use client';

import AdminNavbar from '@/components/admin/AdminNavbar';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import PersonFormModal from '@/components/admin/PersonFormModal';
import { useLanguage } from '@/components/LanguageProvider';
import PersonDetailModal from '@/components/PersonDetailModal';
import { PersonRecord } from '@/types';
import { ChevronLeft, ChevronRight, Edit2, Eye, Plus, Search, Trash2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [persons, setPersons] = useState<PersonRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<PersonRecord | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<PersonRecord | null>(null);
  const [selectedForDetail, setSelectedForDetail] = useState<PersonRecord | null>(null);

  const checkAuthAndFetch = useCallback(async () => {
    try {
      const authRes = await fetch('/api/admin/auth/me');
      if (!authRes.ok) {
        router.push('/admin/login');
        return;
      }

      setIsLoading(true);
      const res = await fetch(`/api/admin/persons?q=${encodeURIComponent(query)}&page=${page}&limit=10`);
      const data = await res.json();
      if (res.ok) {
        setPersons(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      console.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  }, [query, page, router]);

  useEffect(() => {
    checkAuthAndFetch();
  }, [checkAuthAndFetch]);

  const handleOpenAdd = () => {
    setSelectedForEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (person: PersonRecord) => {
    setSelectedForEdit(person);
    setIsFormOpen(true);
  };

  return (
    <div className="min-vh-100 bg-light">
      <AdminNavbar onAddPerson={handleOpenAdd} />

      <div className="container pb-5">
        {/* Top Summary Banner */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="small text-white-50 text-uppercase fw-semibold tracking-wider d-block mb-1">
                    {t('totalRecords')}
                  </span>
                  <h3 className="display-6 fw-bold mb-0 text-white">{total}</h3>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-circle text-white">
                  <Users className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-body h-100 d-flex flex-column justify-content-center">
              <div className="input-group input-group-lg border rounded-3 overflow-hidden">
                <span className="input-group-text bg-white border-0 text-muted">
                  <Search className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  className="form-control border-0 shadow-none fs-6"
                  placeholder="Filter records by Unique ID, Name, or Address..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Records Table Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-body">
          <div className="card-header bg-white py-3 px-4 border-0 d-flex align-items-center justify-content-between">
            <h5 className="fw-bold text-dark mb-0">{t('adminDashboard')}</h5>
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold d-flex align-items-center gap-1.5"
              onClick={handleOpenAdd}
            >
              <Plus className="w-4 h-4" />
              <span>{t('addNewPerson')}</span>
            </button>
          </div>

          <div className="card-body p-0">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : persons.length === 0 ? (
              <div className="text-center py-5 text-muted">
                No records found. Click <strong>{t('addNewPerson')}</strong> to add a new record.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '140px' }} className="px-4 py-3">{t('uniqueId')}</th>
                      <th style={{ width: '220px' }}>{t('name')}</th>
                      <th>{t('address')}</th>
                      <th style={{ width: '130px' }}>{t('dikshaDate')}</th>
                      <th style={{ width: '150px' }} className="text-end px-4 py-3">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {persons.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3">
                          <span className="badge bg-primary bg-opacity-15 text-light border border-primary border-opacity-25 font-mono px-2.5 py-1.5 fs-6 fw-bold">
                            {p.unique_id}
                          </span>
                        </td>
                        <td className="fw-bold text-dark">{p.name}</td>
                        <td className="whitespace-pre-line small text-secondary">{p.address}</td>
                        <td className="small">{p.diksha_date || '—'}</td>
                        <td className="text-end px-4 py-3">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => setSelectedForDetail(p)}
                              title={t('viewDetails')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={() => handleOpenEdit(p)}
                              title={t('editPerson')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => setSelectedForDelete(p)}
                              title={t('deletePerson')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="card-footer bg-white p-3 border-0 d-flex align-items-center justify-content-between">
              <span className="small text-muted">
                Page {page} of {totalPages} ({total} total records)
              </span>

              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PersonFormModal
        person={selectedForEdit}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={checkAuthAndFetch}
      />

      <DeleteConfirmModal
        person={selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onSuccess={checkAuthAndFetch}
      />

      <PersonDetailModal
        person={selectedForDetail}
        onClose={() => setSelectedForDetail(null)}
      />
    </div>
  );
}
