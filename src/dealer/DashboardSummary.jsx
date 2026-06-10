import React, { useState, useEffect } from 'react';
import { Users, Car, Ticket, Activity, AlertTriangle, Copy, PhoneCall } from 'lucide-react';
import { getDealerSummary } from '../../api/client';

export default function DashboardSummary() {
  const [summary, setSummary] = useState({ 
    customers: 0, customers_status: [],
    vehicles: 0, vehicles_status: [],
    tickets: 0, tickets_status: [],
    dup_contacts: 0, zero_vehicles_cust: 0, dup_vehicles: 0, 
    dup_contacts_data: [], zero_vehicles_data: [], dup_vehicles_data: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getDealerSummary();
        setSummary(data);
      } catch (err) {
        setError('Gagal memuat data ringkasan.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const stats = [
    { name: 'Total Customers', value: summary.customers, statusBreakdown: summary.customers_status, icon: Users, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
    { name: 'Total Vehicles', value: summary.vehicles, statusBreakdown: summary.vehicles_status, icon: Car, color: 'bg-indigo-500', bgColor: 'bg-indigo-50' },
    { name: 'Total Tickets', value: summary.tickets, statusBreakdown: summary.tickets_status, icon: Ticket, color: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
    { id: 'dup_contacts', name: 'Kontak Ganda (Telp/Email)', value: summary.dup_contacts, icon: PhoneCall, color: 'bg-rose-500', bgColor: 'bg-rose-50' },
    { id: 'zero_vehicles_cust', name: 'Customer 0 Kendaraan', value: summary.zero_vehicles_cust, icon: AlertTriangle, color: 'bg-orange-500', bgColor: 'bg-orange-50' },
    { id: 'dup_vehicles', name: 'Kendaraan Ganda (Rangka)', value: summary.dup_vehicles, icon: Copy, color: 'bg-amber-500', bgColor: 'bg-amber-50' },
  ];

  const renderExpandedData = () => {
    if (expandedCard === 'dup_contacts') {
      const data = summary.dup_contacts_data || [];
      if (data.length === 0) return <div className="p-6 text-center text-slate-500">Tidak ada data duplikat.</div>;
      return (
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
            <tr><th className="px-6 py-3">Nama Customer</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">Telp</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-800">{item.nama}</td>
                <td className="px-6 py-3">{item.email || '-'}</td>
                <td className="px-6 py-3">{item.telp || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (expandedCard === 'zero_vehicles_cust') {
      const data = summary.zero_vehicles_data || [];
      if (data.length === 0) return <div className="p-6 text-center text-slate-500">Semua customer memiliki kendaraan.</div>;
      return (
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
            <tr><th className="px-6 py-3">Nama Customer</th><th className="px-6 py-3">Username</th><th className="px-6 py-3">Perusahaan</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-800">{item.nama}</td>
                <td className="px-6 py-3">{item.username}</td>
                <td className="px-6 py-3">{item.company || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (expandedCard === 'dup_vehicles') {
      const data = summary.dup_vehicles_data || [];
      if (data.length === 0) return <div className="p-6 text-center text-slate-500">Tidak ada kendaraan duplikat.</div>;
      return (
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
            <tr><th className="px-6 py-3">Nopol</th><th className="px-6 py-3">Rangka</th><th className="px-6 py-3">Nama Customer</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-800">{item.nopol}</td>
                <td className="px-6 py-3 font-mono text-xs">{item.rangka}</td>
                <td className="px-6 py-3">{item.customer_name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Activity className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  if (error) {
    return <div className="p-4 bg-rose-50 text-rose-600 rounded-xl">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Summary</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center space-x-4 transition-all ${stat.id ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md' : ''} ${expandedCard === stat.id && stat.id ? 'ring-2 ring-indigo-500 border-transparent' : ''}`}
              onClick={() => {
                if (stat.id) {
                  setExpandedCard(expandedCard === stat.id ? null : stat.id);
                }
              }}
            >
              <div className={`p-4 rounded-xl ${stat.bgColor}`}>
                <Icon className={`w-8 h-8 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                {stat.statusBreakdown && stat.statusBreakdown.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {stat.statusBreakdown.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {s.status || 'New'}: {s.count}
                      </span>
                    ))}
                  </div>
                )}
                {stat.id && <p className="text-[10px] text-indigo-500 font-medium mt-1">Klik untuk detail</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Details Section */}
      {expandedCard && (
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-800">
              Detail: {stats.find(s => s.id === expandedCard)?.name}
            </h3>
            <button 
              onClick={() => setExpandedCard(null)} 
              className="text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors"
            >
              Tutup
            </button>
          </div>
          <div className="overflow-x-auto">
            {renderExpandedData()}
          </div>
        </div>
      )}
    </div>
  );
}
