import React, { useState } from 'react';
import { 
  Search, Download, IndianRupee, FileText, PieChart, Users, 
  CheckCircle2, Hourglass, AlertTriangle, Info, MapPin, 
  BarChart2, MessageSquare, Home, ShieldAlert
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('Overview');

  // Exact data replication from the reference image
  const metrics = [
    {
      id: 1,
      title: 'TOTAL ALLOCATED',
      value: '11,681.9 CR',
      subtext: 'Total funds allocated to MPs\nBoth Houses - Lok Sabha 2024-29',
      icon: IndianRupee,
      color: 'bg-blue-100 text-blue-600',
      hasInfo: false
    },
    {
      id: 2,
      title: 'TOTAL EXPENDITURE',
      value: '3,995.3 CR',
      subtext: 'Vendor expenditure recorded for completed and ongoing works\nBoth Houses - Lok Sabha 2024-29',
      icon: FileText,
      color: 'bg-emerald-100 text-emerald-600',
      hasInfo: false
    },
    {
      id: 3,
      title: 'FUND UTILIZATION',
      value: '67.7%',
      subtext: 'Share of allocation recommended by MPs\nBoth Houses - Lok Sabha 2024-29',
      icon: PieChart,
      color: 'bg-yellow-100 text-yellow-600',
      hasInfo: true
    },
    {
      id: 4,
      title: 'EXPENDITURE RATE',
      value: '34.2%',
      subtext: 'Vendor expenditure recorded as a share of allocation\nBoth Houses - Lok Sabha 2024-29',
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
      hasInfo: true
    },
    {
      id: 5,
      title: 'TOTAL MPs',
      value: '774',
      subtext: 'Number of MPs in the system\nBoth Houses - Lok Sabha 2024-29',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      hasInfo: true
    },
    {
      id: 6,
      title: 'WORKS COMPLETED',
      value: '44,028 (₹2,408.7 CR)',
      subtext: 'Total completed projects and their value\nBoth Houses - Lok Sabha 2024-29',
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-600',
      hasInfo: false
    },
    {
      id: 7,
      title: 'WORKS PENDING',
      value: '87,113',
      subtext: 'Projects yet to be completed\nBoth Houses - Lok Sabha 2024-29',
      icon: Hourglass,
      color: 'bg-yellow-100 text-yellow-600',
      hasInfo: false
    },
    {
      id: 8,
      title: 'ONGOING-WORK PAYMENTS',
      value: '1,586.7 CR',
      subtext: 'Vendor payments linked to works not yet marked complete\nBoth Houses - Lok Sabha 2024-29',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-500',
      hasInfo: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-800">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <span className="text-[#b48e4b] font-serif text-xl font-medium leading-tight">MPLADS Dashboard</span>
            <span className="text-blue-700 text-[10px] font-bold tracking-widest leading-tight">EMPOWERED INDIAN</span>
          </div>

          <div className="flex items-center space-x-1">
            <button className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-md text-sm font-semibold">
              <Home size={16} /> Overview
            </button>
            <button className="flex items-center gap-2 text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium transition">
              <Search size={16} /> Find Projects
            </button>
            <button className="flex items-center gap-2 text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium transition">
              <MapPin size={16} /> Browse States
            </button>
            <button className="flex items-center gap-2 text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium transition">
              <Users size={16} /> Browse MPs
            </button>
            <button className="flex items-center gap-2 text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium transition">
              <BarChart2 size={16} /> Compare
            </button>
            <button className="flex items-center gap-2 text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium transition">
              <MessageSquare size={16} /> Feedback
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">House</span>
              <select className="border border-slate-300 rounded px-2 py-1 text-slate-700 bg-white outline-none">
                <option>Both Houses</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">LS Term</span>
              <select className="border border-slate-300 rounded px-2 py-1 text-slate-700 bg-white outline-none opacity-50">
                <option>18th</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-3 text-xs font-medium text-slate-500">
        Home / <span className="text-slate-800">MPLADS</span>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 pb-12">
        {/* Gradient Line Accent */}
        <div className="w-full h-0.5 bg-gradient-to-r from-blue-700 via-orange-400 to-emerald-600 mb-8 mt-2"></div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-[2.25rem] text-[#2c3e50] font-serif mb-3">MPLADS Dashboard</h1>
          <p className="text-slate-600 text-sm font-medium">Overview of Member of Parliament Local Area Development Scheme</p>
        </div>

        {/* Search and Export Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search MPs or Constituencies..." 
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
          
          <button className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
            <Download size={16} /> Export Data <span className="ml-1 text-[10px]">▼</span>
          </button>
        </div>

        {/* Grid of Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {metrics.map((metric) => (
            <div key={metric.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${metric.color}`}>
                    <metric.icon size={18} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-500 tracking-wider uppercase flex items-center gap-1">
                    {metric.title}
                    {metric.hasInfo && <Info size={14} className="text-blue-600 cursor-pointer" />}
                  </h3>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-serif text-slate-800 tracking-tight mb-2">
                  {metric.value}
                </div>
                <p className="text-[10px] text-slate-500 leading-tight whitespace-pre-line">
                  {metric.subtext}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* AI NETRA Integration Section (Matches the theme) */}
        <div className="mt-12">
          <div className="w-full h-px bg-slate-200 mb-8"></div>
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="text-blue-700" size={28} />
            <div>
              <h2 className="text-2xl text-[#2c3e50] font-serif">NETRA AI Intelligence Alerts</h2>
              <p className="text-slate-600 text-sm font-medium">Real-time anomaly detection across ongoing projects</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f9fa] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase text-xs tracking-wider">Sanction ID</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase text-xs tracking-wider">Project Description</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase text-xs tracking-wider">AI Flag Reason</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase text-xs tracking-wider">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-slate-700">PRJ_26_DHN</td>
                  <td className="px-6 py-4 text-slate-600">Construction of concrete approach road and drainage near IIT campus</td>
                  <td className="px-6 py-4 text-red-600 text-xs font-medium">Cost deviation is 4.09x higher than historical average.</td>
                  <td className="px-6 py-4"><span className="bg-red-100 text-red-700 px-3 py-1 rounded text-[10px] font-bold uppercase">Priority</span></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-slate-700">PRJ_26_RNC</td>
                  <td className="px-6 py-4 text-slate-600">Solar street lights installation in Ward 12</td>
                  <td className="px-6 py-4 text-yellow-600 text-xs font-medium">Duplicate Risk: 85% text match with prior sanction.</td>
                  <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-[10px] font-bold uppercase">Watch</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}