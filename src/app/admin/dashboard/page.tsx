'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
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

export default function AdminDashboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDecision, setFilterDecision] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

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
              Nhật ký Audit Điểm Rủi ro Affiliate (Admin Ledger)
            </h1>
            <p className="text-xs text-slate-400 break-words">
              Đối soát toàn bộ giao dịch được đánh giá, soi chi tiết các tín hiệu gian lận và thực hiện ghi đè quyết định duyệt/từ chối hoa hồng.
            </p>
          </div>

          <button
            onClick={fetchRiskScores}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 min-w-0">
          <div className="glass-card p-4 rounded-xl border border-slate-800 min-w-0">
            <span className="text-xs text-slate-400 font-medium truncate block">Tổng Đã Đánh Giá</span>
            <span className="text-2xl font-bold text-slate-100 block mt-1">{total}</span>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800 border-l-4 border-l-emerald-500 min-w-0">
            <span className="text-xs text-emerald-400 font-medium truncate block">Đã Duyệt (Approve)</span>
            <span className="text-2xl font-bold text-emerald-400 block mt-1">{approved}</span>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800 border-l-4 border-l-blue-500 min-w-0">
            <span className="text-xs text-blue-400 font-medium truncate block">Tạm Giữ Chờ Duyệt</span>
            <span className="text-2xl font-bold text-blue-400 block mt-1">{pending}</span>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800 border-l-4 border-l-amber-500 min-w-0">
            <span className="text-xs text-amber-400 font-medium truncate block">Cần Kiểm Tra Thủ Công</span>
            <span className="text-2xl font-bold text-amber-400 block mt-1">{manual}</span>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800 border-l-4 border-l-rose-500 min-w-0">
            <span className="text-xs text-rose-400 font-medium truncate block">Đã Từ Chối (Reject)</span>
            <span className="text-2xl font-bold text-rose-400 block mt-1">{rejected}</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-2 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          <div className="flex items-center gap-2 text-xs shrink-0">
            <Filter className="h-4 w-4 text-slate-400 ml-2 shrink-0" />
            <span className="text-slate-400 font-medium shrink-0">Lọc theo Quyết định:</span>
            {[
              { key: 'ALL', label: 'TẤT CẢ' },
              { key: 'APPROVE', label: 'DUYỆT (APPROVE)' },
              { key: 'PENDING_REVIEW', label: 'TẠM GIỮ' },
              { key: 'MANUAL_REVIEW', label: 'KIỂM TRA THỦ CÔNG' },
              { key: 'REJECT', label: 'TỪ CHỐI (REJECT)' },
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
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden max-w-full">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Mã Đơn hàng / Thời gian</th>
                  <th className="px-4 py-3">Affiliate & Người mua</th>
                  <th className="px-4 py-3">Điểm số & Quyết định</th>
                  <th className="px-4 py-3">Các Tín hiệu Bất thường</th>
                  <th className="px-4 py-3">Trạng thái Review</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Chưa có bản ghi đánh giá điểm rủi ro nào. Hãy thử chạy kịch bản ở trang Giả lập hoặc bấm nút &ldquo;Nạp dữ liệu&rdquo;.
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.risk_score_id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono max-w-[180px] break-all">
                        <div className="font-bold text-slate-200 break-all">{item.order_id}</div>
                        <div className="text-[10px] text-slate-500">{new Date(item.created_at).toLocaleString('vi-VN')}</div>
                      </td>

                      <td className="px-4 py-3.5 max-w-[220px] break-all">
                        <div className="font-semibold text-slate-200 break-all">{item.user_email}</div>
                        <div className="text-[11px] text-indigo-400 break-all">Ref: {item.affiliate_id}</div>
                        <div className="text-[10px] text-slate-500 font-mono break-all">IP: {item.ip}</div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${
                            item.total_score >= 100 ? 'text-rose-400' :
                            item.total_score >= 70 ? 'text-amber-400' :
                            item.total_score >= 40 ? 'text-blue-400' :
                            'text-emerald-400'
                          }`}>
                            {item.total_score} điểm
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            item.decision === 'APPROVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            item.decision === 'REJECT' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            item.decision === 'MANUAL_REVIEW' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {item.decision}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-[260px]">
                        {item.signals.length === 0 ? (
                          <span className="text-[11px] text-emerald-400 font-medium">Sạch (0 tín hiệu)</span>
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
                          {item.review_status === 'APPROVED' ? 'ĐÃ DUYỆT' :
                           item.review_status === 'REJECTED' ? 'ĐÃ TỪ CHỐI' : 'CHƯA DUYỆT'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium"
                        >
                          <Eye className="h-3 w-3 inline mr-1" /> Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Inspection Detail */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card max-w-2xl w-full rounded-2xl border border-slate-800 p-6 flex flex-col max-h-[85vh] overflow-hidden min-w-0">
              {/* Header (Fixed) */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0 min-w-0">
                <h3 className="font-bold text-lg text-slate-100 break-words">Chi tiết Audit Tín hiệu Gian lận</h3>
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
                    <ArrowRightLeft className="h-4 w-4 shrink-0" /> Bảng Đối soát: Người Mua vs Người Giới Thiệu ({selectedRecord.affiliate_id})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono min-w-0">
                    <div className="space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800 min-w-0">
                      <span className="text-[10px] font-sans text-slate-400 block font-semibold">Thông tin Đơn hàng Người Mua:</span>
                      <div className="break-all">Email: <span className={selectedRecord.user_email.includes(selectedRecord.affiliate_id) ? 'text-rose-400 font-bold' : 'text-slate-200'}>{selectedRecord.user_email}</span></div>
                      <div className="break-all">PayPal: <span className={selectedRecord.payment_account.includes(selectedRecord.affiliate_id) ? 'text-rose-400 font-bold' : 'text-slate-200'}>{selectedRecord.payment_account}</span></div>
                      <div className="break-all">Fingerprint: <span className={selectedRecord.fingerprint_hash?.includes('john_macbook') ? 'text-amber-400 font-bold' : 'text-slate-200'}>{selectedRecord.fingerprint_hash || 'N/A'}</span></div>
                      <div className="break-all">IP: <span className={selectedRecord.ip === AFFILIATE_PROMOTER.registeredIp ? 'text-amber-400 font-bold' : 'text-slate-200'}>{selectedRecord.ip}</span></div>
                    </div>
                    <div className="space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800 min-w-0">
                      <span className="text-[10px] font-sans text-indigo-400 block font-semibold">Hồ sơ Gốc Affiliate (John Doe):</span>
                      <div className="break-all">Email: <span className="text-slate-200">{AFFILIATE_PROMOTER.email}</span></div>
                      <div className="break-all">PayPal: <span className="text-slate-200">{AFFILIATE_PROMOTER.paymentAccount}</span></div>
                      <div className="break-all">Fingerprint: <span className="text-indigo-400 font-bold">{AFFILIATE_PROMOTER.deviceFingerprint}</span></div>
                      <div className="break-all">IP: <span className="text-slate-200">{AFFILIATE_PROMOTER.registeredIp}</span></div>
                    </div>
                  </div>
                </div>

                {/* Signals Tree (Isolated Scrollable Area) */}
                <div className="space-y-2 min-w-0 flex-1 flex flex-col overflow-hidden">
                  <h4 className="font-bold text-slate-300 shrink-0">Cây Tín hiệu Gian lận & Giải thích Chi tiết:</h4>
                  <div className="overflow-y-auto flex-1 space-y-2.5 pr-1.5 max-h-[280px]">
                    {selectedRecord.signals.length === 0 ? (
                      <div className="p-3 rounded bg-emerald-500/10 text-emerald-400">Không có tín hiệu gian lận nào.</div>
                    ) : (
                      selectedRecord.signals.map((sig: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-rose-400 break-all">{sig.signal_type}</span>
                            <span className="font-bold text-rose-400 shrink-0">+{sig.score} điểm</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed break-words">{sig.reason}</p>
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
                  <span className="font-bold text-slate-300 block">Thao tác Ghi đè Quyết định (Manual Override):</span>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => handleReviewAction(selectedRecord.risk_score_id, 'APPROVED')}
                      className="w-full sm:flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <ThumbsUp className="h-3.5 w-3.5 shrink-0" /> Duyệt
                    </button>
                    <button
                      onClick={() => handleReviewAction(selectedRecord.risk_score_id, 'REJECTED')}
                      className="w-full sm:flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <ThumbsDown className="h-3.5 w-3.5 shrink-0" /> Từ chối
                    </button>
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
