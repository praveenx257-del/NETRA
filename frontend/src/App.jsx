import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Camera, CheckSquare, Send, Building2, AlertTriangle, FileText } from 'lucide-react';

const API_BASE = 'https://netra-backend-xyz.onrender.com'; // Replace with your Render URL

export default function App() {
  const [form, setForm] = useState({
    project_id: 'MPLAD-2026-DHN-04',
    district: 'Dhanbad',
    work_name: 'Construction of concrete road in ward 4 sector 2',
    sanction_amount: 4500000,
    district_mean_cost: 1100000,
    physical_progress: 0,
    funds_released: 3500000
  });

  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoResult, setPhotoResult] = useState(null);
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/feedback-logs`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/evaluate-work`, form);
      setEvaluation(res.data);
    } catch (err) {
      alert('Failed to connect to backend.');
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
      const res = await axios.post(`${API_BASE}/api/verify-photo`, data);
      setPhotoResult(res.data);
    } catch (err) {
      alert('Photo verification endpoint error.');
    }
  };

  const handleFeedback = async (decision) => {
    if (!evaluation) return;
    try {
      await axios.post(`${API_BASE}/api/officer-feedback`, {
        project_id: evaluation.project_id,
        decision,
        officer_notes: `Marked by Nodal Officer as ${decision}`
      });
      fetchLogs();
      alert(`Audit recorded: ${decision}`);
    } catch (err) {
      alert('Failed to save feedback');
    }
  };

  const badgeColor = {
    Priority: 'bg-red-600 text-white border-red-700',
    Review: 'bg-orange-500 text-white border-orange-600',
    Watch: 'bg-amber-400 text-slate-900 border-amber-500',
    Low: 'bg-emerald-700 text-white border-emerald-800'
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* GIGW Official Top Bar */}
      <div className="bg-slate-900 text-white text-[11px] uppercase tracking-wider py-1.5 px-6 flex justify-between items-center">
        <div className="flex gap-4">
          <span>भारत सरकार | Government of India</span>
          <span className="hidden md:inline">सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय | Ministry of Statistics and Programme Implementation</span>
        </div>
        <div>Skip to Main Content | A- A A+</div>
      </div>

      {/* Official Header */}
      <header className="bg-white border-b-4 border-orange-500 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Building2 size={40} className="text-blue-900" />
          <div>
            <h1 className="text-2xl font-black text-blue-900 tracking-tight">e-SAKSHI : NETRA</h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">AI-Powered MPLADS Monitoring Dashboard</p>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs px-3 py-1 rounded font-bold">
            Authorized Nodal Officer Login
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Data Ingestion */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded border border-slate-200 shadow-sm border-t-4 border-t-blue-900">
            <h2 className="text-lg font-bold flex items-center gap-2 text-blue-900 mb-4 border-b pb-2">
              <FileText size={18} /> Ingest Work Proposal
            </h2>
            <form onSubmit={handleEvaluate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Project ID</label>
                  <input className="w-full border p-2 rounded text-sm mt-1 bg-slate-50" value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">District</label>
                  <input className="w-full border p-2 rounded text-sm mt-1 bg-slate-50" value={form.district} onChange={e => setForm({...form, district: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Detailed Work Description</label>
                <textarea rows="2" className="w-full border p-2 rounded text-sm mt-1 bg-slate-50" value={form.work_name} onChange={e => setForm({...form, work_name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Sanction Cost (₹)</label>
                  <input type="number" className="w-full border p-2 rounded text-sm mt-1 bg-slate-50" value={form.sanction_amount} onChange={e => setForm({...form, sanction_amount: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">District Mean (₹)</label>
                  <input type="number" className="w-full border p-2 rounded text-sm mt-1 bg-slate-50" value={form.district_mean_cost} onChange={e => setForm({...form, district_mean_cost: parseFloat(e.target.value) || 0})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Physical Progress (%)</label>
                  <input type="number" className="w-full border p-2 rounded text-sm mt-1 bg-slate-50" value={form.physical_progress} onChange={e => setForm({...form, physical_progress: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Funds Released (₹)</label>
                  <input type="number" className="w-full border p-2 rounded text-sm mt-1 bg-slate-50" value={form.funds_released} onChange={e => setForm({...form, funds_released: parseFloat(e.target.value) || 0})} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded text-sm transition shadow-md flex justify-center items-center gap-2">
                <Send size={16} /> {loading ? 'Processing via NETRA Engine...' : 'Execute Risk Assessment'}
              </button>
            </form>
          </section>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded border border-slate-200 shadow-sm border-t-4 border-t-orange-500">
            <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2 border-b pb-2">
              <ShieldCheck size={18} /> Official Risk Verdict
            </h2>
            {evaluation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-100 p-3 rounded border border-slate-300">
                  <span className="font-mono text-sm font-bold text-slate-800">{evaluation.project_id}</span>
                  <span className={`px-4 py-1.5 rounded text-xs font-black uppercase border shadow-sm ${badgeColor[evaluation.risk_tier]}`}>
                    {evaluation.risk_tier} RISK
                  </span>
                </div>

                <div className="bg-red-50 p-4 rounded border border-red-200 text-sm space-y-2">
                  <div className="font-bold text-red-900 flex items-center gap-2"><AlertTriangle size={16}/> AI Audit Explanation:</div>
                  <ul className="list-disc pl-5 space-y-1 text-red-800 font-medium">
                    {evaluation.flags.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-white border border-slate-200 p-3 rounded shadow-sm">
                    <span className="text-slate-500 block font-bold mb-1">Cost Variance</span>
                    <span className="font-black text-lg text-blue-900">{evaluation.metrics.deviation_ratio}x</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded shadow-sm">
                    <span className="text-slate-500 block font-bold mb-1">Benford Index</span>
                    <span className="font-black text-lg text-blue-900">{evaluation.metrics.benford_score}</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded shadow-sm">
                    <span className="text-slate-500 block font-bold mb-1">NLP Duplicate</span>
                    <span className="font-black text-lg text-blue-900">{evaluation.metrics.max_title_similarity}%</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button onClick={() => handleFeedback('Valid Anomaly')} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-xs shadow">Confirm Anomaly (Block Funds)</button>
                  <button onClick={() => handleFeedback('False Positive')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-xs shadow">Clear Verification (Proceed)</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic text-center py-8">Awaiting project submission for AI auditing.</p>
            )}
          </section>

          <section className="bg-white p-6 rounded border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 text-blue-900 border-b pb-2 mb-4">
              <Camera size={18} /> Asset Photo Forensics
            </h2>
            <form onSubmit={handleUpload} className="flex gap-3 bg-slate-50 p-3 rounded border border-slate-200">
              <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-100 file:text-blue-900 file:font-bold w-full" />
              <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-4 py-2 rounded font-bold whitespace-nowrap">Verify Asset</button>
            </form>
          </section>
        </div>
      </div>

      {/* Official Government Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center mt-12 border-t-4 border-green-600">
        <p className="text-xs font-semibold mb-2">Designed, Developed and Hosted by <span className="text-white">National Informatics Centre (NIC)</span></p>
        <p className="text-[10px]">Ministry of Electronics & Information Technology, Government of India</p>
        <p className="text-[10px] mt-2 italic">Deployed securely on MeghRaj Government Cloud Infrastructure</p>
      </footer>
    </div>
  );
}