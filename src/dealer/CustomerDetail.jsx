import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Building, Mail, Phone, MapPin, 
  Truck, Ticket, User, Activity, ShieldCheck, X, Copy, Check,
  Edit, MessageCircle, RefreshCw, Trash2, ChevronDown, Search
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
import { 
  getDealerCustomerDetail, 
  updateDealerCustomerStatus, 
  deleteDealerCustomer,
  updateDealerVehicle,
  deleteDealerVehicle,
  updateDealerVehicleStatus
} from '../../api/client';

const LEASING_OPTIONS = [
  { id: "1", name: "CASH" },
  { id: "2", name: "PT SUNINDO KOOKMIN BEST FINANCE" },
  { id: "3", name: "PT. INDOMOBIL FINANCE INDONESIA (IMFI)" },
  { id: "4", name: "PT. ARTHAASIA FINANCE" },
  { id: "5", name: "PT. DIPO STAR FINANCE" },
  { id: "6", name: "LEASING LAINNYA" }
];

const BODY_TYPE_OPTIONS = [
  { id: "1", name: "Box" },
  { id: "2", name: "Bak" },
  { id: "3", name: "Chiller/Freezer" },
  { id: "4", name: "Towing" },
  { id: "5", name: "Bus" },
  { id: "6", name: "Tank Air" },
  { id: "7", name: "Tank Oli" },
  { id: "8", name: "Lainnya" }
];

