import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Activity, Building, Phone, Mail, AlertCircle, X } from 'lucide-react';
import { getNeedAttentionCustomers, getDealerCustomerDetail } from '../../api/client';

export default function NeedAttention() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getNeedAttentionCustomers();
        if (res.status === 'success') {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!search) return data;
    const lowerSearch = search.toLowerCase();
    return data.filter(item => 
      (item.nama && item.nama.toLowerCase().includes(lowerSearch)) ||
      (item.username && item.username.toLowerCase().includes(lowerSearch)) ||
      (item.company && item.company.toLowerCase().includes(lowerSearch))
    );
  }, [data, search]);

  const handleRowClick = async (item) => {
    setIsModalOpen(true);
    setModalLoading(true);
    setSelectedCustomer(null);
    try {
      const res = await getDealerCustomerDetail(item.id);
      setSelectedCustomer(res);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-200 space-y-4 bg-rose-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Need Attention</h2>
              <p className="text-sm text-slate-500">Daftar customer yang belum pernah engage</p>
            </div>
          </div>
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
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Perusahaan</th>
              <th className="px-6 py-4">Kontak</th>
              <th className="px-6 py-4">Unit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <Activity className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                  {search ? 'Tidak ada data ditemukan untuk pencarian tersebut.' : 'Semua customer sudah pernah engage. Hebat!'}
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(item)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{item.nama}</div>
                    <div className="text-xs text-slate-500 mt-1">{item.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-slate-700">
                      <Building className="w-4 h-4 mr-2 text-slate-400" />
                      {item.company || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-slate-700 mb-1">
                      <Phone className="w-4 h-4 mr-2 text-slate-400" />
                      {item.telp || '-'}
                    </div>
                    <div className="flex items-center text-slate-700">
                      <Mail className="w-4 h-4 mr-2 text-slate-400" />
                      {item.email || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {item.unit_count || 0} Unit
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredData.length > 0 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Total {filteredData.length} customer yang butuh perhatian
          </span>
        </div>
      )}

      {/* Modal Detail Engagement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Detail Riwayat Engagement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {modalLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              ) : selectedCustomer && selectedCustomer.customer ? (
                <div>
                  <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 text-lg">{selectedCustomer.customer.nama}</h4>
                    <p className="text-indigo-700 text-sm mt-1">{selectedCustomer.customer.company || 'Tanpa Perusahaan'}</p>
                  </div>
                  
                  <h4 className="font-semibold text-slate-800 mb-3">Riwayat Status Engagement</h4>
                  {selectedCustomer.engagements && selectedCustomer.engagements.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Bulan Data</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Tgl Upload</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedCustomer.engagements.map((eng, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium text-slate-700">
                                {eng.upload_month ? new Date(eng.upload_month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '-'}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
                                  {eng.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-500">
                                {new Date(eng.created_at).toLocaleDateString('id-ID')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-slate-200 rounded-xl bg-slate-50">
                      <p className="text-slate-500 italic">Belum ada data engagement sama sekali untuk customer ini.</p>
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={() => navigate(`/dealer/customers/${selectedCustomer.customer.id}`)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Buka Profil Lengkap Customer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-rose-500 py-8">Gagal memuat detail data.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
