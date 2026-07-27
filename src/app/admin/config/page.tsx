'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LoadingButton from '@/components/LoadingButton';
import TableOverlay from '@/components/TableOverlay';
import { useI18n } from '@/i18n/I18nProvider';
import { replaceCount } from '@/i18n/format';
import { Sliders, RefreshCw, Power, Ban, Plus, Trash2 } from 'lucide-react';

export default function AdminConfigPage() {
  const { t } = useI18n();
  const [rules, setRules] = useState<any[]>([]);
  const [blacklists, setBlacklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRule, setSavingRule] = useState<string | null>(null);

  // Blacklist form inputs
  const [newType, setNewType] = useState<'IP' | 'DOMAIN' | 'EMAIL'>('IP');
  const [newValue, setNewValue] = useState('');
  const [newReason, setNewReason] = useState('');
  const [addingBlacklist, setAddingBlacklist] = useState(false);
  const [deletingBlacklistId, setDeletingBlacklistId] = useState<string | null>(null);

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
    setDeletingBlacklistId(id);
    try {
      const res = await fetch(`/api/admin/blacklist?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setBlacklists((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingBlacklistId(null);
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
              {t.config.title}
            </h1>
            <p className="text-xs text-slate-400 break-words">
              {t.config.description}
            </p>
          </div>

          <button
            onClick={fetchRulesAndBlacklist}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? t.common.refreshing : t.common.refresh}
          </button>
        </div>

        {/* Threshold Reference Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            {t.config.thresholdsTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono min-w-0">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="font-bold text-emerald-400 block font-sans">{t.config.approveThreshold}</span>
              <span className="text-slate-400 text-[11px]">{t.config.approveRange}</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="font-bold text-blue-400 block font-sans">{t.config.pendingThreshold}</span>
              <span className="text-slate-400 text-[11px]">{t.config.pendingRange}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="font-bold text-amber-400 block font-sans">{t.config.manualThreshold}</span>
              <span className="text-slate-400 text-[11px]">{t.config.manualRange}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="font-bold text-rose-400 block font-sans">{t.config.rejectThreshold}</span>
              <span className="text-slate-400 text-[11px]">{t.config.rejectRange}</span>
            </div>
          </div>
        </div>

        {/* Blacklist Manager Section */}
        <div className="glass-card p-6 rounded-2xl border border-rose-500/30 space-y-5 bg-rose-950/10 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 min-w-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <Ban className="h-4 w-4 shrink-0" /> {t.config.blacklistTitle}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono shrink-0">{replaceCount(t.config.blacklistCount, blacklists.length)}</span>
          </div>

          {/* Add Blacklist Form */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 min-w-0">
            <select
              value={newType}
              onChange={(e: any) => setNewType(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
            >
              <option value="IP">{t.config.typeIp}</option>
              <option value="DOMAIN">{t.config.typeDomain}</option>
              <option value="EMAIL">{t.config.typeEmail}</option>
            </select>
            <input
              type="text"
              placeholder={t.config.valuePlaceholder}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none break-all"
            />
            <input
              type="text"
              placeholder={t.config.reasonPlaceholder}
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none break-words"
            />
            <LoadingButton
              onClick={handleAddBlacklist}
              loading={addingBlacklist}
              loadingText={t.config.addingBtn}
              icon={<Plus className="h-4 w-4 shrink-0" />}
              disabled={!newValue.trim()}
              className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50 shrink-0"
            >
              {t.config.addBtn}
            </LoadingButton>
          </div>

          {/* Blacklist Table */}
          <TableOverlay loading={loading} label={t.config.loadingOverlay}>
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left text-xs font-mono min-w-[500px]">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2">{t.config.blacklistTableType}</th>
                  <th className="px-3 py-2">{t.config.blacklistTableValue}</th>
                  <th className="px-3 py-2">{t.config.blacklistTableReason}</th>
                  <th className="px-3 py-2 text-right">{t.config.blacklistTableDelete}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {blacklists.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-slate-500">{t.config.noBlacklist}</td>
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
                      <td className="px-3 py-2 text-slate-400 font-sans text-xs break-words max-w-[250px]">{item.reason || t.common.nA}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <LoadingButton
                          onClick={() => handleDeleteBlacklist(item.id)}
                          loading={deletingBlacklistId === item.id}
                          loadingText={t.config.deletingBtn}
                          icon={<Trash2 className="h-3.5 w-3.5 shrink-0" />}
                          disabled={Boolean(deletingBlacklistId)}
                          className="text-rose-400 hover:text-rose-300 p-1 font-medium flex items-center justify-end gap-1 ml-auto disabled:opacity-50"
                        >
                          {t.config.deleteBtn}
                        </LoadingButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </TableOverlay>
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

                  <LoadingButton
                    onClick={() => handleUpdateRule(rule.rule_type, rule.score_weight, !isEnabled)}
                    loading={savingRule === rule.rule_type}
                    loadingText={isEnabled ? t.config.disablingBtn : t.config.enablingBtn}
                    icon={<Power className="h-3 w-3 shrink-0" />}
                    disabled={Boolean(savingRule)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all shrink-0 disabled:opacity-50 ${
                      isEnabled
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {isEnabled ? t.config.enableBtn : t.config.disableBtn}
                  </LoadingButton>
                </div>

                <p className="text-xs text-slate-400 mb-4 min-h-[32px] leading-relaxed break-words">{rule.description}</p>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex-1 space-y-1 min-w-0">
                    <label className="text-[11px] font-semibold text-slate-400 block truncate">{t.config.pointsLabel}</label>
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
