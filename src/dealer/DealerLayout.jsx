import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Ticket, Users, Truck, LogOut, Menu, X, Activity, AlertCircle } from 'lucide-react';

export default function DealerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('dealer_auth');
    navigate('/dealer/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dealer', icon: LayoutDashboard, exact: true },
    { name: 'Tickets', path: '/dealer/tickets', icon: Ticket },
    { name: 'Customers', path: '/dealer/customers', icon: Users },
    { name: 'Vehicles', path: '/dealer/vehicles', icon: Truck },
    { name: 'Engagement', path: '/dealer/engagement', icon: Activity },
    { name: 'Need Attention', path: '/dealer/need-attention', icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
            title="Kembali ke Halaman Awal"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/favicon.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-slate-800">Runner Dealer</span>
          </div>
          <button 
            className="ml-auto lg:hidden text-slate-500"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700 font-medium' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-rose-600 rounded-xl hover:bg-rose-50 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="ml-auto flex items-center">
            <span 
              className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full cursor-pointer select-none"
              onClick={() => setShowPinModal(true)}
            >
              Admin Session
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowPinModal(false); setPinInput(''); }}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Masukkan PIN</h3>
              <button onClick={() => { setShowPinModal(false); setPinInput(''); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6">
              <input 
                type="password" 
                value={pinInput} 
                onChange={(e) => setPinInput(e.target.value)} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (pinInput === '1066') {
                      setShowPinModal(false);
                      setPinInput('');
                      navigate('/dealer/backup');
                    } else {
                      alert('PIN salah!');
                      setPinInput('');
                    }
                  }
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 text-center tracking-widest text-lg" 
                placeholder="****"
                autoFocus
              />
              <button 
                onClick={() => {
                  if (pinInput === '1066') {
                    setShowPinModal(false);
                    setPinInput('');
                    navigate('/dealer/backup');
                  } else {
                    alert('PIN salah!');
                    setPinInput('');
                  }
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Masuk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
