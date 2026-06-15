/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Phone, MapPin, Star, AlertTriangle, ShieldCheck, Trash2, Edit, Plus, Check, Loader2 } from 'lucide-react';
import { HuiMember } from '../types';

interface MemberManagerProps {
  members: HuiMember[];
  onAddMember: (member: any) => Promise<void>;
  onUpdateMember: (id: string, updates: any) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
}

export default function MemberManager({ members, onAddMember, onUpdateMember, onDeleteMember }: MemberManagerProps) {
  // New member form
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editReputation, setEditReputation] = useState(90);
  const [editRiskStatus, setEditRiskStatus] = useState<'trusted' | 'risk_medium' | 'risk_high'>('trusted');
  const [editNotes, setEditNotes] = useState('');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorText('Phải điền ít nhất hai ô Họ Tên và Số Điện Thoại nhen!');
      return;
    }
    setLoading(true);
    setErrorText('');
    try {
      await onAddMember({ name, phone, address, notes });
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
      setShowAddForm(false);
    } catch (err: any) {
      setErrorText(err.message || 'Lỗi lưu thông tin hụi viên.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (m: HuiMember) => {
    setEditingId(m.id);
    setEditName(m.name);
    setEditPhone(m.phone);
    setEditAddress(m.address);
    setEditReputation(m.reputation);
    setEditRiskStatus(m.riskStatus);
    setEditNotes(m.notes || '');
  };

  const handleUpdateSubmit = async (id: string) => {
    setLoading(true);
    try {
      await onUpdateMember(id, {
        name: editName,
        phone: editPhone,
        address: editAddress,
        reputation: editReputation,
        riskStatus: editRiskStatus,
        notes: editNotes
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Út hỏi chắc chưa, xóa mối hụi này khỏi danh sách luôn á nghen?')) {
      try {
        await onDeleteMember(id);
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa hụi viên.');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-sky-600" />
            Quản Lý Hụi Viên
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Danh bạ các đầu hụi viên, cập nhật uy tín tín chấp và đánh giá nguy cơ dòng tài chính gia đình
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-600/15 flex items-center gap-1.5 transition-colors cursor-pointer pointer-events-auto"
        >
          <Plus className="w-4 h-4" />
          Khai Thêm Hụi Viên
        </button>
      </div>

      {/* Inline Adding form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Khai trình thông tin lý lịch hội viên mới
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tên Hụi Viên</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ví dụ: Chị Sáu Trà Ôn"
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 pointer-events-auto"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Số Điện Thoại Zalo</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Ví dụ: 0917654321"
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 pointer-events-auto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Địa Chỉ / Xóm Giềng</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Ví dụ: Thới An, Trà Ôn, Vĩnh Long"
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 pointer-events-auto"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Ghi Chú Đóng Hụi</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ví dụ: Nhà vườn nhãn lồng lớn, uy tín tốt"
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 pointer-events-auto"
              />
            </div>
          </div>

          {errorText && <p className="text-xs text-red-500 font-medium">{errorText}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors pointer-events-auto"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1 cursor-pointer pointer-events-auto"
            >
              {loading && <Loader2 className="w-3 animate-spin" />}
              Ghi lưu hụi viên
            </button>
          </div>
        </form>
      )}

      {/* Directory Cards Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {members.map((m) => {
          const isEditing = editingId === m.id;

          return (
            <div 
              key={m.id} 
              className={`border rounded-2xl p-5 flex flex-col justify-between transition-all shadow-xs ${
                m.riskStatus === 'risk_high'
                  ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/60'
                  : (m.riskStatus === 'risk_medium' ? 'bg-amber-50/40 dark:bg-amber-950/5 border-amber-100 dark:border-amber-900/60' : 'bg-white dark:bg-slate-950/30 border-slate-100 dark:border-slate-850')
              }`}
            >
              <div className="space-y-3.5">
                {/* Header card info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center font-bold text-sky-700">
                      {m.role === 'chuhui' ? 'Út' : m.name.substring(0, 1)}
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="text-xs font-bold bg-white dark:bg-slate-900 border rounded px-1.5 py-0.5 text-slate-800 dark:text-slate-100 w-32"
                        />
                      ) : (
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                          {m.name}
                          {m.role === 'chuhui' && (
                            <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded-full font-black tracking-widest uppercase">
                              Chủ hụi
                            </span>
                          )}
                        </h3>
                      )}
                      
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editPhone}
                            onChange={e => setEditPhone(e.target.value)}
                            className="text-[10px] w-24 border rounded px-1"
                          />
                        ) : m.phone}
                      </div>
                    </div>
                  </div>

                  {/* Reputation points indicator */}
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Uy Tín</span>
                    <div className="flex items-center gap-0.5 mt-0.5 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-black font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editReputation}
                            onChange={e => setEditReputation(Math.max(0, Math.min(100, Number(e.target.value))))}
                            className="w-10 text-center border rounded"
                          />
                        ) : m.reputation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="space-y-2 text-xs">
                  <p className="flex items-start gap-1 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editAddress}
                        onChange={e => setEditAddress(e.target.value)}
                        className="w-full text-[11px] border rounded"
                      />
                    ) : m.address}
                  </p>

                  {/* Status warns */}
                  <div className="flex items-center gap-1.5">
                    {isEditing ? (
                      <select
                        value={editRiskStatus}
                        onChange={e => setEditRiskStatus(e.target.value as any)}
                        className="text-[10px] border rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      >
                        <option value="trusted">Đáng tin</option>
                        <option value="risk_medium">Rủi ro trung bình</option>
                        <option value="risk_high">Rủi ro cao (Đóng trễ)</option>
                      </select>
                    ) : (
                      <>
                        {m.riskStatus === 'trusted' ? (
                          <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                            <ShieldCheck className="w-3 h-3" /> Đóng Kỳ Nhanh Sòng Mặt
                          </span>
                        ) : m.riskStatus === 'risk_medium' ? (
                          <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                            <AlertTriangle className="w-3 h-3" /> Chậm Đóng Kỳ Chết
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-black tracking-wide animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" /> CẢNH BÁO BỎ BÙNG HỤI
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        className="w-full text-[10px]"
                      />
                    ) : (m.notes || 'Không có ghi chú lý lịch.')}
                  </p>
                </div>
              </div>

              {/* Action operations controls */}
              <div className="flex gap-2 border-t border-slate-100 dark:border-slate-850 pt-3 mt-4 justify-end">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 text-[11px] bg-slate-200 text-slate-700 rounded-lg font-bold"
                    >
                      Bỏ qua
                    </button>
                    <button
                      onClick={() => handleUpdateSubmit(m.id)}
                      className="px-2.5 py-1 text-[11px] bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Xác nhận lưu
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(m)}
                      className="p-1 px-2.5 text-[11px] text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Chỉnh sửa
                    </button>
                    
                    {m.id !== 'M007' && ( // Không được xoá chủ hụi Út Hương
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1 px-2.5 text-[11px] text-slate-400 hover:text-red-600 bg-slate-50 dark:bg-slate-905 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </button>
                    )}
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
