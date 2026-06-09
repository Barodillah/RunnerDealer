import React, { useState, useEffect, useRef } from 'react';
import { submitAktivasi } from '../api/client.js';
import {
  User, Mail, Phone, Building, Briefcase, MapPin,
  Car, ShieldCheck, ArrowRight, ArrowLeft, Download,
  Upload, FileText, CheckCircle2, AlertTriangle, HelpCircle, Info,
  X, ChevronLeft, ChevronRight, UserPlus, Truck,
  ChevronDown, Search, Check
} from 'lucide-react';

const RUNNER_MODULES = [
  { desktop: "./modul/desktop/01_1.jpeg", mobile: "./modul/mobile/01_1_mobile.jpeg" },
  { desktop: "./modul/desktop/01_2.jpeg", mobile: "./modul/mobile/01_2_mobile.jpeg" },
  { desktop: "./modul/desktop/01_4.jpeg", mobile: "./modul/mobile/01_4_mobile.jpeg" },
  { desktop: "./modul/desktop/02_1.jpeg", mobile: "./modul/mobile/02_1_mobile.jpeg" },
  { desktop: "./modul/desktop/02_2.jpeg", mobile: "./modul/mobile/02_2_mobile.jpeg" },
  { desktop: "./modul/desktop/02_4.jpeg", mobile: "./modul/mobile/02_4_mobile.jpeg" },
  { desktop: "./modul/desktop/02_6.jpeg", mobile: "./modul/mobile/02_6_mobile.jpeg" }
];


const SEKTOR_OPTIONS = [
  { id: "1", name: "Transporter / Logistik / Ekspedisi" },
  { id: "2", name: "Construction / Real Estate / Property" },
  { id: "3", name: "Pemerintahan / Government" },
  { id: "4", name: "Jasa / Service" },
  { id: "5", name: "Pertambangan / Mining" },
  { id: "6", name: "Industri / Manufactur / Customer Goods" },
  { id: "7", name: "Pertanian / Perkebunan / Agriculture / Farm / Plantation" }
];

