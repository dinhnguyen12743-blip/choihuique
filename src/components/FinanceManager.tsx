/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, ClipboardList, CheckCircle2, Plus, Calendar, Coins, Loader2 } from 'lucide-react';
import { HuiPayment, HuiTransaction } from '../types';

interface FinanceManagerProps {
  receivables: HuiPayment[];
  transactions: HuiTransaction[];
  onPayReceivable: (paymentId: string) => Promise<void>;
  onAddTransaction: (tx: any) => Promise<void>;
  onShowReceipt: (payment: HuiPayment) => void;
}

export default function FinanceManager({ receivables, transactions, onPayReceivable, onAddTransaction, onShowReceipt }: FinanceManagerProps) {
  // Manual transaction states
  const [showAddForm, setShowAddForm] = useState(false);
  const [type, setType] = useState<'collect' | 'disburse' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Totals calculation from transactions list
  let collectTotal = 0;
  let disburseTotal = 0;
  let commissionTotal = 0;
  let expenseTotal = 0;

  transactions.forEach(t => {
    if (t.type === 'collect') collectTotal += t.amount;
    else if (t.type === 'disburse') disburseTotal += t.amount;
    else if (t.type === 'commission') commissionTotal += t.amount;
    else if (t.type === 'expense') expenseTotal += t.amount;
  });

  const netBalance = (collectTotal + commissionTotal) - (disburseTotal + expenseTotal);

  const handlePay = async (id: string) => {
    try {
      await onPayReceivable(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description.trim()) {
      alert("Vui lòng điền số tiền và nội dung ghi chú quỹ.");
      return;
    }
    setLoading(true);
    try {
      await onAddTransaction({
        type,
        amount: Number(amount),
        description
      });
      setAmount('');
      setDescription('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 3 Accounting Totals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-600">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Thảo hụi thu túi riêng</span>
            <span className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">
              {commissionTotal.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex items-center justify-center text-sky-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Gom Tiền Đóng Hụi</span>
            <span className="text-lg font-mono font-black text-sky-600 dark:text-sky-400">
              {collectTotal.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 rounded-xl flex items-center justify-center text-red-600">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Bàn Giao Tiền Hốt</span>
            <span className="text-lg font-mono font-black text-red-600 dark:text-red-400">
              {(disburseTotal + expenseTotal).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-slate-850 dark:to-slate-800 rounded-xl flex items-center justify-center text-amber-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Chênh lệch Sổ Quỹ</span>
            <span className={`text-lg font-mono font-black ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {netBalance.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Outstanding Receivables list: Sổ đòi nợ hụi viên chưa đóng */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-sky-600" />
                Công Nợ Sổ Hụi Kỳ Này
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Các phần hụi cần thu ngân cho kỳ khui hiện tại. Click Đóng tiền để gạt nợ.
              </p>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 px-3 py-1 rounded-full">
              Chưa Thu: {receivables.reduce((acc, curr) => acc + curr.amountToPay, 0).toLocaleString()}đ
            </span>
          </div>

          {receivables.length > 0 ? (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-850">
                    <th className="p-3">Hụi Viên</th>
                    <th className="p-3">Đường Hụi</th>
                    <th className="p-3">Hạng Mục</th>
                    <th className="p-3">Tiền Phải Đóng</th>
                    <th className="p-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {receivables.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">
                        {p.memberName}
                        <span className="block text-[10px] text-slate-400 font-normal">{p.alias}</span>
                      </td>
                      <td className="p-3 text-slate-500 max-w-[140px] truncate">{p.lineName} (Kỳ {p.period})</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          p.payType === 'song' ? 'bg-sky-50 text-sky-700' : 'bg-red-50 text-red-700'
                        }`}>
                          Hụi {p.payType === 'song' ? 'SỐNG' : 'CHẾT'}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {p.amountToPay.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handlePay(p.id)}
                          className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-xs cursor-pointer inline-flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Đóng kỳ thâu
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400 border border-dashed border-slate-100 dark:border-slate-850 rounded-xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/80 mb-2" />
              <p className="text-xs font-semibold">Tất cả nợ kỳ này đã thâu rảnh nợ!</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Sổ công nợ rỗng rảnh rang.</p>
            </div>
          )}
        </div>

        {/* Custom Petty Cash Booking form: Ghi chép tài chính bổ sung */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                Ghi Chép Thu Chi Lẻ
              </h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs text-sky-600 hover:underline cursor-pointer"
              >
                {showAddForm ? 'Hủy' : 'Mở phiếu ghi'}
              </button>
            </div>

            {showAddForm ? (
              <form onSubmit={handleSubmitTx} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Loại quỹ</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-201 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-hidden pointer-events-auto"
                  >
                    <option value="expense">Chi tiêu / Chi phí nước nôi đám khui</option>
                    <option value="collect">Thu phí khác / Thu đền bù</option>
                    <option value="disburse">Chi tạm ứng bên ngoài</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số tiền (VNĐ)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ví dụ: 150000"
                    className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-201 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-hidden pointer-events-auto"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Diễn giải nội dung</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ví dụ: Chi trà xanh lộc đỏ bà con khui hụi tháng Vĩnh Long"
                    className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-201 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-hidden pointer-events-auto"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer pointer-events-auto"
                >
                  Ghi vào sổ thu chi
                </button>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-2 border">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  Luật Sân Chơi Thu Chi miền Tây
                </h4>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Đối với thành viên hốt hụi đầu, chủ hụi thu tiền Thảo đầu hụi (Thảo hụi cô Thảo) để giải quyết các rủi ro phát sinh rải rác sau này, đảm bảo trách nhiệm trả hụi chết hoàn hảo vạn dặm.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-4 mt-4">
            <span className="text-[10px] text-slate-400 block italic leading-relaxed">
              * Giao dịch tự động ghi nhận khi chủ hụi thục hiện &quot;Khui hốt kỳ&quot; hoặc &quot;Gom nợ đóng kỳ&quot;.
            </span>
          </div>

        </div>

      </div>

      {/* Grid: Financial Transaction ledger list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest border-b border-slate-50 dark:border-slate-850 pb-2">
          Nhật ký Sổ dòng tiền giao dịch Thu Chi
        </h3>
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 border-b border-slate-100 dark:border-slate-850">
              <tr>
                <th className="p-3">Hạt nhân giao dịch</th>
                <th className="p-3">Ngày</th>
                <th className="p-3">Mô tả</th>
                <th className="p-3 text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20">
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      tx.type === 'collect' ? 'bg-sky-50 text-sky-700' : 
                      tx.type === 'commission' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-red-700'
                    }`}>
                      {tx.type === 'collect' ? 'Thu Đóng' : 
                       tx.type === 'commission' ? 'Thu Thảo' : 'Chi Giao / Chi Lẻ'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 font-mono">{tx.date}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                    {tx.description}
                    {tx.lineName && <span className="block text-[10px] text-slate-400">Dây: {tx.lineName}</span>}
                  </td>
                  <td className={`p-3 text-right font-mono font-black ${
                    tx.type === 'collect' || tx.type === 'commission' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {tx.type === 'collect' || tx.type === 'commission' ? '+' : '-'} {tx.amount.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
