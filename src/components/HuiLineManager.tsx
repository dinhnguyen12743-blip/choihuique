/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, Calendar, CalendarDays, Coins, ShieldAlert, CheckCircle2, User, Play, X, Plus, Trash2, Eye, Award } from 'lucide-react';
import { HuiLine, HuiMember } from '../types';

interface HuiLineManagerProps {
  lines: HuiLine[];
  members: HuiMember[];
  onCreateLine: (lineInput: any) => Promise<void>;
  onDeleteLine: (id: string) => Promise<void>;
  onBidLine: (lineId: string, winnerPartId: string, bidAmount: number) => Promise<void>;
}

export default function HuiLineManager({ lines, members, onCreateLine, onDeleteLine, onBidLine }: HuiLineManagerProps) {
  // Creating line form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [value, setValue] = useState('2000000');
  const [periodType, setPeriodType] = useState<'month' | 'week' | 'day' | 'ten_days' | 'half_month'>('month');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [commission, setCommission] = useState('1000000');
  const [linePartsInput, setLinePartsInput] = useState<Array<{ memberId: string; alias: string }>>([]);

  // Bidding states for a line
  const [biddingLineId, setBiddingLineId] = useState<string | null>(null);
  const [winnerPartId, setWinnerPartId] = useState('');
  const [bidAmount, setBidAmount] = useState('300000');
  const [loading, setLoading] = useState(false);

  // Selected line details drawer
  const [selectedLineId, setSelectedLineId] = useState<string | null>(lines[0]?.id || null);

  const activeLineDetail = lines.find(l => l.id === (selectedLineId || lines[0]?.id));

  // Handle enrolling parts
  const handleAddPartToForm = (memberId: string) => {
    const selectedM = members.find(m => m.id === memberId);
    if (!selectedM) return;
    const nextPartIdx = linePartsInput.filter(p => p.memberId === memberId).length + 1;
    setLinePartsInput(prev => [
      ...prev,
      {
        memberId,
        alias: `${selectedM.name} (Phần ${nextPartIdx})`
      }
    ]);
  };

  const handleRemovePartFromForm = (idx: number) => {
    setLinePartsInput(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || linePartsInput.length < 2) {
      alert("Vui lòng điền tên dây hụi và nạp ít nhất từ 2 phần hụi trở lên!");
      return;
    }
    setLoading(true);
    try {
      await onCreateLine({
        name,
        value: Number(value),
        periodType,
        startDate,
        commission: Number(commission),
        partsInput: linePartsInput
      });
      setName('');
      setLinePartsInput([]);
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Bid confirmation submit
  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingLineId || !winnerPartId || !bidAmount) {
      alert("Vui lòng nhập giá trị bỏ hụi và chọn hụi viên thắng đấu kỳ này.");
      return;
    }
    setLoading(true);
    try {
      await onBidLine(biddingLineId, winnerPartId, Number(bidAmount));
      setBiddingLineId(null);
      setWinnerPartId('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* 1. Left side: Lines list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 xl:col-span-1 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Layers className="w-5 h-5 text-sky-600" />
              Sổ Danh Sách Dây Hụi
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Quản lý tổng hòa các đường dây hoạt động</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-lg transition-colors cursor-pointer pointer-events-auto"
          >
            Mở dây mới
          </button>
        </div>

        {/* Create line form */}
        {showAddForm && (
          <form onSubmit={handleCreateSubmit} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b pb-1">
              Thủ tục mở dây hụi mới (Đại sảnh khui)
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Tên Dây Hụi</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ví dụ: Hụi Tuần 1 Triệu - Mỹ Tho"
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 pointer-events-auto"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Mức đóng/Phần</label>
                  <input
                    type="number"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 pointer-events-auto"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Chu kỳ khui</label>
                  <select
                    value={periodType}
                    onChange={e => setPeriodType(e.target.value as any)}
                    className="w-full text-xs px-2 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 pointer-events-auto"
                  >
                    <option value="month">Hụi Tháng</option>
                    <option value="week">Hụi Tuần</option>
                    <option value="day">Hụi Ngày</option>
                    <option value="ten_days">Hụi 10 ngày / lần</option>
                    <option value="half_month">Hụi nửa tháng</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Ngày khơi dây</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-100 pointer-events-auto"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Đầu thảo chủ hụi</label>
                  <input
                    type="number"
                    value={commission}
                    onChange={e => setCommission(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 pointer-events-auto"
                  />
                </div>
              </div>

              {/* Enrollment section */}
              <div className="border-t pt-2 space-y-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400">
                  Nạp phần tham gia ({linePartsInput.length} phần đã enroll)
                </label>
                
                <div className="flex gap-1">
                  <select
                    id="enrolleeSelect"
                    className="flex-1 text-xs px-1.5 py-1.5 border rounded bg-white dark:bg-slate-900 text-slate-800"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddPartToForm(e.target.value);
                        e.target.value = ''; // reset
                      }
                    }}
                  >
                    <option value="">-- Chọn hụi viên nộp phần --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                    ))}
                  </select>
                </div>

                <div className="max-h-32 overflow-y-auto space-y-1.5 pt-1">
                  {linePartsInput.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-900 p-1 px-2 border rounded-lg">
                      <span className="truncate max-w-[140px] text-slate-700 dark:text-slate-300 font-medium">{p.alias}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePartFromForm(i)}
                        className="text-red-500 hover:text-red-700 cursor-pointer text-[10px] font-black"
                      >
                        gỡ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-sky-600 text-white rounded-lg text-xs font-bold"
              >
                Tạo dây hụi
              </button>
            </div>
          </form>
        )}

        {/* Existing Lines view */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {lines.map((l) => (
            <div
              key={l.id}
              onClick={() => setSelectedLineId(l.id)}
              className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                activeLineDetail?.id === l.id 
                  ? 'bg-sky-50/60 dark:bg-sky-950/20 border-sky-300 dark:border-sky-900 ring-2 ring-sky-500/10' 
                  : 'bg-white dark:bg-slate-950/20 border-slate-100 dark:border-slate-850 hover:bg-slate-50/50'
              }`}
            >
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{l.name}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <CalendarDays className="w-3 h-3 text-slate-300" />
                  <span>Khai khơi: {l.startDate}</span>
                  <span>•</span>
                  <span>Chu kỳ: {l.periodType}</span>
                </div>
                <p className="text-xs font-extrabold text-sky-600 dark:text-sky-400">
                  Đầu hụi: {l.value.toLocaleString()}đ / phần
                </p>
              </div>

              {/* Badge status */}
              <div className="flex flex-col items-end gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                  l.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {l.status === 'completed' ? 'ĐÃ KẾT THÚC' : `KỲ ${l.currentPeriod}/${l.totalPeriods}`}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Út ơi có chắc là xé bỏ xóa dây hụi này ra luôn hông?")) {
                      onDeleteLine(l.id);
                    }
                  }}
                  className="text-red-400 hover:text-red-600 text-[10px] font-medium"
                >
                  Xóa bỏ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Middle and Right: Active Line Details viewer & Bidding Center */}
      <div className="xl:col-span-2 space-y-6">
        
        {activeLineDetail ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
            
            {/* Active Details Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-sky-50 dark:bg-sky-950 text-sky-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                  Chi tiết đường dây đang soi
                </span>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {activeLineDetail.name}
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span><strong>Giá trị gốc:</strong> {activeLineDetail.value.toLocaleString('vi-VN')} đ / phần</span>
                  <span><strong>Thảo hụi chủ thấu:</strong> {activeLineDetail.commission.toLocaleString('vi-VN')} đ / hốt</span>
                  <span><strong>Kỳ hạn:</strong> {activeLineDetail.periodType}</span>
                </div>
              </div>

              {/* Bidding trigger btn */}
              {activeLineDetail.status !== 'completed' && (
                <button
                  onClick={() => {
                    setBiddingLineId(activeLineDetail.id);
                    // Mặc định chọn phần hụi chưa hốt đầu tiên
                    const firstUnwithdrawn = activeLineDetail.parts.find(p => !p.isWithdrawn);
                    if (firstUnwithdrawn) setWinnerPartId(firstUnwithdrawn.id);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-1.5 cursor-pointer pointer-events-auto"
                >
                  <Play className="w-4 h-4" />
                  Khai khui đấu hụi kỳ mới
                </button>
              )}
            </div>

            {/* Bidding input frame overlay */}
            {biddingLineId === activeLineDetail.id && (
              <form onSubmit={handleBidSubmit} className="bg-emerald-50/50 dark:bg-slate-950 p-5 rounded-2xl border border-emerald-100 dark:border-slate-850 space-y-4">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
                    Nhập giá thầu đấu hụi kỳ thứ {activeLineDetail.currentPeriod}
                  </h4>
                  <button type="button" onClick={() => setBiddingLineId(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Chọn phần hụi thắng đấu</label>
                    <select
                      value={winnerPartId}
                      onChange={(e) => setWinnerPartId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-800 pointer-events-auto"
                    >
                      {activeLineDetail.parts.filter(p => !p.isWithdrawn).map(p => (
                        <option key={p.id} value={p.id}>{p.alias} ({p.memberName})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Mức bỏ hụi kỳ đấu thầu (để giật hốt)</label>
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={e => setBidAmount(e.target.value)}
                        placeholder="Ví dụ: 350000"
                        className="flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-800 pointer-events-auto"
                      />
                      <span className="font-bold text-slate-400">đ / phần sống</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border space-y-1 text-slate-600">
                  <h5 className="text-[11px] font-bold text-amber-800">Tự động toán thu phát miền Tây:</h5>
                  <p className="text-[10px] leading-relaxed">
                    - Mỗi phần chưa hốt đóng hụi sống: {(activeLineDetail.value - Number(bidAmount)).toLocaleString()}đ (Giá trị bớt thầu).<br />
                    - Mỗi phần đã hốt đóng đủ hụi chết: {activeLineDetail.value.toLocaleString()}đ.<br />
                    - Trừ Thảo chủ hụi: {activeLineDetail.commission.toLocaleString()}đ nộp Út Hương.<br />
                    - Thực thấu giao hốt: Sẽ hiển thị biên nhận điện tử đầy đủ sòng phẳng ngay lập tức sau khui!
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setBiddingLineId(null)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs"
                  >
                    Hủy thầu
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                  >
                    Xác nhận hốt thầu
                  </button>
                </div>
              </form>
            )}

            {/* List of Parts in this Line */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-sky-600" />
                Sổ chi tiết các phần hụi tham gia ({activeLineDetail.parts.length} phần chơi)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeLineDetail.parts.map((p) => (
                  <div 
                    key={p.id}
                    className={`p-4 border rounded-2xl flex justify-between items-center ${
                      p.isWithdrawn 
                        ? 'bg-slate-50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850' 
                        : 'bg-white border-sky-100 dark:bg-slate-900/40 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {p.alias}
                      </h4>
                      <p className="text-[10px] text-slate-400">Đăng kí gốc: {p.memberName}</p>
                      <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-2">
                        <span>Đã nộp đóng: <strong className="font-mono">{p.totalPaid.toLocaleString()}đ</strong></span>
                        {p.isWithdrawn && (
                          <span>Đã hốt: <strong className="font-mono text-emerald-600">{p.totalReceived.toLocaleString()}đ</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      {p.isWithdrawn ? (
                        <>
                          <span className="px-2 py-0.5 rounded-full text-[9px] bg-slate-100 text-slate-500 font-bold uppercase font-mono">
                            Hụi Chết (Kỳ {p.withdrawnPeriod})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Bớt thầu: {p.bidAmount?.toLocaleString()}đ</span>
                        </>
                      ) : (
                        <>
                          <span className="px-2 py-0.5 rounded-full text-[9px] bg-sky-50 text-sky-700 font-bold uppercase tracking-wider animate-pulse">
                            Hụi Sống
                          </span>
                          <span className="text-[10px] text-slate-400 italic">Chờ thầu kì sau</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-64 flex flex-col items-center justify-center text-slate-400 text-center">
            <Layers className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-3" />
            <p className="text-sm font-semibold">Chưa chọn dây hụi để soi</p>
            <p className="text-xs text-slate-500">Ấn chọn dây hụi ở ô bên trái để khảo sát trạng tháo thấu thầu nhen.</p>
          </div>
        )}

      </div>

    </div>
  );
}
