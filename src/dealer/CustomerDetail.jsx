import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Building, Mail, Phone, MapPin, 
  Car, Ticket, User, Activity, ShieldCheck, X, Copy, Check
} from 'lucide-react';

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
import { getDealerCustomerDetail } from '../../api/client';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const result = await getDealerCustomerDetail(id);
        setData(result);
      } catch (err) {
        setError('Gagal memuat detail customer.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Activity className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center py-12">
          <p className="text-rose-600 mb-4">{error || 'Customer tidak ditemukan.'}</p>
          <button 
            onClick={() => navigate('/dealer/customers')}
            className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Customer
          </button>
        </div>
      </div>
    );
  }

  const { customer, vehicles, tickets } = data;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center">
        <button 
          onClick={() => navigate('/dealer/customers')}
          className="mr-4 p-2 rounded-xl text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Detail Customer</h1>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center"><CopyableText text={customer.nama} /></h2>
              <p className="text-slate-500 font-medium flex items-center"><CopyableText text={customer.jabatan} /></p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${customer.status === 'New' ? 'bg-emerald-100 text-emerald-700' : (customer.status === 'Other' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700')}`}>
            {customer.status}
          </span>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <Building className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-500">Perusahaan / Sektor</p>
                <p className="text-slate-800 font-medium flex items-center"><CopyableText text={customer.company} /></p>
                <p className="text-slate-500 text-sm">{customer.sektor}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-500">Email & Username</p>
                <p className="text-slate-800 flex items-center"><CopyableText text={customer.email} /></p>
                <p className="text-slate-500 text-sm flex items-center"><CopyableText text={customer.username} /></p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <Phone className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-500">No. Telepon / WhatsApp</p>
                <p className="text-slate-800 font-medium flex items-center"><CopyableText text={customer.telp} /></p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-500">Alamat</p>
                <p className="text-slate-800 flex items-center"><CopyableText text={`${customer.alamat}, Kel. ${customer.kelurahan}`} /></p>
                <p className="text-slate-500 text-sm mt-1">
                  Kec. {customer.kecamatan}, Kab. {customer.kabupaten}, Prov. {customer.provinsi}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicles Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-800">Daftar Kendaraan</h3>
            </div>
            <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-xs font-bold">
              {vehicles.length} Unit
            </span>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 font-semibold">No. Polisi</th>
                  <th className="px-6 py-3 font-semibold">No. Rangka</th>
                  <th className="px-6 py-3 font-semibold">Body Type</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-6 text-center text-slate-500">Belum ada kendaraan</td>
                  </tr>
                ) : (
                  vehicles.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setSelectedVehicle(v)}>
                      <td className="px-6 py-3 font-bold text-slate-800">{v.nopol}</td>
                      <td className="px-6 py-3 font-mono text-slate-500">{v.rangka}</td>
                      <td className="px-6 py-3">{v.body_type || '-'}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${v.status === 'New' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {v.status || 'New'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-slate-800">Riwayat Pengajuan</h3>
            </div>
            <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-xs font-bold">
              {tickets.length} Tiket
            </span>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 font-semibold">Kode</th>
                  <th className="px-6 py-3 font-semibold">Tipe</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-6 text-center text-slate-500">Belum ada pengajuan</td>
                  </tr>
                ) : (
                  tickets.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setSelectedTicket(t)}>
                      <td className="px-6 py-3 font-medium text-slate-800">{t.kode}</td>
                      <td className="px-6 py-3">{t.type}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs">
                        {new Date(t.created_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vehicle Detail Modal */}
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
                  <label className="text-xs font-semibold text-slate-500 uppercase">Odometer</label>
                  <p className="font-medium text-slate-800 flex items-center"><CopyableText text={Number(selectedVehicle.odometer).toLocaleString('id-ID')} />&nbsp;km</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Body Type</label>
                  <p className="font-medium text-slate-800">{selectedVehicle.body_type || '-'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Metode Pembayaran</label>
                  <p className="font-medium text-slate-800 flex items-center"><CopyableText text={selectedVehicle.payment || '-'} /></p>
                </div>
                <div className="col-span-2">
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

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Detail Tiket</h3>
                  <p className="text-sm text-slate-500">{selectedTicket.kode}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Tipe Pengajuan</label>
                  <p className="font-medium text-slate-800">{selectedTicket.type}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                  <p className="font-medium text-amber-600">{selectedTicket.status}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Keterangan / Description</label>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg mt-1 border border-slate-100">
                    {selectedTicket.description || 'Tidak ada keterangan'}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Tanggal Dibuat</label>
                  <p className="font-medium text-slate-800">{new Date(selectedTicket.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
