'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Sliders, RefreshCw, Power, Ban, Plus, Trash2 } from 'lucide-react';

export default function AdminConfigPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [blacklists, setBlacklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRule, setSavingRule] = useState<string | null>(null);

  // Blacklist form inputs
  const [newType, setNewType] = useState<'IP' | 'DOMAIN' | 'EMAIL'>('IP');
  const [newValue, setNewValue] = useState('');
  const [newReason, setNewReason] = useState('');
  const [addingBlacklist, setAddingBlacklist] = useState(false);

  const fetchRulesAndBlacklist = async () => {
    setLoading(true);
    try {
      const resConfig = await fetch('/api/admin/config');
      const jsonConfig = await resConfig.json();
      if (jsonConfig.success) {
        setRules(jsonConfig.data);
      }

      const resBl = await fetch('/api/admin/blacklist');
      const jsonBl = await resBl.json();
      if (jsonBl.success) {
        setBlacklists(jsonBl.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRulesAndBlacklist();
  }, []);

  const handleUpdateRule = async (ruleType: string, scoreWeight: number, enabled: boolean) => {
    setSavingRule(ruleType);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleType, scoreWeight, enabled }),
      });
      const json = await res.json();
      if (json.success) {
        setRules((prev) =>
          prev.map((r) => (r.rule_type === ruleType ? { ...r, score_weight: scoreWeight, enabled: enabled ? 1 : 0 } : r))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRule(null);
    }
  };

  const handleAddBlacklist = async () => {
    if (!newValue.trim()) return;
    setAddingBlacklist(true);
    try {
      const res = await fetch('/api/admin/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newType, value: newValue.trim(), reason: newReason.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setNewValue('');
        setNewReason('');
        fetchRulesAndBlacklist();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingBlacklist(false);
    }
  };

  const handleDeleteBlacklist = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blacklist?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setBlacklists((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 space-y-8 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2 break-words">
              <Sliders className="h-6 w-6 text-indigo-400 shrink-0" />
              Cấu hình 15 Quy tắc & Danh sách Đen (Blacklist Manager)
            </h1>
            <p className="text-xs text-slate-400 break-words">
              Điều chỉnh trọng số 15 thuật toán Tapfiliate Enterprise và quản lý Danh sách đen IP/Domain rủi ro cao.
            </p>
          </div>

          <button
            onClick={fetchRulesAndBlacklist}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Threshold Reference Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Bảng Tham Chiếu Ngưỡng Quyết Định Hoa Hồng (Decision Thresholds)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono min-w-0">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="font-bold text-emerald-400 block font-sans">DUYỆT (APPROVE)</span>
              <span className="text-slate-400 text-[11px]">Tổng điểm &lt; 40 điểm</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="font-bold text-blue-400 block font-sans">TẠM GIỮ (PENDING)</span>
              <span className="text-slate-400 text-[11px]">Tổng điểm 40 – 69 điểm</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="font-bold text-amber-400 block font-sans">KIỂM TRA THỦ CÔNG</span>
              <span className="text-slate-400 text-[11px]">Tổng điểm 70 – 99 điểm</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="font-bold text-rose-400 block font-sans">TỪ CHỐI (REJECT)</span>
              <span className="text-slate-400 text-[11px]">Tổng điểm &ge; 100 điểm</span>
            </div>
          </div>
        </div>

        {/* Blacklist Manager Section */}
        <div className="glass-card p-6 rounded-2xl border border-rose-500/30 space-y-5 bg-rose-950/10 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 min-w-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <Ban className="h-4 w-4 shrink-0" /> Quản lý Danh Sách Đen Bảo Mật (Attribute Blacklist)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono shrink-0">Đã thêm: {blacklists.length} mục</span>
          </div>

          {/* Add Blacklist Form */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 min-w-0">
            <select
              value={newType}
              onChange={(e: any) => setNewType(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
            >
              <option value="IP">Địa chỉ IP (IP)</option>
              <option value="DOMAIN">Tên miền (Domain)</option>
              <option value="EMAIL">Email (Email)</option>
            </select>
            <input
              type="text"
              placeholder="Giá trị (VD: 198.51.100.99 hoặc spam-domain.biz)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none break-all"
            />
            <input
              type="text"
              placeholder="Lý do chặn (VD: Click farm node)"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none break-words"
            />
            <button
              onClick={handleAddBlacklist}
              disabled={addingBlacklist || !newValue.trim()}
              className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50 shrink-0"
            >
              <Plus className="h-4 w-4 shrink-0" /> Thêm vào Danh sách Đen
            </button>
          </div>

          {/* Blacklist Table */}
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-left text-xs font-mono min-w-[500px]">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2">Loại</th>
                  <th className="px-3 py-2">Giá trị Blacklist</th>
                  <th className="px-3 py-2">Lý do chặn</th>
                  <th className="px-3 py-2 text-right">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {blacklists.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-slate-500">Chưa có giá trị blacklist nào.</td>
                  </tr>
                ) : (
                  blacklists.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-200 break-all max-w-[200px]">{item.value}</td>
                      <td className="px-3 py-2 text-slate-400 font-sans text-xs break-words max-w-[250px]">{item.reason || 'N/A'}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteBlacklist(item.id)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
          {rules.map((rule) => {
            const isEnabled = rule.enabled === 1;

            return (
              <div
                key={rule.id}
                className={`glass-card p-5 rounded-2xl border transition-all min-w-0 ${
                  isEnabled ? 'border-slate-800 bg-slate-900/60' : 'border-slate-900 opacity-60 bg-slate-950/40'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-sm text-slate-100 font-mono truncate">{rule.rule_type}</span>
                  </div>

                  <button
                    onClick={() => handleUpdateRule(rule.rule_type, rule.score_weight, !isEnabled)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all shrink-0 ${
                      isEnabled
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    <Power className="h-3 w-3 shrink-0" />
                    {isEnabled ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 mb-4 min-h-[32px] leading-relaxed break-words">{rule.description}</p>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex-1 space-y-1 min-w-0">
                    <label className="text-[11px] font-semibold text-slate-400 block truncate">Trọng số Điểm Cộng (+Points)</label>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      step="5"
                      disabled={!isEnabled}
                      value={rule.score_weight}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setRules((prev) =>
                          prev.map((r) => (r.rule_type === rule.rule_type ? { ...r, score_weight: val } : r))
                        );
                      }}
                      onMouseUp={(e: any) =>
                        handleUpdateRule(rule.rule_type, Number(e.target.value), isEnabled)
                      }
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div className="w-20 text-right shrink-0">
                    <span className="text-lg font-black text-indigo-400 font-mono">+{rule.score_weight}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
