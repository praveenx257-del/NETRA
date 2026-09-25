import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Camera, CheckSquare, Activity, FileText, AlertTriangle, Landmark, Server, Loader2 } from 'lucide-react';

// ⚠️ REPLACE THIS WITH YOUR EXACT RENDER URL (NO TRAILING SLASH)
// Example: 'https://netra-backend-abc.onrender.com'
const API_BASE = 'https://netra-dashboard-ezqjb5po0-netra16.vercel.app';

export default function App() {
  const [form, setForm] = useState({
    project_id: 'MPLAD-26-DHN-0042',
    district: 'Dhanbad',
    work_name: 'Construction of concrete approach road and drainage near IIT campus',
    sanction_amount: 4500000,
    district_mean_cost: 1100000,
    physical_progress: 0,
    funds_released: 3500000
  });

  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [photoFile, setPhotoFile] = useState(null);
  const [photoResult, setPhotoResult] = useState(null);
  const [logs, setLogs] = useState([]);

  // Create an Axios instance with a 60-second timeout to handle Render's cold boot
  const api = axios.create({
    baseURL: API_BASE,
    timeout: 60000, 
  });

  const checkServerStatus = async () => {
    try {
      setServerStatus('checking');
      const res = await api.get('/api/feedback-logs');
      setLogs(res.data);
      setServerStatus('online');
    } catch (err) {
      console.error("Backend connection failed:", err);
      setServerStatus('offline');
    }
  };

  useEffect(() => {
    if (API_BASE === 'YOUR_RENDER_URL_HERE') {
      setServerStatus('offline');
    } else {
      checkServerStatus();
    }
  }, []);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEvaluation(null);
    try {
      const res = await api.post('/api/evaluate-work', form);
      setEvaluation(res.data);
      setServerStatus('online'); // Confirm online if it succeeds
    } catch (err) {
      alert(`Connection failed. Ensure ${API_BASE} is correct and the server is awake.`);
      setServerStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoFile) return;
    const data = new FormData();
    data.append('project_id', form.project_id);
    data.append('file', photoFile);

    try {
      const res = await api.post('/api/verify-photo', data);
      setPhotoResult(res.data);
    } catch (err) {
      alert('Photo verification failed. Check connection.');
    }
  };

  const handleFeedback = async (decision) => {
    if (!evaluation) return;
    try {
      await api.post('/api/officer-feedback', {
        project_id: evaluation.project_id,
        decision,
        officer_notes: `Marked by Nodal Officer as ${decision}`
      });
      checkServerStatus(); // Refresh logs
      alert(`Official Audit Recorded: ${decision}`);
    } catch (err) {
      alert('Failed to save official feedback to ledger.');
    }
  };

  const badgeColor = {
    Priority: 'bg-[#b91c1c] text-white border border-[#7f1d1d]',
    Review: 'bg-[#c2410c] text-white border border-[#9a3412]',
    Watch: 'bg-[#f59e0b] text-black border border-[#d97706]',
    Low: 'bg-[#15803d] text-white border border-[#14532d]'
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans">
      {/* Tricolor Top Strip */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      {/* Official Government Header */}
      <header className="bg-[#0f172a] text-white shadow-md border-b-4 border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Landmark size={36} className="text-[#e2e8f0]" />
            <div>
              <div className="text-[11px] font-bold tracking-widest text-[#94a3b8] uppercase mb-1">
                Government of India | Ministry of Statistics and Programme Implementation
              </div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                MPLADS <span className="font-light text-[#cbd5e1]">| NETRA AI Node</span>
              </h1>
            </div>
          </div>
          
          {/* Live Server Status Badge */}
          <div className="flex items-center gap-3 bg-[#1e293b] px-4 py-2 rounded shadow-inner border border-[#334155]">
            <Server size={16} className="text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Engine Status:</span>
            {serverStatus === 'checking' && <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold"><Loader2 size={12} className="animate-spin"/> BOOTING</span>}
            {serverStatus === 'online' && <span className="flex items-center gap-1 text-[#4ade80] text-xs font-bold"><span className="h-2 w-2 bg-[#4ade80] rounded-full animate-pulse"></span> ONLINE</span>}
            {serverStatus === 'offline' && <span className="flex items-center gap-1 text-[#f87171] text-xs font-bold"><span className="h-2 w-2 bg-[#f87171] rounded-full"></span> OFFLINE</span>}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        
        {/* LEFT COLUMN: Data Ingestion */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-[#f8fafc] border-b border-slate-200 px-5 py-3 flex items-center gap-2">
              <FileText size={18} className="text-[#334155]" />
              <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-wide">Work Proposal Ingestion Form</h2>
            </div>
            
            <form onSubmit={handleEvaluate} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Sanction ID</label>
                  <input
                    className="w-full border border-slate-300 p-2 text-sm focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] outline-none rounded-sm bg-slate-50"
                    value={form.project_id}
                    onChange={e => setForm({...form, project_id: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Implementing District</label>
                  <input
                    className="w-full border border-slate-300 p-2 text-sm focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] outline-none rounded-sm bg-slate-50"
                    value={form.district}
                    onChange={e => setForm({...form, district: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Detailed Work Description</label>
                <textarea
                  rows="2"
                  className="w-full border border-slate-300 p-2 text-sm focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] outline-none rounded-sm bg-slate-50"
                  value={form.work_name}
                  onChange={e => setForm({...form, work_name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-5 p-4 bg-[#f8fafc] border border-slate-200 rounded-sm">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Sanctioned Cost (₹)</label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 p-2 text-sm focus:border-[#1d4ed8] outline-none rounded-sm bg-white"
                    value={form.sanction_amount}
                    onChange={e => setForm({...form, sanction_amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">District Baseline Mean (₹)</label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 p-2 text-sm focus:border-[#1d4ed8] outline-none rounded-sm bg-white text-slate-500"
                    value={form.district_mean_cost}
                    onChange={e => setForm({...form, district_mean_cost: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Reported Physical Progress (%)</label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 p-2 text-sm focus:border-[#1d4ed8] outline-none rounded-sm bg-slate-50"
                    value={form.physical_progress}
                    onChange={e => setForm({...form, physical_progress: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Total Funds Released (₹)</label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 p-2 text-sm focus:border-[#1d4ed8] outline-none rounded-sm bg-slate-50"
                    value={form.funds_released}
                    onChange={e => setForm({...form, funds_released: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || serverStatus === 'offline'}
                className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] disabled:bg-slate-400 text-white font-bold py-3 text-sm transition shadow-sm flex justify-center items-center gap-2 rounded-sm"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> EXECUTING ML INFERENCE...</>
                ) : serverStatus === 'offline' ? (
                  'BACKEND OFFLINE - CHECK CONFIGURATION'
                ) : (
                  <><Activity size={16} /> INITIALIZE AI RISK ASSESSMENT</>
                )}
              </button>
              {loading && <p className="text-center text-[10px] text-slate-500 mt-2">Note: Render free tier cold-starts may take up to 50 seconds on the first request.</p>}
            </form>
          </section>
        </div>

        {/* RIGHT COLUMN: Output & Forensics */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Verdict Card */}
          <section className="bg-white rounded border border-slate-300 shadow-sm overflow-hidden min-h-[300px]">
            <div className="bg-[#0f172a] border-b border-slate-800 px-5 py-3 flex items-center gap-2 text-white">
              <ShieldCheck size={18} className="text-[#38bdf8]" />
              <h2 className="text-sm font-bold uppercase tracking-wide">Automated Audit Verdict</h2>
            </div>
            
            <div className="p-6">
              {evaluation ? (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Subject File</span>
                    <span className="font-mono text-sm font-bold text-[#0f172a]">{evaluation.project_id}</span>
                  </div>

                  <div className={`p-4 rounded-sm flex items-center justify-between ${badgeColor[evaluation.risk_tier]}`}>
                    <span className="text-xs font-bold uppercase tracking-wider">Computed Risk Tier</span>
                    <span className="text-lg font-black tracking-widest">{evaluation.risk_tier}</span>
                  </div>

                  <div className="bg-[#fffbeb] border border-[#fde68a] p-4 rounded-sm text-sm space-y-2">
                    <div className="text-[11px] font-bold text-[#b45309] uppercase flex items-center gap-1">
                      <AlertTriangle size={14}/> Detection Signatures
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-[#92400e] text-xs font-medium">
                      {evaluation.flags.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-3 gap-px bg-slate-200 border border-slate-200">
                    <div className="bg-white p-3 text-center">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Cost Dev.</span>
                      <span className="font-mono font-bold text-[#0f172a] text-sm">{evaluation.metrics.deviation_ratio}x</span>
                    </div>
                    <div className="bg-white p-3 text-center">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Benford Idx</span>
                      <span className="font-mono font-bold text-[#0f172a] text-sm">{evaluation.metrics.benford_score}</span>
                    </div>
                    <div className="bg-white p-3 text-center">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">NLP Match</span>
                      <span className="font-mono font-bold text-[#0f172a] text-sm">{evaluation.metrics.max_title_similarity}%</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-slate-200">
                    <button onClick={() => handleFeedback('Confirmed Misappropriation')} className="flex-1 bg-white border border-[#b91c1c] text-[#b91c1c] hover:bg-[#fef2f2] font-bold py-2 text-[11px] uppercase tracking-wide rounded-sm transition">
                      Confirm Anomaly
                    </button>
                    <button onClick={() => handleFeedback('Authorized Exception')} className="flex-1 bg-white border border-[#15803d] text-[#15803d] hover:bg-[#f0fdf4] font-bold py-2 text-[11px] uppercase tracking-wide rounded-sm transition">
                      Mark Exception
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 space-y-3">
                  <ShieldCheck size={48} className="opacity-20" />
                  <p className="text-xs font-medium uppercase tracking-widest">Awaiting File Submission</p>
                </div>
              )}
            </div>
          </section>

          {/* Photo Forensics */}
          <section className="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-[#f8fafc] border-b border-slate-200 px-5 py-3 flex items-center gap-2">
              <Camera size={18} className="text-[#334155]" />
              <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-wide">Visual Asset Forensics</h2>
            </div>
            <div className="p-5 space-y-4">
              <form onSubmit={handlePhotoUpload} className="flex flex-col gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setPhotoFile(e.target.files[0])}
                  className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-bold file:bg-[#e2e8f0] file:text-[#0f172a] hover:file:bg-[#cbd5e1] border border-slate-200 p-1 rounded-sm w-full"
                />
                <button type="submit" disabled={serverStatus === 'offline'} className="bg-[#334155] hover:bg-[#0f172a] disabled:bg-slate-300 text-white text-xs py-2.5 rounded-sm font-bold uppercase tracking-wider transition w-full">
                  Run pHash Integrity Scan
                </button>
              </form>
              
              {photoResult && (
                <div className={`p-4 rounded-sm border ${photoResult.is_tampered_or_duplicate ? 'bg-[#fef2f2] border-[#fca5a5] text-[#991b1b]' : 'bg-[#f0fdf4] border-[#86efac] text-[#166534]'}`}>
                  <div className="text-xs font-bold uppercase tracking-wide mb-1">{photoResult.status}</div>
                  <div className="text-[10px] font-mono break-all opacity-80">Fingerprint: {photoResult.photo_hash}</div>
                </div>
              )}
            </div>
          </section>

          {/* Central Log */}
          <section className="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
             <div className="bg-[#f8fafc] border-b border-slate-200 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-[#334155]" />
                <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-wide">Central Audit Ledger</h2>
              </div>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-sm">{logs.length} RECORDS</span>
            </div>
            <div className="p-0">
              <ul className="text-xs divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {logs.length === 0 && (
                   <li className="p-4 text-center text-slate-400 font-medium italic">No manual audits recorded.</li>
                )}
                {logs.map((log, index) => (
                  <li key={index} className="p-3 px-5 flex justify-between items-center hover:bg-slate-50">
                    <span className="font-mono text-slate-600">{log.project_id}</span>
                    <span className={`font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm ${log.decision === 'Confirmed Misappropriation' ? 'bg-[#fef2f2] text-[#991b1b]' : 'bg-[#f0fdf4] text-[#166534]'}`}>
                      {log.decision}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}