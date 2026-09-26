import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, Camera, CheckSquare, Layers, Send, 
  Search, Home, MapPin, Users, BarChart2, MessageSquare 
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

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
      alert('Failed to connect to backend at http://127.0.0.1:8000');
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
        officer_notes: `Marked by Field Auditor as ${decision}`
      });
      fetchLogs();
      alert(`Audit recorded: ${decision}`);
    } catch (err) {
      alert('Failed to save feedback');
    }
  };

  const badgeColor = {
    Priority: 'bg-red-600 text-white border border-red-800',
    Review: 'bg-orange-600 text-white border border-orange-800',
    Watch: 'bg-yellow-500 text-black border border-yellow-700',
    Low: 'bg-green-600 text-white border border-green-800',
    Invalid: 'bg-gray-600 text-white border border-gray-800'
  };

  // Custom blue textbox styling
  const inputClass = "w-full mt-1 p-2.5 rounded border border-blue-500 bg-blue-900 text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 outline-none text-sm";

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-12">
      {/* Official-style Top Navigation (Dark Mode) */}
      <nav className="bg-[#0a0a0a] border-b border-gray-800">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <span className="text-[#d4af37] font-serif text-xl font-medium leading-tight">MPLADS Dashboard</span>
            <span className="text-blue-500 text-[10px] font-bold tracking-widest leading-tight">EMPOWERED INDIAN</span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <button className="flex items-center gap-2 bg-blue-900/50 text-blue-400 px-4 py-2 rounded-md text-sm font-semibold border border-blue-800">
              <Home size={16} /> Overview
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition">
              <Search size={16} /> Find Projects
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition">
              <MapPin size={16} /> Browse States
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition">
              <Users size={16} /> Browse MPs
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition">
              <MessageSquare size={16} /> Feedback
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-6 mt-8">
        <div className="w-full h-0.5 bg-gradient-to-r from-blue-700 via-orange-400 to-emerald-600 mb-8"></div>
        
        <header className="mb-8">
          <h1 className="text-3xl font-serif text-white flex items-center gap-3">
            <Layers className="text-blue-500" /> NETRA AI Platform
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Real-time anomaly detection evaluating live CSV data against historical baselines.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: The Blue Textbox Form */}
          <section className="bg-[#111] p-6 rounded-xl border border-gray-800 shadow-lg">
            <h2 className="text-lg font-bold flex items-center gap-2 text-white mb-5">
              <Send size={18} className="text-blue-500" /> Ingest Work Proposal
            </h2>
            
            <form onSubmit={handleEvaluate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Project ID</label>
                  <input
                    className={inputClass}
                    value={form.project_id}
                    onChange={e => setForm({...form, project_id: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">District</label>
                  <input
                    className={inputClass}
                    value={form.district}
                    onChange={e => setForm({...form, district: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase">Work Description</label>
                <textarea
                  rows="2"
                  className={inputClass}
                  value={form.work_name}
                  onChange={e => setForm({...form, work_name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Sanction Cost (₹)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.sanction_amount}
                    onChange={e => setForm({...form, sanction_amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">District Mean (₹)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.district_mean_cost}
                    onChange={e => setForm({...form, district_mean_cost: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Physical Progress (%)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.physical_progress}
                    onChange={e => setForm({...form, physical_progress: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Funds Released (₹)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.funds_released}
                    onChange={e => setForm({...form, funds_released: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded text-sm transition shadow-lg shadow-blue-900/50"
              >
                {loading ? 'Evaluating via NETRA...' : 'Run NETRA Risk Assessment'}
              </button>
            </form>
          </section>

          {/* Right Column: AI Output and Forensics */}
          <section className="space-y-6">
            <div className="bg-[#111] p-6 rounded-xl border border-gray-800 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-500" /> Transparent Risk Verdict
              </h2>
              
              {evaluation ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                    <span className="font-mono text-sm font-bold text-gray-300">{evaluation.project_id}</span>
                    <span className={`px-3 py-1 rounded text-xs font-extrabold uppercase tracking-wide ${badgeColor[evaluation.risk_tier]}`}>
                      {evaluation.risk_tier} RISK
                    </span>
                  </div>

                  <div className="bg-black p-4 rounded border border-gray-800 text-sm space-y-2">
                    <div className="text-gray-400 font-semibold mb-2">Detected Anomalies:</div>
                    <ul className="list-disc pl-5 space-y-1 text-gray-200">
                      {evaluation.flags.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="bg-[#1a1a1a] border border-gray-800 p-3 rounded">
                      <span className="text-gray-500 block mb-1">Cost Variance</span>
                      <span className="font-bold text-white text-base">{evaluation.metrics.deviation_ratio}x</span>
                    </div>
                    <div className="bg-[#1a1a1a] border border-gray-800 p-3 rounded">
                      <span className="text-gray-500 block mb-1">Benford Index</span>
                      <span className="font-bold text-white text-base">{evaluation.metrics.benford_score}</span>
                    </div>
                    <div className="bg-[#1a1a1a] border border-gray-800 p-3 rounded">
                      <span className="text-gray-500 block mb-1">NLP Duplicate</span>
                      <span className="font-bold text-white text-base">{evaluation.metrics.max_title_similarity}%</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-gray-800">
                    <button
                      onClick={() => handleFeedback('Valid Anomaly')}
                      className="flex-1 bg-red-900/30 hover:bg-red-900/60 border border-red-800 text-red-400 font-bold py-2 rounded text-xs transition"
                    >
                      Confirm Anomaly
                    </button>
                    <button
                      onClick={() => handleFeedback('False Positive')}
                      className="flex-1 bg-green-900/30 hover:bg-green-900/60 border border-green-800 text-green-400 font-bold py-2 rounded text-xs transition"
                    >
                      Mark False Positive
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-800 rounded bg-[#0a0a0a]">
                  <p className="text-sm text-gray-500 italic">Submit a proposal to see the AI breakdown.</p>
                </div>
              )}
            </div>

            {/* Photo Forensics */}
            <div className="bg-[#111] p-6 rounded-xl border border-gray-800 shadow-lg">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white mb-4">
                <Camera size={18} className="text-blue-500" /> Photo Forensics (pHash)
              </h2>
              <form onSubmit={handlePhotoUpload} className="flex gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setPhotoFile(e.target.files[0])}
                  className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-200 hover:file:bg-blue-800 file:cursor-pointer"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded font-bold transition"
                >
                  Scan Asset
                </button>
              </form>
              {photoResult && (
                <div className={`mt-4 p-4 rounded text-xs border ${photoResult.is_tampered_or_duplicate ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-green-900/20 border-green-800 text-green-400'}`}>
                  <strong className="block mb-1">{photoResult.status}</strong>
                  <div className="font-mono text-[10px] opacity-80 break-all">Hash: {photoResult.photo_hash}</div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}