import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, AlertCircle, Camera, CheckSquare, Layers, Send } from 'lucide-react';

const API_BASE = 'https://netra-backend-kmke.onrender.com';

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
    Priority: 'bg-red-600 text-white',
    Review: 'bg-orange-500 text-white',
    Watch: 'bg-amber-400 text-slate-900',
    Low: 'bg-emerald-600 text-white'
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <header className="mb-6 flex items-center justify-between border-b pb-4 border-slate-300">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Layers className="text-blue-600" /> NETRA AI Platform
          </h1>
          <p className="text-sm text-slate-600">
            Multi-dimensional Anomaly Detection for MPLADS Infrastructure Works
          </p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold">
          SIH26102 Prototype
        </span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form: Work Submission */}
        <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <Send size={18} /> Ingest Work Proposal
          </h2>
          <form onSubmit={handleEvaluate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Project ID</label>
                <input
                  className="w-full border p-2 rounded text-sm mt-1"
                  value={form.project_id}
                  onChange={e => setForm({...form, project_id: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">District</label>
                <input
                  className="w-full border p-2 rounded text-sm mt-1"
                  value={form.district}
                  onChange={e => setForm({...form, district: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Work Description</label>
              <textarea
                rows="2"
                className="w-full border p-2 rounded text-sm mt-1"
                value={form.work_name}
                onChange={e => setForm({...form, work_name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Sanction Cost (₹)</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded text-sm mt-1"
                  value={form.sanction_amount}
                  onChange={e => setForm({...form, sanction_amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">District Mean (₹)</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded text-sm mt-1"
                  value={form.district_mean_cost}
                  onChange={e => setForm({...form, district_mean_cost: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Physical Progress (%)</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded text-sm mt-1"
                  value={form.physical_progress}
                  onChange={e => setForm({...form, physical_progress: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Funds Released (₹)</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded text-sm mt-1"
                  value={form.funds_released}
                  onChange={e => setForm({...form, funds_released: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm transition"
            >
              {loading ? 'Evaluating...' : 'Run NETRA Risk Assessment'}
            </button>
          </form>
        </section>

        {/* Evaluation Output */}
        <section className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <ShieldCheck size={18} /> Transparent Risk Verdict
            </h2>
            {evaluation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold">{evaluation.project_id}</span>
                  <span className={`px-3 py-1 rounded text-xs font-extrabold uppercase ${badgeColor[evaluation.risk_tier]}`}>
                    {evaluation.risk_tier} RISK
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded border text-xs space-y-1">
                  <div><strong>Why was it flagged?</strong></div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {evaluation.flags.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-100 p-2 rounded">
                    <span className="text-slate-500 block">Cost Variance</span>
                    <span className="font-bold">{evaluation.metrics.deviation_ratio}x</span>
                  </div>
                  <div className="bg-slate-100 p-2 rounded">
                    <span className="text-slate-500 block">Benford Index</span>
                    <span className="font-bold">{evaluation.metrics.benford_score}</span>
                  </div>
                  <div className="bg-slate-100 p-2 rounded">
                    <span className="text-slate-500 block">NLP Duplicate</span>
                    <span className="font-bold">{evaluation.metrics.max_title_similarity}%</span>
                  </div>
                </div>

                {/* Officer Feedback Controls */}
                <div className="flex gap-2 pt-2 border-t">
                  <button
                    onClick={() => handleFeedback('Valid Anomaly')}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1.5 rounded text-xs"
                  >
                    Confirm Anomaly
                  </button>
                  <button
                    onClick={() => handleFeedback('False Positive')}
                    className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-bold py-1.5 rounded text-xs"
                  >
                    Mark False Positive
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Submit a proposal to see the risk tier and model breakdown.</p>
            )}
          </div>

          {/* Photo Forensics Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <Camera size={18} /> Photo Forensics (pHash Verification)
            </h2>
            <form onSubmit={handlePhotoUpload} className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={e => setPhotoFile(e.target.files[0])}
                className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-slate-100 file:font-semibold"
              />
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded font-bold"
              >
                Scan Photo
              </button>
            </form>
            {photoResult && (
              <div className={`p-3 rounded text-xs border ${photoResult.is_tampered_or_duplicate ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                <strong>{photoResult.status}</strong>
                <div className="text-[11px] font-mono mt-1">Hash: {photoResult.photo_hash}</div>
                {photoResult.duplicate_matched_with && (
                  <div>Matched with: {photoResult.duplicate_matched_with}</div>
                )}
              </div>
            )}
          </div>

          {/* Officer Review History */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
              <CheckSquare size={16} /> Officer Feedback History ({logs.length})
            </h3>
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400">No review decisions logged yet.</p>
            ) : (
              <ul className="text-xs divide-y divide-slate-100 max-h-32 overflow-y-auto">
                {logs.map((log, index) => (
                  <li key={index} className="py-1.5 flex justify-between">
                    <span className="font-mono">{log.project_id}</span>
                    <span className={log.decision === 'Valid Anomaly' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                      {log.decision}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
