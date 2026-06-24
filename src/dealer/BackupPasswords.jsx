import React, { useState, useEffect } from 'react';
import { Activity, Copy, Check, Search, ShieldAlert, Key, X, AlertTriangle, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDealerBackupPasswords, updateDealerBackupLogin } from '../../api/client';
import { useNavigate } from 'react-router-dom';

const CopyableText = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span 
      className="group relative inline-flex items-center cursor-pointer transition-colors hover:text-indigo-600"
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

export default function BackupPasswords() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDealerBackupPasswords();
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memuat data backup');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleClick = (item) => {
    const now = new Date();
    const lastLogin = item.last_login_at ? new Date(item.last_login_at) : null;
    
    // Check if last login is in the current month and year
    const isThisMonth = lastLogin && 
                        lastLogin.getMonth() === now.getMonth() && 
                        lastLogin.getFullYear() === now.getFullYear();

    if (!isThisMonth) {
      setSelectedId(item.id);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmLoginUpdate = async () => {
    try {
      await updateDealerBackupLogin(selectedId);
      setShowConfirmModal(false);
      setSelectedId(null);
      fetchData(); // Refresh data
    } catch (err) {
      alert('Gagal mengupdate login status: ' + err.message);
    }
  };

  const filteredData = data.filter(item => 
    (item.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.customer_name || '').toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    const now = new Date();
    const aLastLogin = a.last_login_at ? new Date(a.last_login_at) : null;
    const bLastLogin = b.last_login_at ? new Date(b.last_login_at) : null;

    const aIsThisMonth = aLastLogin && aLastLogin.getMonth() === now.getMonth() && aLastLogin.getFullYear() === now.getFullYear();
    const bIsThisMonth = bLastLogin && bLastLogin.getMonth() === now.getMonth() && bLastLogin.getFullYear() === now.getFullYear();

    if (aIsThisMonth && !bIsThisMonth) return 1;
    if (!aIsThisMonth && bIsThisMonth) return -1;
    return 0;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  console.log("Pagination State:", { currentPage, totalItems, paginatedLength: paginatedData.length });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <ShieldAlert className="w-6 h-6 mr-3 text-rose-600" /> 
          Backup Passwords
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari username / nama customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Password</th>
                <th className="px-6 py-4">Status Login Bulan Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <Activity className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">Tidak ada data ditemukan.</td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const now = new Date();
                  const lastLogin = item.last_login_at ? new Date(item.last_login_at) : null;
                  const isThisMonth = lastLogin && 
                                      lastLogin.getMonth() === now.getMonth() && 
                                      lastLogin.getFullYear() === now.getFullYear();

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 flex items-center cursor-pointer hover:text-indigo-600" onClick={() => navigate(`/dealer/customers/${item.customer_id}`)}>
                          <User className="w-4 h-4 mr-2 text-slate-400" />
                          {item.customer_name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 ml-6">{item.company}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        <CopyableText text={item.username} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-indigo-700 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg w-fit">
                          <Key className="w-4 h-4 mr-2" />
                          <CopyableText text={item.password} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            onClick={() => !isThisMonth && handleToggleClick(item)}
                            className={`relative rounded-full cursor-pointer transition-colors flex-shrink-0 ${isThisMonth ? 'bg-orange-500' : 'bg-slate-300'}`}
                            style={{ width: '40px', height: '22px' }}
                          >
                            <div 
                              className="absolute bg-white rounded-full shadow-sm transition-transform duration-200"
                              style={{ 
                                width: '18px', 
                                height: '18px', 
                                top: '2px', 
                                left: '2px', 
                                transform: isThisMonth ? 'translateX(18px)' : 'translateX(0)' 
                              }}
                            ></div>
                          </div>
                          <div className="text-xs">
                            {isThisMonth ? (
                              <span className="text-orange-600 font-medium flex flex-col">
                                <span>Aktif</span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  {lastLogin.toLocaleString('id-ID')}
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">Belum Login</span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && paginatedData.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} data
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center text-indigo-600">
                <AlertTriangle className="w-5 h-5 mr-2" /> Konfirmasi Login
              </h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6">
              <p className="text-slate-600 text-sm mb-6">
                Apakah Anda yakin ingin memperbarui status login menjadi aktif untuk bulan ini? Tindakan ini akan mencatat waktu login saat ini.
              </p>
              <div className="flex space-x-3">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                  Batal
                </button>
                <button onClick={handleConfirmLoginUpdate} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                  Ya, Aktifkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