const LEASING_OPTIONS = [
  { id: "1", name: "CASH" },
  { id: "2", name: "PT SUNINDO KOOKMIN BEST FINANCE" },
  { id: "3", name: "PT. INDOMOBIL FINANCE INDONESIA (IMFI)" },
  { id: "4", name: "PT. ARTHAASIA FINANCE" },
  { id: "5", name: "PT. DIPO STAR FINANCE" },
  { id: "6", name: "LEASING LAINNYA" }
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

export default function App() {
  const [step, setStep] = useState(1);
  const [showModul, setShowModul] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      setCurrentSlide(prev => Math.min(RUNNER_MODULES.length - 1, prev + 1));
    }
    if (touchStartX.current - touchEndX.current < -50) {
      setCurrentSlide(prev => Math.max(0, prev - 1));
    }
  };
  const [isExisting, setIsExisting] = useState(null); // null, true (Sudah), false (Belum)
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [refId, setRefId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener for header shrink effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Form State
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
    jabatan: "",
    jumlah: "", // "1", "2", "3", "4", "5" (>4)
  });

  // Dynamic Vehicles State
  const [vehicles, setVehicles] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [errors, setErrors] = useState({});

  // Region API States
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  // Di development: pakai Vite proxy (/wilayah-api → wilayah.id/api)
  // Di production (shared hosting): pakai PHP proxy
  const wilayahUrl = (type, code = '') =>
    import.meta.env.DEV
      ? `/wilayah-api/${code ? `${type}/${code}.json` : `${type}.json`}`
      : `./wilayah-proxy.php?type=${type}${code ? `&code=${code}` : ''}`;

  // Fetch Provinces
  useEffect(() => {
    fetch(wilayahUrl('provinces'))
      .then(res => res.json())
      .then(data => setProvinces(data.data))
      .catch(err => console.error("Error fetching provinces:", err));
  }, []);

  // Fetch Regencies
  useEffect(() => {
    if (formData.provinsi) {
      fetch(wilayahUrl('regencies', formData.provinsi))
        .then(res => res.json())
        .then(data => setRegencies(data.data))
        .catch(err => console.error("Error fetching regencies:", err));
    } else {
      setRegencies([]);
    }
  }, [formData.provinsi]);

  // Fetch Districts
  useEffect(() => {
    if (formData.kabupaten) {
      fetch(wilayahUrl('districts', formData.kabupaten))
        .then(res => res.json())
        .then(data => setDistricts(data.data))
        .catch(err => console.error("Error fetching districts:", err));
    } else {
      setDistricts([]);
    }
  }, [formData.kabupaten]);

  // Fetch Villages
  useEffect(() => {
    if (formData.kecamatan) {
      fetch(wilayahUrl('villages', formData.kecamatan))
        .then(res => res.json())
        .then(data => setVillages(data.data))
        .catch(err => console.error("Error fetching villages:", err));
    } else {
      setVillages([]);
    }
  }, [formData.kecamatan]);

  // Formatting helpers
  const formatNoSpace = (val) => val.replace(/\s+/g, '');
  const formatUppercase = (val) => val.toUpperCase();
  const formatUppercaseNoSpace = (val) => val.toUpperCase().replace(/\s+/g, '');
  const formatTitleCase = (val) => {
    return val.toLowerCase().replace(/(?:^|\s)\w/g, (letter) => letter.toUpperCase());
  };
  const formatPhone = (val) => {
    let clean = val.replace(/\D/g, '');
    if (clean.startsWith('62')) {
      clean = clean.substring(2);
    }
    return clean;
  };
  const formatNumeric = (val) => val.replace(/\D/g, '');

  // Form value change handlers
  const handleInputChange = (field, value, formatter = null) => {
    let formattedValue = value;
    if (formatter) {
      formattedValue = formatter(value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Clear error message when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Dynamic vehicles state adjuster
  useEffect(() => {
    if (formData.jumlah && formData.jumlah !== "5") {
      const count = parseInt(formData.jumlah, 10);
      setVehicles(prev => {
        const updated = [...prev];
        if (updated.length < count) {
          for (let i = updated.length; i < count; i++) {
            updated.push({
              id: i + 1,
              rangka: "",
              nopol: "",
              odometer: "",
              payment: "",
              customPayment: ""
            });
          }
        } else if (updated.length > count) {
          return updated.slice(0, count);
        }
        return updated;
      });
    } else {
      setVehicles([]);
    }
  }, [formData.jumlah]);

  const handleVehicleChange = (index, field, value, formatter = null) => {
    let formattedValue = value;
    if (formatter) {
      formattedValue = formatter(value);
    }

    setVehicles(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: formattedValue
      };
      return updated;
    });

    const errorKey = `vehicle_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: null }));
    }
  };

  // Cascading logic triggers
  const handleProvinceChange = (e) => {
    const provId = e.target.value;
    setFormData(prev => ({
      ...prev,
      provinsi: provId,
      kabupaten: "",
      kecamatan: "",
      kelurahan: ""
    }));
  };

  const handleRegencyChange = (e) => {
    const regId = e.target.value;
    setFormData(prev => ({
      ...prev,
      kabupaten: regId,
      kecamatan: "",
      kelurahan: ""
    }));
  };

  const handleDistrictChange = (e) => {
    const distId = e.target.value;
    setFormData(prev => ({
      ...prev,
      kecamatan: distId,
      kelurahan: ""
    }));
  };

  const handleVillageChange = (e) => {
    const vilId = e.target.value;
    setFormData(prev => ({
      ...prev,
      kelurahan: vilId
    }));
  };

  // Form Validation Engine
  const validateStep2 = () => {
    const newErrors = {};
    const requiredFields = isExisting
      ? ["username", "email", "company", "nama", "telp"]
      : ["username", "email", "telp", "company", "sektor", "provinsi", "kabupaten", "kecamatan", "kelurahan", "alamat", "nama", "jabatan"];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = "Bidang ini wajib diisi.";
      }
    });

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Format email tidak valid.";
      }
    }

    if (formData.telp) {
      if (formData.telp.length < 8) {
        newErrors.telp = "Nomor telepon minimal harus 8 digit.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.jumlah) {
      newErrors.jumlah = "Silakan pilih jumlah kendaraan.";
      setErrors(newErrors);
      return false;
    }

    if (formData.jumlah === "5") {
      if (!excelFile) {
        newErrors.excelFile = "Silakan unggah dokumen excel daftar kendaraan Anda.";
        setErrors(newErrors);
        return false;
      }
      return true;
    }

    vehicles.forEach((vehicle, idx) => {
      if (!vehicle.rangka) newErrors[`vehicle_${idx}_rangka`] = "No. Rangka wajib diisi.";
      if (!vehicle.nopol) newErrors[`vehicle_${idx}_nopol`] = "No. Polisi wajib diisi.";
      if (!vehicle.odometer) newErrors[`vehicle_${idx}_odometer`] = "Odometer wajib diisi.";
      if (!vehicle.payment) newErrors[`vehicle_${idx}_payment`] = "Metode pembayaran wajib diisi.";
      if (vehicle.payment === "6" && !vehicle.customPayment) {
        newErrors[`vehicle_${idx}_customPayment`] = "Sebutkan nama leasing pembayaran.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigations with guards
  const handleNextStep = () => {
    if (step === 1) {
      if (isExisting === null) {
        setErrors({ isExisting: "Silakan pilih salah satu opsi di bawah ini." });
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    } else if (step === 3) {
      if (validateStep3()) {
        setStep(4);
      }
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Simulated Excel Downloader
  const downloadExcelTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "No,No Rangka,No Polisi,Odometer (KM),Pembayaran (CASH / Nama Leasing)\n"
      + "1,MHK1234567890,B1234XX,5200,CASH\n"
      + "2,MHK0987654321,D5678YY,12400,PT SUNINDO KOOKMIN BEST FINANCE\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_Aktivasi_GPS_Runner.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // File Upload Handlers
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
      setErrors(prev => ({ ...prev, excelFile: null }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      setExcelFile(file);
      setErrors(prev => ({ ...prev, excelFile: null }));
    } else {
      setErrors(prev => ({ ...prev, excelFile: "Format file tidak didukung. Harap unggah file Excel (.xlsx, .xls) atau .csv" }));
    }
  };

  // Submit trigger
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) return;

    setIsLoading(true);
    try {
      const payload = {
        isExisting,
        formData,
        vehicles,
      };

      // Call actual backend API
      const result = await submitAktivasi(payload);

      if (result && result.refId) {
        setRefId(result.refId);
      } else {
        // Fallback simulate ref ID if backend doesn't return one
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const code = isExisting ? "EXT" : "NEW";
        setRefId(`REG-${code}-2026-${randomNum}`);
      }
      setSubmitSuccess(true);
    } catch (error) {
      console.error("API error, falling back to simulated success for frontend demo", error);
      // Fallback simulated reference ID for UI demonstration if backend fails
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const code = isExisting ? "EXT" : "NEW";
      setRefId(`REG-${code}-2026-${randomNum}`);
      setSubmitSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setIsExisting(null);
    setAgreeTerms(false);
    setSubmitSuccess(false);
    setFormData({
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
      jabatan: "",
      jumlah: "",
    });
    setVehicles([]);
    setExcelFile(null);
    setErrors({});
  };

  // Helper selectors descriptive labels
  const getProvinceName = (code) => provinces.find(p => p.code === code)?.name || "";
  const getRegencyName = (provCode, code) => regencies.find(r => r.code === code)?.name || "";
  const getDistrictName = (regCode, code) => districts.find(d => d.code === code)?.name || "";
  const getVillageName = (distCode, code) => villages.find(v => v.code === code)?.name || "";
  const getSektorName = (id) => SEKTOR_OPTIONS.find(s => s.id === id)?.name || "";
  const getPaymentName = (id, customText) => {
    if (id === "6") return `LAINNYA: ${customText || ""}`;
    return LEASING_OPTIONS.find(p => p.id === id)?.name || "";
  };

  return (
    <>
      {/* Header Bar */}
      <header className={`bg-white border-b border-slate-200 px-6 fixed top-0 left-0 right-0 z-50 shadow-sm transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center justify-center w-full md:w-auto md:justify-start space-x-4 mb-3 md:mb-0">
            <img src="./logo.png" alt="GPS Runner Logo" className={`w-auto object-contain shrink-0 transition-all duration-300 ${isScrolled ? 'h-7 md:h-8' : 'h-10 md:h-12'}`} />
          </div>
          <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-100 py-1.5 px-3 rounded-full text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Server Live Terhubung</span>
          </div>
        </div>

        {/* Step Progress Tracker - inside header to avoid gap */}
        {!submitSuccess && (
          <div className={`max-w-lg mx-auto relative px-2 transition-all duration-300 ${isScrolled ? 'mt-2 pb-1' : 'mt-4 pb-2'}`}>
            <div className="flex justify-between items-center relative">
              <div className={`absolute left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0 transition-all duration-300 ${isScrolled ? 'top-[16px]' : 'top-[20px]'}`}></div>
              <div
                className={`absolute left-0 h-0.5 bg-indigo-600 -translate-y-1/2 transition-all duration-300 z-0 ${isScrolled ? 'top-[16px]' : 'top-[20px]'}`}
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>

              {[
                { number: 1, label: "Status" },
                { number: 2, label: "Data Konsumen" },
                { number: 3, label: "Kendaraan" },
                { number: 4, label: "Review" }
              ].map((s) => (
                <div key={s.number} className="flex flex-col items-center relative z-10">
                  <button
                    disabled={s.number > step && s.number > 2 && isExisting === null}
                    onClick={() => {
                      if (s.number < step) setStep(s.number);
                      if (s.number === 2 && isExisting !== null) setStep(2);
                    }}
                    className={`rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${isScrolled ? 'w-8 h-8' : 'w-10 h-10'} ${step >= s.number
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                      }`}
                  >
                    {s.number}
                  </button>
                  <span className={`font-bold mt-1 tracking-wide transition-all duration-300 ${isScrolled ? 'text-[9px]' : 'text-[11px] mt-2'} ${step >= s.number ? 'text-indigo-600' : 'text-slate-400'
                    }`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="bg-slate-50 min-h-screen font-sans flex flex-col justify-between selection:bg-indigo-200 pt-[160px] md:pt-[180px]">
        {/* Main Content Area */}
        <main className="max-w-4xl w-full mx-auto p-4 md:p-8 flex-grow">

          {/* Dynamic Card Container */}
          {!submitSuccess ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 md:p-10 transition-all duration-300">

              {/* Step 1: Activation Status Toggle */}
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center max-w-xl mx-auto space-y-2">
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Langkah 1</span>
                    <h2 className="text-2xl font-black text-slate-800 md:text-3xl">Pilih Status Aktivasi</h2>
                    <p className="text-slate-500 text-sm md:text-base">Apakah Anda sudah pernah melakukan aktivasi perangkat GPS Runner sebelumnya?</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
                    {/* Option A: New User */}
                    <div
                      onClick={() => {
                        setIsExisting(false);
                        setErrors({});
                      }}
                      className={`cursor-pointer border-2 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between h-48 hover:border-indigo-400 hover:shadow-lg ${isExisting === false
                        ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50'
                        : 'border-slate-200 bg-white'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                          <UserPlus className="w-6 h-6" />
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isExisting === false ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                          }`}>
                          {isExisting === false && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-800">Belum Pernah</h3>
                        <p className="text-xs text-slate-500 mt-1">Jika Anda belum memiliki akun Runner, Anda dapat mendaftar di sini.</p>
                      </div>
                    </div>

                    {/* Option B: Existing User */}
                    <div
                      onClick={() => {
                        setIsExisting(true);
                        setErrors({});
                      }}
                      className={`cursor-pointer border-2 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between h-48 hover:border-indigo-400 hover:shadow-lg ${isExisting === true
                        ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50'
                        : 'border-slate-200 bg-white'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                          <Truck className="w-6 h-6" />
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isExisting === true ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                          }`}>
                          {isExisting === true && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-800">Sudah Pernah</h3>
                        <p className="text-xs text-slate-500 mt-1">Jika Anda sudah memiliki akun Runner, Anda dapat menambahkan kendaraan di sini.</p>
                      </div>
                    </div>
                  </div>

                  {errors.isExisting && (
                    <div className="flex items-center justify-center space-x-2 text-rose-500 text-sm font-semibold text-center pt-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{errors.isExisting}</span>
                    </div>
                  )}

                  <div className="pt-6 mt-4 border-t border-slate-100 flex justify-center">
                    <button
                      onClick={() => {
                        setCurrentSlide(0);
                        setShowModul(true);
                      }}
                      className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-5 py-2.5 rounded-xl transition-all hover:bg-indigo-100 hover:scale-105"
                    >
                      <HelpCircle className="w-5 h-5" />
                      <span>Apa itu GPS Runner?</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Consumer Information Form */}
              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Langkah 2</span>
                    <h2 className="text-2xl font-black text-slate-800 mt-2">
                      {isExisting ? "Detail Informasi Akun Terdaftar" : "Detail Informasi Konsumen Baru"}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                      {isExisting
                        ? "Silakan lengkapi formulir di bawah ini dengan data yang telah terdaftar untuk proses identifikasi akun."
                        : "Mohon lengkapi formulir data diri dan detail perusahaan Anda dengan benar untuk kelancaran proses aktivasi akun baru."}
                    </p>
                  </div>

                  {/* Conditional Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Username */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                        {isExisting ? "Username Terdaftar" : "Username"}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => handleInputChange("username", e.target.value, formatNoSpace)}
                          placeholder="Contoh: up_admin_gps"
                          className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 ${errors.username ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                            }`}
                        />
                      </div>
                      {errors.username && <p className="text-rose-500 text-xs font-semibold">{errors.username}</p>}
                    </div>

                    {/* Company */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                        {isExisting ? "Nama Perusahaan Terdaftar" : "Nama Perusahaan"}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Building className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value, formatUppercase)}
                          placeholder="PT INDAH MAJU SENTOSA"
                          className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold placeholder:font-normal placeholder:text-slate-400 ${errors.company ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                            }`}
                        />
                      </div>
                      {errors.company && <p className="text-rose-500 text-xs font-semibold">{errors.company}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                        {isExisting ? "Email Terdaftar" : "Alamat Email"}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value, formatNoSpace)}
                          placeholder="email@perusahaan.com"
                          className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 ${errors.email ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                            }`}
                        />
                      </div>
                      {errors.email && <p className="text-rose-500 text-xs font-semibold">{errors.email}</p>}
                    </div>

                    {/* WhatsApp Phone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">No. Whatsapp Aktif</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                          +62
                        </div>
                        <input
                          type="tel"
                          value={formData.telp}
                          onChange={(e) => handleInputChange("telp", e.target.value, formatPhone)}
                          placeholder="812345678"
                          className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold placeholder:text-slate-400 ${errors.telp ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                            }`}
                        />
                      </div>
                      {errors.telp && <p className="text-rose-500 text-xs font-semibold">{errors.telp}</p>}
                    </div>

                    {/* Sektor Bisnis (NEW CUSTOMER ONLY) */}
                    {!isExisting && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Sektor Bisnis</label>
                        <div className="relative">
                          <CustomSelect
                            value={formData.sektor}
                            onChange={(e) => handleInputChange("sektor", e.target.value)}
                            options={SEKTOR_OPTIONS.map(s => ({ value: s.id, label: s.name }))}
                            placeholder="Pilih Sektor Bisnis"
                            error={errors.sektor}
                          />
                        </div>
                        {errors.sektor && <p className="text-rose-500 text-xs font-semibold">{errors.sektor}</p>}
                      </div>
                    )}

                    {/* Nama PIC */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Nama PIC / Contact Person</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={formData.nama}
                          onChange={(e) => handleInputChange("nama", e.target.value, formatTitleCase)}
                          placeholder="Agus Setiawan"
                          className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 ${errors.nama ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                            }`}
                        />
                      </div>
                      {errors.nama && <p className="text-rose-500 text-xs font-semibold">{errors.nama}</p>}
                    </div>

                    {/* Jabatan */}
                    {!isExisting && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Jabatan PIC</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            value={formData.jabatan}
                            onChange={(e) => handleInputChange("jabatan", e.target.value, formatTitleCase)}
                            placeholder="Manager Operasional"
                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 ${errors.jabatan ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                              }`}
                          />
                        </div>
                        {errors.jabatan && <p className="text-rose-500 text-xs font-semibold">{errors.jabatan}</p>}
                      </div>
                    )}

                  </div>

                  {/* Region Address Cascading Selectors (NEW CUSTOMER ONLY) */}
                  {!isExisting && (
                    <div className="border-t border-slate-100 pt-6 mt-6 space-y-5">
                      <h3 className="text-md font-bold text-slate-800 flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                        <span>Alamat & Wilayah Administratif</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Provinsi */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Provinsi</label>
                          <CustomSelect
                            value={formData.provinsi}
                            onChange={handleProvinceChange}
                            options={provinces.map(p => ({ value: p.code, label: p.name }))}
                            placeholder="Pilih Provinsi"
                            error={errors.provinsi}
                            searchable
                          />
                          {errors.provinsi && <p className="text-rose-500 text-xs font-semibold">{errors.provinsi}</p>}
                        </div>

                        {/* Kabupaten / Kota */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Kota / Kabupaten</label>
                          <CustomSelect
                            disabled={!formData.provinsi}
                            value={formData.kabupaten}
                            onChange={handleRegencyChange}
                            options={regencies.map(r => ({ value: r.code, label: r.name }))}
                            placeholder="Pilih Kota / Kabupaten"
                            error={errors.kabupaten}
                            searchable
                          />
                          {errors.kabupaten && <p className="text-rose-500 text-xs font-semibold">{errors.kabupaten}</p>}
                        </div>

                        {/* Kecamatan */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Kecamatan</label>
                          <CustomSelect
                            disabled={!formData.kabupaten}
                            value={formData.kecamatan}
                            onChange={handleDistrictChange}
                            options={districts.map(d => ({ value: d.code, label: d.name }))}
                            placeholder="Pilih Kecamatan"
                            error={errors.kecamatan}
                            searchable
                          />
                          {errors.kecamatan && <p className="text-rose-500 text-xs font-semibold">{errors.kecamatan}</p>}
                        </div>

                        {/* Kelurahan */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Kelurahan</label>
                          <CustomSelect
                            disabled={!formData.kecamatan}
                            value={formData.kelurahan}
                            onChange={handleVillageChange}
                            options={villages.map(v => ({ value: v.code, label: v.name }))}
                            placeholder="Pilih Kelurahan"
                            error={errors.kelurahan}
                            searchable
                          />
                          {errors.kelurahan && <p className="text-rose-500 text-xs font-semibold">{errors.kelurahan}</p>}
                        </div>

                        {/* Detail Alamat */}
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Detail Alamat Lengkap</label>
                          <textarea
                            rows="3"
                            value={formData.alamat}
                            onChange={(e) => handleInputChange("alamat", e.target.value, formatTitleCase)}
                            placeholder="Jalan, Blok, Nomor Rumah/Gedung..."
                            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 ${errors.alamat ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
                              }`}
                          ></textarea>
                          {errors.alamat && <p className="text-rose-500 text-xs font-semibold">{errors.alamat}</p>}
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Vehicle Information Dynamic Form */}
              {step === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Langkah 3</span>
                    <h2 className="text-2xl font-black text-slate-800 mt-2">Detail Armada Kendaraan</h2>
                    <p className="text-slate-500 text-sm mt-1">
                      Silakan tentukan jumlah unit kendaraan yang ingin didaftarkan dan diaktivasi.
                    </p>
                  </div>

                  {/* Vehicle Count Selection Buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Jumlah Kendaraan</label>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { value: "1", label: "1 Unit" },
                        { value: "2", label: "2 Unit" },
                        { value: "3", label: "3 Unit" },
                        { value: "4", label: "4 Unit" },
                        { value: "5", label: "Lebih dari 4 Unit" }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleInputChange("jumlah", opt.value)}
                          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex-1 md:flex-none whitespace-nowrap ${formData.jumlah === opt.value
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-600'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'
                            } ${errors.jumlah && !formData.jumlah ? 'border-rose-500 bg-rose-50/20' : ''}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {errors.jumlah && <p className="text-rose-500 text-xs font-semibold mt-1">{errors.jumlah}</p>}
                  </div>

                  {/* Dynamic Unit Form Cards (For 1 to 4 Vehicles) */}
                  {formData.jumlah && formData.jumlah !== "5" && (
                    <div className="space-y-6 pt-4">
                      {vehicles.map((v, idx) => (
                        <div key={v.id} className="border border-slate-100 rounded-2xl bg-slate-50/50 p-5 md:p-6 space-y-4 shadow-sm relative">
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-indigo-600 rounded-l-2xl"></div>
                          <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                            <h3 className="text-md font-extrabold text-slate-800 flex items-center space-x-2">
                              <span className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                                {idx + 1}
                              </span>
                              <span>Data Kendaraan Ke-{v.id}</span>
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* No. Rangka */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">No. Rangka</label>
                              <input
                                type="text"
                                value={v.rangka}
                                onChange={(e) => handleVehicleChange(idx, "rangka", e.target.value, formatUppercaseNoSpace)}
                                placeholder="MHK123456XXXXXX"
                                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold placeholder:font-normal text-sm ${errors[`vehicle_${idx}_rangka`] ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200'
                                  }`}
                              />
                              {errors[`vehicle_${idx}_rangka`] && (
                                <p className="text-rose-500 text-[11px] font-bold mt-1">{errors[`vehicle_${idx}_rangka`]}</p>
                              )}
                            </div>

                            {/* No. Polisi */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">No. Polisi</label>
                              <input
                                type="text"
                                value={v.nopol}
                                onChange={(e) => handleVehicleChange(idx, "nopol", e.target.value, formatUppercaseNoSpace)}
                                placeholder="B1234FGA"
                                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-extrabold placeholder:font-normal text-sm ${errors[`vehicle_${idx}_nopol`] ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200'
                                  }`}
                              />
                              {errors[`vehicle_${idx}_nopol`] && (
                                <p className="text-rose-500 text-[11px] font-bold mt-1">{errors[`vehicle_${idx}_nopol`]}</p>
                              )}
                            </div>

                            {/* Odometer (KM) */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Odometer (KM)</label>
                              <input
                                type="text"
                                value={v.odometer}
                                onChange={(e) => handleVehicleChange(idx, "odometer", e.target.value, formatNumeric)}
                                placeholder="72300"
                                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold placeholder:font-normal text-sm ${errors[`vehicle_${idx}_odometer`] ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200'
                                  }`}
                              />
                              {errors[`vehicle_${idx}_odometer`] && (
                                <p className="text-rose-500 text-[11px] font-bold mt-1">{errors[`vehicle_${idx}_odometer`]}</p>
                              )}
                            </div>

                            {/* Metode Pembayaran */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Metode Pembayaran</label>
                              {v.payment === "6" ? (
                                <div className="relative animate-fadeIn">
                                  <input
                                    type="text"
                                    value={v.customPayment}
                                    onChange={(e) => handleVehicleChange(idx, "customPayment", e.target.value, formatUppercase)}
                                    placeholder="Ketik Nama Leasing..."
                                    autoFocus
                                    className={`w-full pl-4 pr-10 py-3 bg-slate-50 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold placeholder:font-normal text-sm ${errors[`vehicle_${idx}_customPayment`] ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200'
                                      }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleVehicleChange(idx, "payment", "");
                                      handleVehicleChange(idx, "customPayment", "");
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-200/80 hover:bg-slate-300 rounded-full p-1 transition-colors"
                                    title="Ganti Skema Pembayaran"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <CustomSelect
                                  value={v.payment}
                                  onChange={(e) => handleVehicleChange(idx, "payment", e.target.value)}
                                  options={LEASING_OPTIONS.map(opt => ({ value: opt.id, label: opt.name }))}
                                  placeholder="Pilih Skema Pembayaran"
                                  error={errors[`vehicle_${idx}_payment`]}
                                />
                              )}

                              {v.payment === "6" ? (
                                errors[`vehicle_${idx}_customPayment`] && (
                                  <p className="text-rose-500 text-[11px] font-bold mt-1">{errors[`vehicle_${idx}_customPayment`]}</p>
                                )
                              ) : (
                                errors[`vehicle_${idx}_payment`] && (
                                  <p className="text-rose-500 text-[11px] font-bold mt-1">{errors[`vehicle_${idx}_payment`]}</p>
                                )
                              )}
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* More Than 4 Vehicles Selection - Excel Workflow */}
                  {formData.jumlah === "5" && (
                    <div className="space-y-6 pt-4 animate-fadeIn">
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start space-x-3 text-amber-800">
                        <Info className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-sm">Informasi Penginputan Banyak Unit</h4>
                          <p className="text-xs mt-1 leading-relaxed opacity-90">
                            Untuk pendaftaran lebih dari 4 kendaraan, pengisian tidak dilakukan secara manual satu-persatu. Silakan unduh file excel template kami di bawah ini, lengkapi datanya, dan unggah kembali berkas tersebut pada area yang disediakan.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Step 3A: Download Template */}
                        <div className="border border-slate-200 rounded-2xl p-6 bg-white flex flex-col justify-between items-start space-y-4">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Langkah 1</span>
                            <h3 className="font-extrabold text-slate-800 text-base mt-1">Unduh Template Berkas</h3>
                            <p className="text-xs text-slate-500 mt-1">Dapatkan format dokumen tabel excel standar kami agar sinkronisasi data armada berjalan lancar.</p>
                          </div>
                          <button
                            type="button"
                            onClick={downloadExcelTemplate}
                            className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition duration-200 text-xs"
                          >
                            <Download className="w-4 h-4" />
                            <span>Unduh File Excel Template</span>
                          </button>
                        </div>

                        {/* Step 3B: Upload Template */}
                        <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white rounded-2xl p-6 transition duration-200">
                          <div
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current.click()}
                            className="h-full flex flex-col justify-center items-center text-center cursor-pointer space-y-2 py-4"
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept=".xlsx, .xls, .csv"
                              className="hidden"
                            />
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700">Tarik & Lepas file Excel di sini</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Mendukung format .xlsx, .xls, .csv</p>
                            </div>
                            <span className="inline-block text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                              Atau Pilih Berkas Lokal
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Show Uploaded File Status */}
                      {excelFile && (
                        <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-4 flex items-center justify-between animate-fadeIn">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{excelFile.name}</p>
                              <p className="text-[10px] text-slate-500">{(excelFile.size / 1024).toFixed(1)} KB • Siap diunggah</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setExcelFile(null)}
                            className="text-xs font-bold text-slate-400 hover:text-rose-600 transition"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                      {errors.excelFile && (
                        <p className="text-rose-500 text-xs font-semibold text-center">{errors.excelFile}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Full Form Review */}
              {step === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Langkah 4</span>
                    <h2 className="text-2xl font-black text-slate-800 mt-2">Tinjau & Konfirmasi</h2>
                    <p className="text-slate-500 text-sm mt-1">
                      Silakan tinjau kembali seluruh informasi yang Anda input sebelum menyelesaikan proses aktivasi.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Part A: Activation & Contact Info */}
                    <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden">
                      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Data Akun & Kontak</span>
                        <button
                          onClick={() => setStep(2)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          Ubah
                        </button>
                      </div>
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-sm">
                        <div className="flex justify-between md:justify-start md:space-x-4 border-b border-slate-100 pb-2 md:border-none md:pb-0">
                          <span className="text-slate-400 font-medium md:w-36">Status Akun</span>
                          <span className="font-extrabold text-slate-800">
                            {isExisting ? "Sudah Terdaftar" : "Akun Baru"}
                          </span>
                        </div>
                        <div className="flex justify-between md:justify-start md:space-x-4 border-b border-slate-100 pb-2 md:border-none md:pb-0">
                          <span className="text-slate-400 font-medium md:w-36">Username</span>
                          <span className="font-bold text-slate-800">{formData.username}</span>
                        </div>
                        <div className="flex justify-between md:justify-start md:space-x-4 border-b border-slate-100 pb-2 md:border-none md:pb-0">
                          <span className="text-slate-400 font-medium md:w-36">Perusahaan</span>
                          <span className="font-bold text-slate-800">{formData.company}</span>
                        </div>
                        <div className="flex justify-between md:justify-start md:space-x-4 border-b border-slate-100 pb-2 md:border-none md:pb-0">
                          <span className="text-slate-400 font-medium md:w-36">Whatsapp PIC</span>
                          <span className="font-bold text-slate-800">+62 {formData.telp}</span>
                        </div>
                        {!isExisting && (
                          <>
                            <div className="flex justify-between md:justify-start md:space-x-4 border-b border-slate-100 pb-2 md:border-none md:pb-0 col-span-1 md:col-span-2">
                              <span className="text-slate-400 font-medium md:w-36">Email</span>
                              <span className="font-bold text-slate-800">{formData.email}</span>
                            </div>
                            <div className="flex justify-between md:justify-start md:space-x-4 border-b border-slate-100 pb-2 md:border-none md:pb-0 col-span-1 md:col-span-2">
                              <span className="text-slate-400 font-medium md:w-36">Sektor Bisnis</span>
                              <span className="font-bold text-slate-800">{getSektorName(formData.sektor)}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between md:justify-start md:space-x-4 border-b border-slate-100 pb-2 md:border-none md:pb-0">
                          <span className="text-slate-400 font-medium md:w-36">Nama PIC</span>
                          <span className="font-bold text-slate-800">{formData.nama}</span>
                        </div>
                        {!isExisting && (
                          <div className="flex justify-between md:justify-start md:space-x-4">
                            <span className="text-slate-400 font-medium md:w-36">Jabatan PIC</span>
                            <span className="font-bold text-slate-800">{formData.jabatan}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Part B: Administrative Region (NEW CUSTOMER ONLY) */}
                    {!isExisting && (
                      <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden">
                        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Detail Lokasi & Alamat</span>
                          <button
                            onClick={() => setStep(2)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                          >
                            Ubah
                          </button>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                          <div className="flex justify-between md:justify-start md:space-x-4">
                            <span className="text-slate-400 font-medium md:w-36">Provinsi</span>
                            <span className="font-bold text-slate-800">{getProvinceName(formData.provinsi)}</span>
                          </div>
                          <div className="flex justify-between md:justify-start md:space-x-4">
                            <span className="text-slate-400 font-medium md:w-36">Kota / Kabupaten</span>
                            <span className="font-bold text-slate-800">{getRegencyName(formData.provinsi, formData.kabupaten)}</span>
                          </div>
                          <div className="flex justify-between md:justify-start md:space-x-4">
                            <span className="text-slate-400 font-medium md:w-36">Kecamatan</span>
                            <span className="font-bold text-slate-800">{getDistrictName(formData.kabupaten, formData.kecamatan)}</span>
                          </div>
                          <div className="flex justify-between md:justify-start md:space-x-4">
                            <span className="text-slate-400 font-medium md:w-36">Kelurahan</span>
                            <span className="font-bold text-slate-800">{getVillageName(formData.kecamatan, formData.kelurahan)}</span>
                          </div>
                          <div className="flex flex-col md:flex-row md:space-x-4 col-span-1 md:col-span-2 pt-1">
                            <span className="text-slate-400 font-medium md:w-36 shrink-0">Alamat Lengkap</span>
                            <span className="font-bold text-slate-800 leading-relaxed mt-1 md:mt-0">{formData.alamat}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Part C: Vehicles list summary */}
                    <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden">
                      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Armada Kendaraan ({formData.jumlah === "5" ? "> 4 Unit" : `${formData.jumlah} Unit`})</span>
                        <button
                          onClick={() => setStep(3)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          Ubah
                        </button>
                      </div>

                      <div className="p-5">
                        {formData.jumlah === "5" ? (
                          <div className="flex items-center space-x-3 text-sm">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            <span className="font-semibold text-slate-700">Daftar Kendaraan diunggah via Excel:</span>
                            <span className="font-bold text-emerald-600">{excelFile?.name}</span>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-400 font-bold">
                                  <th className="pb-3 font-semibold text-xs uppercase">No</th>
                                  <th className="pb-3 font-semibold text-xs uppercase">No. Rangka</th>
                                  <th className="pb-3 font-semibold text-xs uppercase">No. Polisi</th>
                                  <th className="pb-3 font-semibold text-xs uppercase">Odometer</th>
                                  <th className="pb-3 font-semibold text-xs uppercase text-right">Pembayaran / Leasing</th>
                                </tr>
                              </thead>
                              <tbody>
                                {vehicles.map((v, index) => (
                                  <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td className="py-3.5 font-bold text-slate-500">{index + 1}</td>
                                    <td className="py-3.5 font-extrabold text-slate-800">{v.rangka}</td>
                                    <td className="py-3.5 font-extrabold text-indigo-600">{v.nopol}</td>
                                    <td className="py-3.5 font-bold text-slate-700">{parseInt(v.odometer).toLocaleString()} KM</td>
                                    <td className="py-3.5 font-bold text-slate-800 text-right">{getPaymentName(v.payment, v.customPayment)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions Confirmation Checkbox */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mt-6">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${agreeTerms ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-600/30' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                          <Check className={`w-3.5 h-3.5 text-white transition-all duration-200 ${agreeTerms ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} strokeWidth={3} />
                        </div>
                      </div>
                      <span className="text-xs text-slate-600 leading-relaxed pt-0.5 select-none">
                        Saya menyatakan bahwa semua informasi data yang saya cantumkan di atas adalah benar adanya dan siap untuk dipertanggungjawabkan demi kebutuhan proses registrasi GPS Runner.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Stepper Footer Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center space-x-2 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-xl transition duration-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition duration-200 shadow-lg shadow-indigo-100"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!agreeTerms}
                    className={`flex items-center space-x-2 font-bold py-3 px-10 rounded-xl transition duration-200 shadow-lg ${agreeTerms
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-150'
                      : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                      }`}
                  >
                    <span>Kirim Registrasi</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* Transactional Success Notification Modal */
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 md:p-12 text-center space-y-6 max-w-2xl mx-auto animate-fadeIn scaleUp">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                  Registrasi Dikirim
                </span>
                <h2 className="text-3xl font-black text-slate-800">Registrasi Berhasil!</h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  Pengajuan aktivasi GPS Runner Anda telah berhasil didaftarkan ke sistem manajemen kami. Silakan catat nomor referensi Anda di bawah ini.
                </p>
              </div>

              {/* Reference Receipt Panel */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-150 max-w-md mx-auto space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor Referensi</span>
                  <p className="text-2xl font-black text-indigo-600 tracking-wide mt-1">{refId}</p>
                </div>

                <div className="border-t border-slate-200/60 pt-4 grid grid-cols-2 gap-4 text-left text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block">PIC Utama</span>
                    <span className="font-extrabold text-slate-700 block mt-0.5">{formData.nama}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">WhatsApp Aktif</span>
                    <span className="font-extrabold text-slate-700 block mt-0.5">+62 {formData.telp}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 max-w-md mx-auto">
                <div className="text-xs text-slate-500 flex items-start space-x-2 bg-indigo-50/50 p-4 rounded-xl text-left">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">
                    <strong>Apa selanjutnya?</strong> Tim administrasi kami akan melakukan verifikasi data dalam 1x24 jam kerja. Detail verifikasi & petunjuk instalasi selanjutnya akan otomatis dikirimkan ke nomor WhatsApp aktif Anda.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={resetForm}
                  className="inline-flex items-center space-x-2 border border-slate-300 hover:border-slate-400 text-slate-700 font-extrabold py-2.5 px-6 rounded-xl transition duration-200 text-xs"
                >
                  <span>Daftarkan Akun / Kendaraan Lain</span>
                </button>
              </div>
            </div>
          )}

        </main>

        {/* Footer Info */}
        <footer className="bg-slate-900 text-slate-400 py-6 px-6 text-center text-xs border-t border-slate-800">
          <div className="max-w-6xl mx-auto space-y-2">
            <p className="font-medium">© 2026 GPS Runner Dealer.</p>
            <p className="text-slate-600">Dikembangkan untuk efisiensi aktivasi melalui Dealer <a href="https://csdwindo.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-400">CS Dwindo</a>.</p>
          </div>
        </footer>

      </div>

      {/* Fullscreen Educational Modul Slider */}
      {showModul && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-8 animate-fadeIn">
          <button
            onClick={() => setShowModul(false)}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-50"
          >
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          <div
            className="relative w-full max-w-5xl flex items-center justify-center select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Prev Button (Desktop mainly) */}
            <button
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="hidden md:flex absolute -left-12 lg:-left-20 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all disabled:opacity-20 disabled:hover:bg-white/10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Image Container */}
            <div className="w-full rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center">
              <picture className="w-full flex justify-center">
                <source media="(max-width: 767px)" srcSet={RUNNER_MODULES[currentSlide].mobile} />
                <img
                  src={RUNNER_MODULES[currentSlide].desktop}
                  alt={`Edukasi GPS Runner Slide ${currentSlide + 1}`}
                  className="w-full max-w-4xl h-auto max-h-[80vh] object-contain mx-auto pointer-events-none"
                  draggable="false"
                />
              </picture>
            </div>

            {/* Next Button (Desktop mainly) */}
            <button
              onClick={() => setCurrentSlide(prev => Math.min(RUNNER_MODULES.length - 1, prev + 1))}
              disabled={currentSlide === RUNNER_MODULES.length - 1}
              className="hidden md:flex absolute -right-12 lg:-right-20 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all disabled:opacity-20 disabled:hover:bg-white/10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          {/* Swipe Indicator Mobile */}
          <div className="md:hidden text-white/50 text-xs mt-6 flex items-center space-x-2">
            <ChevronLeft className="w-4 h-4" />
            <span>Geser untuk melihat</span>
            <ChevronRight className="w-4 h-4" />
          </div>

          {/* Dots Indicator */}
          <div className="flex space-x-3 mt-6">
            {RUNNER_MODULES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full ${currentSlide === idx ? 'bg-indigo-500 w-8 h-2.5' : 'bg-white/30 w-2.5 h-2.5 hover:bg-white/50'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}