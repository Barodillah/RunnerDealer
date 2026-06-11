import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Building, Mail, Phone, MapPin, 
  User, Briefcase, Save, ChevronDown, Search, Check
} from 'lucide-react';
import { getDealerCustomerDetail, updateDealerCustomer } from '../../api/client';

const SEKTOR_OPTIONS = [
  { id: "1", name: "Transporter / Logistik / Ekspedisi" },
  { id: "2", name: "Construction / Real Estate / Property" },
  { id: "3", name: "Pemerintahan / Government" },
  { id: "4", name: "Jasa / Service" },
  { id: "5", name: "Pertambangan / Mining" },
  { id: "6", name: "Industri / Manufactur / Customer Goods" },
  { id: "7", name: "Pertanian / Perkebunan / Agriculture / Farm / Plantation" }
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

export default function CustomerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    telp: "",
    company: "",
    sektor: "",
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    kelurahan: "",
    alamat: "",
    nama: "",
    jabatan: ""
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const result = await getDealerCustomerDetail(id);
        if (result && result.customer) {
          setFormData({
            username: result.customer.username || "",
            email: result.customer.email || "",
            telp: result.customer.telp || "",
            company: result.customer.company || "", 
            sektor: result.customer.sektor || "",
            provinsi: result.customer.provinsi || "",
            kabupaten: result.customer.kabupaten || "",
            kecamatan: result.customer.kecamatan || "",
            kelurahan: result.customer.kelurahan || "",
            alamat: result.customer.alamat || "",
            nama: result.customer.nama || "",
            jabatan: result.customer.jabatan || ""
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDealerCustomer(id, formData);
      navigate(`/dealer/customers/${id}`);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan perubahan: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center">
        <button 
          onClick={() => navigate(`/dealer/customers/${id}`)}
          className="mr-4 p-2 rounded-xl text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Data Konsumen</h1>
          <p className="text-sm text-slate-500">Perbarui informasi detail untuk customer #{id}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Detail Informasi Konsumen</h2>
          <p className="text-slate-500 text-sm mt-1">Perbarui data diri dan detail perusahaan konsumen.</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Company */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Nama Perusahaan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Email Aktif</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">No. WhatsApp / Telepon</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  name="telp"
                  value={formData.telp}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* PIC */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Nama Lengkap (PIC)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Jabatan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Jabatan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="jabatan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Sektor */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Sektor Industri</label>
              <CustomSelect
                value={formData.sektor}
                onChange={(e) => handleChange({ target: { name: 'sektor', value: e.target.value } })}
                options={SEKTOR_OPTIONS.map(s => ({ value: s.name, label: s.name }))}
                placeholder="Pilih Sektor Industri..."
                searchable={true}
              />
            </div>

            {/* Provinsi, Kab dll */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Provinsi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="provinsi"
                  value={formData.provinsi}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Kabupaten/Kota</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="kabupaten"
                  value={formData.kabupaten}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Kecamatan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="kecamatan"
                  value={formData.kecamatan}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Kelurahan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="kelurahan"
                  value={formData.kelurahan}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Alamat Lengkap</label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  rows="3"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                ></textarea>
              </div>
            </div>

          </div>

          <div className="mt-8 flex items-center justify-end space-x-4 border-t border-slate-100 pt-6">
            <button 
              onClick={() => navigate(`/dealer/customers/${id}`)}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
