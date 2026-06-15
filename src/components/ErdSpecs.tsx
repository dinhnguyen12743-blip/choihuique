/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, FileCode, Check, Copy, Code2, Server, HelpCircle, Layers } from 'lucide-react';

export default function ErdSpecs() {
  const [copied, setCopied] = useState(false);

  const pgSql = `-- ============================================
-- SQL SCHEMA EXPORT - QUẢN LÝ HỤI PRO 2026
-- Thiết kế tối ưu hóa chuẩn Third Normal Form (3NF) trên PostgreSQL & Supabase
-- Sẵn sàng chịu tải hàng triệu hụi viên và đường dây giao dịch lớn.
-- ============================================

CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    reputation INT DEFAULT 90,
    risk_status VARCHAR(50) DEFAULT 'trusted', -- 'trusted' | 'risk_medium' | 'risk_high'
    role VARCHAR(50) DEFAULT 'huivien', -- 'admin' | 'chuhui' | 'huivien'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS lines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value NUMERIC(15, 2) NOT NULL, -- Giá trị đầu hụi, e.g. 2,000,000 VNĐ
    period_type VARCHAR(50) NOT NULL, -- 'day' | 'week' | 'ten_days' | 'half_month' | 'month'
    start_date DATE NOT NULL,
    commission NUMERIC(15, 2) NOT NULL, -- Thảo hụi / hoa hồng chủ hụi
    total_periods INT NOT NULL, -- Tổng số phần tham gia
    current_period INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active', -- 'active' | 'completed' | 'draft'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parts (
    id VARCHAR(50) PRIMARY KEY,
    line_id VARCHAR(50) REFERENCES lines(id) ON DELETE CASCADE,
    member_id VARCHAR(50) REFERENCES members(id) ON DELETE RESTRICT,
    alias VARCHAR(255),
    is_withdrawn BOOLEAN DEFAULT FALSE,
    withdrawn_period INT,
    bid_amount NUMERIC(15, 2), -- Tiền thầu bỏ hụi kỳ đã hốt
    withdrawn_date DATE,
    total_paid NUMERIC(15, 2) DEFAULT 0,
    total_received NUMERIC(15, 2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS period_results (
    id VARCHAR(50) PRIMARY KEY,
    line_id VARCHAR(50) REFERENCES lines(id) ON DELETE CASCADE,
    period INT NOT NULL,
    date DATE NOT NULL,
    winner_part_id VARCHAR(50) REFERENCES parts(id),
    winner_member_id VARCHAR(50) REFERENCES members(id),
    bid_amount NUMERIC(15, 2) NOT NULL,
    total_commission NUMERIC(15, 2) NOT NULL,
    total_withdrawn_cash NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'bidded'
);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    line_id VARCHAR(50) REFERENCES lines(id) ON DELETE CASCADE,
    period INT NOT NULL,
    part_id VARCHAR(50) REFERENCES parts(id) ON DELETE CASCADE,
    member_id VARCHAR(50) REFERENCES members(id),
    amount_to_pay NUMERIC(15, 2) NOT NULL,
    pay_type VARCHAR(20) NOT NULL, -- 'song' | 'chet'
    status VARCHAR(50) DEFAULT 'pending', -- 'paid' | 'pending' | 'overdue'
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'collect' | 'disburse' | 'commission' | 'expense'
    amount NUMERIC(15, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    line_id VARCHAR(50),
    period INT,
    member_id VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    operator VARCHAR(255)
);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pgSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-600" />
            Kiến Trúc & SQL ERD
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Thiết kế cơ sở dữ liệu quan hệ chuẩn 3NF phục vụ môi trường Production (Supabase/PostgreSQL)
          </p>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 text-sky-700 dark:text-sky-300 rounded-lg transition-colors border border-sky-100 dark:border-sky-900"
        >
          {copied ? <Check className="w-4.5 h-4.5 text-emerald-600" /> : <Copy className="w-4.5 h-4.5" />}
          {copied ? 'Đã sao chép!' : 'Sao chép mã SQL'}
        </button>
      </div>

      {/* Grid: Architecture specs and Visual Entity Models */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Architecture Specs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-3">
              <Layers className="w-4 h-4 text-sky-600" />
              Sơ Đồ Luồng Công Việc 5 Lớp
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-sky-100 dark:bg-sky-900/60 rounded-full flex items-center justify-center font-bold text-[10px] text-sky-700 dark:text-sky-300">1</span>
                <span><strong>Giao diện:</strong> Single Page App xây dựng bằng React 19 và TailwindCSS v4, tối ưu khả năng tương thích cao trên thiết bị di động.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-sky-100 dark:bg-sky-900/60 rounded-full flex items-center justify-center font-bold text-[10px] text-sky-700 dark:text-sky-300">2</span>
                <span><strong>Máy chủ:</strong> Express Node.js với cơ chế phân phối dữ liệu chuẩn hóa, tích hợp bộ nạp HMR song hành.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-sky-100 dark:bg-sky-900/60 rounded-full flex items-center justify-center font-bold text-[10px] text-sky-700 dark:text-sky-300">3</span>
                <span><strong>Cơ sở dữ liệu:</strong> Phiên bản CSDL cục bộ dạng JSON và tài liệu phân rã dạng bảng có quan hệ khoá ngoại chặt chẽ.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-sky-100 dark:bg-sky-900/60 rounded-full flex items-center justify-center font-bold text-[10px] text-sky-700 dark:text-sky-300">4</span>
                <span><strong>Trí tuệ nhân tạo:</strong> Tích hợp luồng rủi ro thời gian thực bằng mô hình Gemini 3.5 Flash server-side bảo mật cao.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-sky-100 dark:bg-sky-900/60 rounded-full flex items-center justify-center font-bold text-[10px] text-sky-700 dark:text-sky-300">5</span>
                <span><strong>Ngoại tuyến:</strong> Lưu vết biên nhận dạng in ấn truyền thống và mã hóa mã QR tự động.</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50/50 dark:bg-slate-950 p-4 rounded-xl border border-amber-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Cam kết bảo mật miền Tây sông nước
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Dây hụi Việt Nam dựa vào uy tín cá nhân của các hụi viên trong lòng tin xóm giềng. Hệ thống hỗ trợ đắc lực tính điểm minh bạch, giúp chủ hụi chuyển hóa niềm tin định tính thành điểm tín nhiệm định lượng khoa học 2026.
            </p>
          </div>
        </div>

        {/* Database ERD Code block */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <FileCode className="w-4 h-4 text-emerald-600" />
            File xuất cấu trúc bảng PostgreSQL chuẩn hóa
          </div>
          <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{pgSql}</pre>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-sky-600" /> Mẹo: Sử dụng lệnh trên nhập thẳng vào Supabase SQL Editor để thiết lập ngay lập tức hệ thống quản lý hụi trực tuyến toàn quốc.
          </p>
        </div>

      </div>
    </div>
  );
}