const CustomSelect = ({ value, onChange, options, placeholder, disabled, error, className, searchable = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      <div
        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl flex items-center justify-between transition-all font-medium ${disabled ? 'opacity-50 bg-slate-100 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'} ${error ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            </div>
          )}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-indigo-50 flex items-center justify-between ${String(value) === String(opt.value) ? 'bg-indigo-50/50 text-indigo-700 font-bold' : 'text-slate-700'}`}
                  onClick={() => {
                    onChange({ target: { value: opt.value } });
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <span>{opt.label}</span>
                  {String(value) === String(opt.value) && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">Data tidak ditemukan</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showWaModal, setShowWaModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [showVehicleWaModal, setShowVehicleWaModal] = useState(false);
  const [showVehicleStatusModal, setShowVehicleStatusModal] = useState(false);
  const [showVehicleDeleteModal, setShowVehicleDeleteModal] = useState(false);
  const [showVehicleEditModal, setShowVehicleEditModal] = useState(false);
  const [vehicleFormData, setVehicleFormData] = useState({
    nopol: '', rangka: '', odometer: '', bodyTypeId: '', customBodyType: '', paymentId: '', customPayment: ''
  });

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

  const handleUpdateStatus = async (status) => {
    try {
      await updateDealerCustomerStatus(data.customer.id, status);
      setData(prev => ({ ...prev, customer: { ...prev.customer, status } }));
      setShowStatusModal(false);
    } catch (err) {
      alert("Gagal merubah status: " + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDealerCustomer(data.customer.id);
      navigate('/dealer/customers');
    } catch (err) {
      alert("Gagal menghapus data: " + err.message);
    }
  };

  const openVehicleWaModal = (e, v) => { e.stopPropagation(); setSelectedVehicle(v); setShowVehicleWaModal(true); };
  const openVehicleStatusModal = (e, v) => { e.stopPropagation(); setSelectedVehicle(v); setShowVehicleStatusModal(true); };
  const openVehicleDeleteModal = (e, v) => { e.stopPropagation(); setSelectedVehicle(v); setShowVehicleDeleteModal(true); };
  const openVehicleEditModal = (e, v) => { 
    e.stopPropagation(); 
    setSelectedVehicle(v);
    
    // Parse payment
    let paymentId = "";
    let customPayment = "";
    if (v.payment) {
      const opt = LEASING_OPTIONS.find(o => o.name === v.payment);
      if (opt) paymentId = opt.id;
      else if (v.payment.startsWith("LAINNYA: ")) { paymentId = "6"; customPayment = v.payment.replace("LAINNYA: ", ""); }
      else { paymentId = "6"; customPayment = v.payment; }
    }
    
    // Parse body_type
    let bodyTypeId = "";
    let customBodyType = "";
    if (v.body_type && v.body_type !== "-") {
      const opt = BODY_TYPE_OPTIONS.find(o => o.name === v.body_type);
      if (opt) bodyTypeId = opt.id;
      else if (v.body_type.startsWith("LAINNYA: ")) { bodyTypeId = "8"; customBodyType = v.body_type.replace("LAINNYA: ", ""); }
      else { bodyTypeId = "8"; customBodyType = v.body_type; }
    }

    setVehicleFormData({
      nopol: v.nopol || '', rangka: v.rangka || '', odometer: v.odometer || '', bodyTypeId, customBodyType, paymentId, customPayment
    });
    setShowVehicleEditModal(true);
  };

  const handleUpdateVehicleStatus = async (status) => {
    try {
      await updateDealerVehicleStatus(selectedVehicle.id, status);
      setData(prev => {
        const newVehicles = prev.vehicles.map(v => v.id === selectedVehicle.id ? { ...v, status } : v);
        return { ...prev, vehicles: newVehicles };
      });
      setShowVehicleStatusModal(false);
      setSelectedVehicle(null);
    } catch (err) {
      alert("Gagal merubah status kendaraan: " + err.message);
    }
  };

  const handleDeleteVehicle = async () => {
    try {
      await deleteDealerVehicle(selectedVehicle.id);
      setData(prev => {
        const newVehicles = prev.vehicles.filter(v => v.id !== selectedVehicle.id);
        const newTickets = prev.tickets.filter(t => t.nopol !== selectedVehicle.nopol);
        return { ...prev, vehicles: newVehicles, tickets: newTickets };
      });
      setShowVehicleDeleteModal(false);
      setSelectedVehicle(null);
    } catch (err) {
      alert("Gagal menghapus kendaraan: " + err.message);
    }
  };

  const handleUpdateVehicle = async () => {
    try {
      const finalPayment = vehicleFormData.paymentId === "6" ? `LAINNYA: ${vehicleFormData.customPayment}` : (LEASING_OPTIONS.find(o => o.id === vehicleFormData.paymentId)?.name || "");
      const finalBodyType = vehicleFormData.bodyTypeId === "8" ? `LAINNYA: ${vehicleFormData.customBodyType}` : (BODY_TYPE_OPTIONS.find(o => o.id === vehicleFormData.bodyTypeId)?.name || "-");
      
      const payload = {
        nopol: vehicleFormData.nopol,
        rangka: vehicleFormData.rangka,
        odometer: vehicleFormData.odometer,
        payment: finalPayment,
        body_type: finalBodyType
      };

      await updateDealerVehicle(selectedVehicle.id, payload);
      setData(prev => {
        const newVehicles = prev.vehicles.map(v => v.id === selectedVehicle.id ? { ...v, ...payload } : v);
        return { ...prev, vehicles: newVehicles };
      });
      setShowVehicleEditModal(false);
      setSelectedVehicle(null);
    } catch (err) {
      alert("Gagal mengedit kendaraan: " + err.message);
    }
  };

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
          <div className="flex items-center space-x-3 relative group">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${customer.status === 'New' ? 'bg-emerald-100 text-emerald-700' : (customer.status === 'Other' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700')}`}>
              {customer.status}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1.5 absolute right-full mr-3 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
              <button onClick={() => navigate(`/dealer/customers/${customer.id}/edit`)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit Customer">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => setShowWaModal(true)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="WhatsApp Actions">
                <MessageCircle className="w-4 h-4" />
              </button>
              <button onClick={() => setShowStatusModal(true)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title="Ubah Status">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => setShowDeleteModal(true)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Hapus Customer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
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
              <Truck className="w-5 h-5 text-indigo-500" />
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
                    <tr key={v.id} className="hover:bg-slate-50 cursor-pointer transition-colors group relative" onClick={() => setSelectedVehicle(v)}>
                      <td className="px-6 py-3 font-bold text-slate-800">{v.nopol}</td>
                      <td className="px-6 py-3 font-mono text-slate-500">{v.rangka}</td>
                      <td className="px-6 py-3">{v.body_type || '-'}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${v.status === 'New' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {v.status || 'New'}
                        </span>
                        
                        {/* Hover Actions */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1.5 absolute right-4 top-1/2 -translate-y-1/2 bg-white p-1 rounded-lg shadow-sm border border-slate-200 z-10">
                          <button onClick={(e) => openVehicleEditModal(e, v)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit Kendaraan">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => openVehicleWaModal(e, v)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="WhatsApp Actions">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => openVehicleStatusModal(e, v)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title="Ubah Status">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => openVehicleDeleteModal(e, v)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Hapus Kendaraan">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
      {selectedVehicle && !showVehicleEditModal && !showVehicleWaModal && !showVehicleStatusModal && !showVehicleDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedVehicle(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-indigo-600" />
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
      {/* WA Modal */}
      {showWaModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowWaModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Tindakan WhatsApp</h3>
              <button onClick={() => setShowWaModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-3">
              {['Konfirmasi', 'Akun Aktif', 'Unit Aktif', 'Follow Up Engagement'].map((action) => (
                <button key={action} className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-slate-700 transition-colors flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3 text-emerald-500" />
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowStatusModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Ubah Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              {['New', 'Confirmed', 'Active', 'Other'].map((s) => (
                <button key={s} onClick={() => handleUpdateStatus(s)} className={`px-4 py-3 rounded-xl border font-medium transition-colors ${customer.status === s ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-300 text-slate-700 hover:bg-slate-50'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-rose-600 flex items-center"><Trash2 className="w-5 h-5 mr-2" /> Hapus Customer</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6">
              <p className="text-slate-600 text-sm mb-6">Apakah Anda yakin ingin menghapus customer <strong>{customer.nama}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex space-x-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">Batal</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Vehicle Edit Modal */}
      {showVehicleEditModal && selectedVehicle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowVehicleEditModal(false); setSelectedVehicle(null); }}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-800">Edit Kendaraan</h3>
              <button onClick={() => { setShowVehicleEditModal(false); setSelectedVehicle(null); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">No. Polisi</label>
                <input type="text" value={vehicleFormData.nopol} onChange={e => setVehicleFormData({...vehicleFormData, nopol: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">No. Rangka</label>
                <input type="text" value={vehicleFormData.rangka} onChange={e => setVehicleFormData({...vehicleFormData, rangka: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Odometer</label>
                <input type="number" value={vehicleFormData.odometer} onChange={e => setVehicleFormData({...vehicleFormData, odometer: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Body Type</label>
                {vehicleFormData.bodyTypeId === "8" ? (
                  <div className="relative animate-fadeIn">
                    <input
                      type="text"
                      value={vehicleFormData.customBodyType}
                      onChange={(e) => setVehicleFormData({...vehicleFormData, customBodyType: e.target.value.toUpperCase()})}
                      placeholder="Ketik Body Type..."
                      autoFocus
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setVehicleFormData({...vehicleFormData, bodyTypeId: "", customBodyType: ""})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-200/80 hover:bg-slate-300 rounded-full p-1 transition-colors"
                      title="Ganti Body Type"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <CustomSelect
                    value={vehicleFormData.bodyTypeId}
                    onChange={(e) => setVehicleFormData({...vehicleFormData, bodyTypeId: e.target.value})}
                    options={BODY_TYPE_OPTIONS.map(opt => ({ value: opt.id, label: opt.name }))}
                    placeholder="Pilih Body Type"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Metode Pembayaran</label>
                {vehicleFormData.paymentId === "6" ? (
                  <div className="relative animate-fadeIn">
                    <input
                      type="text"
                      value={vehicleFormData.customPayment}
                      onChange={(e) => setVehicleFormData({...vehicleFormData, customPayment: e.target.value.toUpperCase()})}
                      placeholder="Ketik Nama Leasing..."
                      autoFocus
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setVehicleFormData({...vehicleFormData, paymentId: "", customPayment: ""})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-200/80 hover:bg-slate-300 rounded-full p-1 transition-colors"
                      title="Ganti Skema Pembayaran"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <CustomSelect
                    value={vehicleFormData.paymentId}
                    onChange={(e) => setVehicleFormData({...vehicleFormData, paymentId: e.target.value})}
                    options={LEASING_OPTIONS.map(opt => ({ value: opt.id, label: opt.name }))}
                    placeholder="Pilih Skema Pembayaran"
                  />
                )}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 rounded-b-2xl">
              <button onClick={() => { setShowVehicleEditModal(false); setSelectedVehicle(null); }} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">Batal</button>
              <button onClick={handleUpdateVehicle} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle WA Modal */}
      {showVehicleWaModal && selectedVehicle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowVehicleWaModal(false); setSelectedVehicle(null); }}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Aksi WhatsApp</h3>
              <button onClick={() => { setShowVehicleWaModal(false); setSelectedVehicle(null); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <a href={`https://wa.me/${customer.telp}?text=${encodeURIComponent(`Halo, kami dari GPS Runner ingin mengonfirmasi pendaftaran armada ${selectedVehicle.nopol} Anda...`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center w-full px-4 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-medium transition-colors">
                <MessageCircle className="w-5 h-5 mr-3" /> Konfirmasi
              </a>
              <a href={`https://wa.me/${customer.telp}?text=${encodeURIComponent(`Halo, armada ${selectedVehicle.nopol} Anda telah aktif terpasang GPS Runner...`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center w-full px-4 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-medium transition-colors">
                <MessageCircle className="w-5 h-5 mr-3" /> Unit Aktif
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Status Modal */}
      {showVehicleStatusModal && selectedVehicle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowVehicleStatusModal(false); setSelectedVehicle(null); }}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Ubah Status Kendaraan</h3>
              <button onClick={() => { setShowVehicleStatusModal(false); setSelectedVehicle(null); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 gap-3">
              {['New', 'Confirmed', 'Active'].map((s) => (
                <button key={s} onClick={() => handleUpdateVehicleStatus(s)} className={`px-4 py-3 rounded-xl border font-medium transition-colors ${selectedVehicle.status === s ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-300 text-slate-700 hover:bg-slate-50'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Delete Modal */}
      {showVehicleDeleteModal && selectedVehicle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowVehicleDeleteModal(false); setSelectedVehicle(null); }}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Kendaraan</h3>
              <p className="text-slate-600 text-sm mb-6">Apakah Anda yakin ingin menghapus kendaraan <strong>{selectedVehicle.nopol}</strong>? Tiket yang terkait dengan nopol ini juga akan terhapus. Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex space-x-3">
                <button onClick={() => { setShowVehicleDeleteModal(false); setSelectedVehicle(null); }} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">Batal</button>
                <button onClick={handleDeleteVehicle} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
