import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Activity, X, Car, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CopyableText = ({ text, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span 
      className={`group relative inline-flex items-center cursor-pointer transition-colors hover:text-indigo-600 ${className}`}
      onClick={handleCopy}
      title="Klik untuk menyalin"
    >
      <span>{text}</span>
      <span className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />}
      </span>
    </span>
  );
};
import { getDealerVehicles } from '../../api/client';

export default function VehiclesList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const fetchData = useCallback(async (page, searchQuery) => {
    setLoading(true);
    try {
      const result = await getDealerVehicles(page, 10, searchQuery);
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
      fetchData(1, search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, fetchData]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchData(newPage, search);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800">Vehicles List</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nopol/rangka/customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-72"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Nopol / Rangka</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <Activity className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">Tidak ada data ditemukan.</td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedVehicle(item)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{item.nopol}</div>
                      <div className="text-xs text-slate-500 font-mono mt-1">{item.rangka}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{item.customer_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'New' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.status || 'New'}
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

      {/* Detail Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedVehicle(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Detail Kendaraan</h3>
                  <p className="text-sm text-slate-500">{selectedVehicle.nopol}</p>
                </div>
              </div>
              <button onClick={() => setSelectedVehicle(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">No. Polisi</label>
                  <p className="font-bold text-slate-800 text-lg flex items-center"><CopyableText text={selectedVehicle.nopol} /></p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">No. Rangka</label>
                  <p className="font-medium text-slate-800 font-mono flex items-center"><CopyableText text={selectedVehicle.rangka} /></p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Customer</label>
                  <p 
                    className="font-medium text-indigo-600 cursor-pointer hover:underline"
                    onClick={() => navigate(`/dealer/customers/${selectedVehicle.customer_id}`)}
                    title="Buka Profil Customer"
                  >
                    {selectedVehicle.customer_name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Odometer</label>
                  <p className="font-medium text-slate-800 flex items-center"><CopyableText text={Number(selectedVehicle.odometer).toLocaleString('id-ID')} />&nbsp;km</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Metode Pembayaran</label>
                  <p className="font-medium text-slate-800 flex items-center"><CopyableText text={selectedVehicle.payment || '-'} /></p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Body Type</label>
                  <p className="font-medium text-slate-800">{selectedVehicle.body_type || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Tanggal Daftar</label>
                  <p className="font-medium text-slate-800">{new Date(selectedVehicle.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
