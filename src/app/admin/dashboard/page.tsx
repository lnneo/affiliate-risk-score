'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LoadingButton from '@/components/LoadingButton';
import TableOverlay from '@/components/TableOverlay';
import { useI18n } from '@/i18n/I18nProvider';
import { resolveFraudSignalReason } from '@/i18n/format';
import type { Dictionary } from '@/i18n/dictionaries/vi';
import { 
  Filter, 
  RefreshCw, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  Layers,
  ArrowRightLeft
} from 'lucide-react';

const AFFILIATE_PROMOTER = {
  id: 'aff_john_doe',
  name: 'John Doe',
  email: 'john_doe@affiliate.com',
  paymentAccount: 'paypal_john_doe@affiliate.com',
  registeredIp: '118.69.182.10',
  deviceFingerprint: 'fp_john_macbook_m2',
};

type DecisionKey = keyof Dictionary['decision'];

export default function AdminDashboardPage() {
  const { t, locale } = useI18n();
  const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDecision, setFilterDecision] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [reviewingAction, setReviewingAction] = useState<{ riskScoreId: string; status: 'APPROVED' | 'REJECTED' } | null>(null);

  const fetchRiskScores = async () => {
    setLoading(true);
    try {
      const url = filterDecision === 'ALL' ? '/api/admin/risk-scores' : `/api/admin/risk-scores?decision=${filterDecision}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskScores();
  }, [filterDecision]);

  const handleReviewAction = async (riskScoreId: string, status: 'APPROVED' | 'REJECTED') => {
    setReviewingAction({ riskScoreId, status });
    try {
      const res = await fetch('/api/admin/risk-scores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskScoreId, reviewStatus: status }),
      });
      const json = await res.json();
      if (json.success) {
        fetchRiskScores();
        if (selectedRecord && selectedRecord.risk_score_id === riskScoreId) {
          setSelectedRecord({ ...selectedRecord, review_status: status });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewingAction(null);
    }
  };

  // Metrics
  const total = data.length;
  const approved = data.filter((d) => d.decision === 'APPROVE').length;
  const pending = data.filter((d) => d.decision === 'PENDING_REVIEW').length;
  const manual = data.filter((d) => d.decision === 'MANUAL_REVIEW').length;
  const rejected = data.filter((d) => d.decision === 'REJECT').length;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 space-y-8 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2 break-words">
              <Layers className="h-6 w-6 text-indigo-400 shrink-0" />
              {t.dashboard.title}
            </h1>
            <p className="text-xs text-slate-400 break-words">
              {t.dashboard.description}
            </p>
          </div>

          <button
            onClick={fetchRiskScores}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? t.common.refreshing : t.common.refresh}
          </button>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 min-w-0">
          <div className="glass-card p-4 rounded-xl border border-slate-800 min-w-0">
            <span className="text-xs text-slate-400 font-medium truncate block">{t.dashboard.totalEvaluated}</span>
            <span className="text-2xl font-bold text-slate-100 block mt-1">{total}</span>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800 border-l-4 border-l-emerald-500 min-w-0">
            <span className="text-xs text-emerald-400 font-medium truncate block">{t.dashboard.approved}</span>
            <span className="text-2xl font-bold text-emerald-400 block mt-1">{approved}</span>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800 border-l-4 border-l-blue-500 min-w-0">
            <span className="text-xs text-blue-400 font-medium truncate block">{t.dashboard.pending}</span>
            <span className="text-2xl font-bold text-blue-400 block mt-1">{pending}</span>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800 border-l-4 border-l-amber-500 min-w-0">
            <span className="text-xs text-amber-400 font-medium truncate block">{t.dashboard.manual}</span>
            <span className="text-2xl font-bold text-amber-400 block mt-1">{manual}</span>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800 border-l-4 border-l-rose-500 min-w-0">
            <span className="text-xs text-rose-400 font-medium truncate block">{t.dashboard.rejected}</span>
            <span className="text-2xl font-bold text-rose-400 block mt-1">{rejected}</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-2 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          <div className="flex items-center gap-2 text-xs shrink-0">
            <Filter className="h-4 w-4 text-slate-400 ml-2 shrink-0" />
            <span className="text-slate-400 font-medium shrink-0">{t.dashboard.filterLabel}</span>
            {[
              { key: 'ALL', label: t.dashboard.filterAll },
              { key: 'APPROVE', label: t.decision.APPROVE.filter },
              { key: 'PENDING_REVIEW', label: t.decision.PENDING_REVIEW.filter },
              { key: 'MANUAL_REVIEW', label: t.decision.MANUAL_REVIEW.filter },
              { key: 'REJECT', label: t.decision.REJECT.filter },
            ].map((dec) => (
              <button
                key={dec.key}
                onClick={() => setFilterDecision(dec.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  filterDecision === dec.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {dec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Scores Table */}
        <TableOverlay loading={loading} label={t.dashboard.loadingOverlay}>
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden max-w-full">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">{t.dashboard.tableOrderTime}</th>
                  <th className="px-4 py-3">{t.dashboard.tableAffiliateBuyer}</th>
                  <th className="px-4 py-3">{t.dashboard.tableScoreDecision}</th>
                  <th className="px-4 py-3">{t.dashboard.tableSignals}</th>
                  <th className="px-4 py-3">{t.dashboard.tableReviewStatus}</th>
                  <th className="px-4 py-3 text-right">{t.dashboard.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      {t.dashboard.noData}
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.risk_score_id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono max-w-[180px] break-all">
                        <div className="font-bold text-slate-200 break-all">{item.order_id}</div>
                        <div className="text-[10px] text-slate-500">{new Date(item.created_at).toLocaleString(dateLocale)}</div>
                      </td>

                      <td className="px-4 py-3.5 max-w-[220px] break-all">
                        <div className="font-semibold text-slate-200 break-all">{item.user_email}</div>
                        <div className="text-[11px] text-indigo-400 break-all">{t.refLanding.ref} {item.affiliate_id}</div>
                        <div className="text-[10px] text-slate-500 font-mono break-all">{t.common.ip}: {item.ip}</div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${
                            item.total_score >= 100 ? 'text-rose-400' :
                            item.total_score >= 70 ? 'text-amber-400' :
                            item.total_score >= 40 ? 'text-blue-400' :
                            'text-emerald-400'
                          }`}>
                            {item.total_score} {t.dashboard.points}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            item.decision === 'APPROVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            item.decision === 'REJECT' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            item.decision === 'MANUAL_REVIEW' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {t.decision[item.decision as DecisionKey].filter}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-[260px]">
                        {item.signals.length === 0 ? (
                          <span className="text-[11px] text-emerald-400 font-medium">{t.dashboard.cleanSignals}</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {item.signals.map((sig: any, idx: number) => (
                              <span key={idx} className="bg-slate-800 text-rose-300 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] break-all">
                                {sig.signal_type} (+{sig.score})
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.review_status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' :
                          item.review_status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {item.review_status === 'APPROVED' ? t.dashboard.reviewApproved :
                           item.review_status === 'REJECTED' ? t.dashboard.reviewRejected : t.dashboard.reviewPending}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium"
                        >
                          <Eye className="h-3 w-3 inline mr-1" /> {t.common.detail}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </TableOverlay>

        {/* Modal: Inspection Detail */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card max-w-2xl w-full rounded-2xl border border-slate-800 p-6 flex flex-col max-h-[85vh] overflow-hidden min-w-0">
              {/* Header (Fixed) */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0 min-w-0">
                <h3 className="font-bold text-lg text-slate-100 break-words">{t.dashboard.detailTitle}</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-slate-400 hover:text-slate-200 font-bold text-lg p-1 shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Main Content Body */}
              <div className="space-y-4 text-xs min-w-0 flex-1 flex flex-col overflow-hidden pt-4">
                {/* Side by side comparison (Fixed, no scroll) */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 min-w-0 shrink-0">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <ArrowRightLeft className="h-4 w-4 shrink-0" /> {t.dashboard.comparisonTitle} ({selectedRecord.affiliate_id})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono min-w-0">
                    <div className="space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800 min-w-0">
                      <span className="text-[10px] font-sans text-slate-400 block font-semibold">{t.dashboard.buyerOrderInfo}</span>
                      <div className="break-all">{t.common.email}: <span className={selectedRecord.user_email.includes(selectedRecord.affiliate_id) ? 'text-rose-400 font-bold' : 'text-slate-200'}>{selectedRecord.user_email}</span></div>
                      <div className="break-all">{t.common.paypal}: <span className={selectedRecord.payment_account.includes(selectedRecord.affiliate_id) ? 'text-rose-400 font-bold' : 'text-slate-200'}>{selectedRecord.payment_account}</span></div>
                      <div className="break-all">{t.common.fingerprint}: <span className={selectedRecord.fingerprint_hash?.includes('john_macbook') ? 'text-amber-400 font-bold' : 'text-slate-200'}>{selectedRecord.fingerprint_hash || t.common.nA}</span></div>
                      <div className="break-all">{t.common.ip}: <span className={selectedRecord.ip === AFFILIATE_PROMOTER.registeredIp ? 'text-amber-400 font-bold' : 'text-slate-200'}>{selectedRecord.ip}</span></div>
                    </div>
                    <div className="space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800 min-w-0">
                      <span className="text-[10px] font-sans text-indigo-400 block font-semibold">{t.dashboard.affiliateProfile}</span>
                      <div className="break-all">{t.common.email}: <span className="text-slate-200">{AFFILIATE_PROMOTER.email}</span></div>
                      <div className="break-all">{t.common.paypal}: <span className="text-slate-200">{AFFILIATE_PROMOTER.paymentAccount}</span></div>
                      <div className="break-all">{t.common.fingerprint}: <span className="text-indigo-400 font-bold">{AFFILIATE_PROMOTER.deviceFingerprint}</span></div>
                      <div className="break-all">{t.common.ip}: <span className="text-slate-200">{AFFILIATE_PROMOTER.registeredIp}</span></div>
                    </div>
                  </div>
                </div>

                {/* Signals Tree (Isolated Scrollable Area) */}
                <div className="space-y-2 min-w-0 flex-1 flex flex-col overflow-hidden">
                  <h4 className="font-bold text-slate-300 shrink-0">{t.dashboard.signalsTreeTitle}</h4>
                  <div className="overflow-y-auto flex-1 space-y-2.5 pr-1.5 max-h-[280px]">
                    {selectedRecord.signals.length === 0 ? (
                      <div className="p-3 rounded bg-emerald-500/10 text-emerald-400">{t.dashboard.noSignals}</div>
                    ) : (
                      selectedRecord.signals.map((sig: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-rose-400 break-all">{sig.signal_type}</span>
                            <span className="font-bold text-rose-400 shrink-0">+{sig.score} {t.dashboard.points}</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed break-words">
                            {resolveFraudSignalReason(sig, t.fraudReasons)}
                          </p>
                          {sig.metadata_json && (
                            <div className="text-[11px] font-mono text-slate-400 pt-1 break-all bg-slate-950/60 p-2 rounded border border-slate-800/80 overflow-x-auto max-w-full">
                              {sig.metadata_json}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Manual Override Buttons (Fixed at bottom) */}
                <div className="pt-3 border-t border-slate-800 space-y-3 min-w-0 shrink-0">
                  <span className="font-bold text-slate-300 block">{t.dashboard.overrideTitle}</span>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <LoadingButton
                      onClick={() => handleReviewAction(selectedRecord.risk_score_id, 'APPROVED')}
                      loading={reviewingAction?.riskScoreId === selectedRecord.risk_score_id && reviewingAction?.status === 'APPROVED'}
                      loadingText={t.dashboard.approvingBtn}
                      icon={<ThumbsUp className="h-3.5 w-3.5 shrink-0" />}
                      disabled={Boolean(reviewingAction)}
                      className="w-full sm:flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {t.dashboard.approveBtn}
                    </LoadingButton>
                    <LoadingButton
                      onClick={() => handleReviewAction(selectedRecord.risk_score_id, 'REJECTED')}
                      loading={reviewingAction?.riskScoreId === selectedRecord.risk_score_id && reviewingAction?.status === 'REJECTED'}
                      loadingText={t.dashboard.rejectingBtn}
                      icon={<ThumbsDown className="h-3.5 w-3.5 shrink-0" />}
                      disabled={Boolean(reviewingAction)}
                      className="w-full sm:flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {t.dashboard.rejectBtn}
                    </LoadingButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
