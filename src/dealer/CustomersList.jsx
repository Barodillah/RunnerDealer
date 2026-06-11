import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Activity, Building, Phone, Mail } from 'lucide-react';
import { getDealerCustomers } from '../../api/client';

export default function CustomersList() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async (page, searchQuery, statusQuery) => {
    setLoading(true);
    try {
      const result = await getDealerCustomers(page, 10, searchQuery, statusQuery);
      setData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(1, search, statusFilter);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, fetchData]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchData(newPage, search, statusFilter);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800">Customers List</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: '', label: 'Semua' },
            { value: 'New', label: 'New' },
            { value: 'Confirmed', label: 'Confirmed' },
            { value: 'Active', label: 'Active' },
            { value: 'Other', label: 'Other' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                statusFilter === opt.value
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Nama / Jabatan</th>
              <th className="px-6 py-4">Perusahaan</th>
              <th className="px-6 py-4">Kontak</th>
              <th className="px-6 py-4">Unit</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Tgl Daftar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <Activity className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Tidak ada data ditemukan.</td>
              </tr>
            ) : (
              data.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/dealer/customers/${item.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{item.nama}</div>
                    <div className="text-xs text-slate-500 mt-1">{item.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-slate-700">
                      <Building className="w-4 h-4 mr-2 text-slate-400" />
                      {item.company}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-slate-700 mb-1">
                      <Phone className="w-4 h-4 mr-2 text-slate-400" />
                      {item.telp}
                    </div>
                    <div className="flex items-center text-slate-700">
                      <Mail className="w-4 h-4 mr-2 text-slate-400" />
                      {item.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {item.unit_count || 0} Unit
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'New' ? 'bg-emerald-100 text-emerald-700' : (item.status === 'Other' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && data.length > 0 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
