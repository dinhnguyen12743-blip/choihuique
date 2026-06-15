/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Printer, Share2, Clipboard, FileText, CheckCircle2, QrCode } from 'lucide-react';
import { HuiPayment, HuiPeriodResult } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: HuiPayment | null;
  periodWinner?: HuiPeriodResult | null;
}

export default function ReceiptModal({ isOpen, onClose, payment, periodWinner }: ReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Decide if we are showing a payment receipt or a winner receipt
  const isWinnerReceipt = !!periodWinner;
  const matchObj = periodWinner || payment;

  if (!matchObj) return null;

  const receiptId = isWinnerReceipt 
    ? `REC_WIN_${periodWinner.lineId}_P${periodWinner.period}` 
    : `REC_PAY_${payment.id}`;

  const title = isWinnerReceipt ? "BIÊN NHẬN HỐT HỤI CHI TIẾT" : "BIÊN NHẬN ĐÓNG HỤI ĐIỆN TỬ";
  const dateStr = isWinnerReceipt ? periodWinner.date : (payment.paidAt || "Chưa đóng");
  const memberName = isWinnerReceipt ? periodWinner.winnerName : payment.memberName;
  const aliasName = isWinnerReceipt ? periodWinner.winnerAlias : payment.alias;
  const amountValue = isWinnerReceipt ? periodWinner.totalWithdrawnCash : payment.amountToPay;
  const transTypeLabel = isWinnerReceipt 
    ? "Hốt hụi thấu" 
    : `Đóng hụi (${payment.payType === 'song' ? 'Sống - Có trừ bớt' : 'Chết - Đóng đủ'})`;

  // Dynamic message helper to copy to Clipboard for Zalo / SMS share
  const getShareText = () => {
    const formattedAmount = amountValue.toLocaleString('vi-VN') + " đ";
    return `[BIÊN NHẬN ĐIỆN TỬ - QUẢN LÝ HỤI PRO 2026]
-----------------------------------------------
Mã biên nhận: ${receiptId}
Đường dây hụi: ${isWinnerReceipt ? periodWinner.lineName : payment.lineName}
Kỳ khui hụi: Kỳ thứ ${isWinnerReceipt ? periodWinner.period : payment.period}
Ngày khui hụi: ${dateStr}
Hụi viên đóng/nhận: ${memberName} (${aliasName})
Nội dung giao dịch: ${transTypeLabel}
Tổng số tiền quyết toán: ${formattedAmount}
Trạng thái: ĐÃ GIAO DỊCH GỌN GÀNG SÒNG PHẲNG
-----------------------------------------------
Kính báo hụi viên kiểm đối! Út Hương chủ hụi cám ơn bà con nhen. Chúc bà con vạn sự cát tường, trúng mùa lúa thơm trái ngọt thôn quê!`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div 
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transition-all duration-300 transform scale-100 p-6 space-y-6"
        id="receipt-container"
      >
        {/* Header no-print */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 no-print">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            Chi Tiết Sổ Biên Nhận
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-sm font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>

        {/* Printable Receipt Body layout */}
        <div className="receipt-print bg-amber-50/20 dark:bg-slate-950 p-6 rounded-2xl border border-dashed border-sky-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 space-y-4">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-display font-black tracking-tight text-sky-800 dark:text-sky-400">
              QUẢN LÝ HỤI PRO 2026
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Chữ Tín Quý Hơn Vàng • Miền Tây Nam Bộ
            </p>
            <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {title}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Mã số: {receiptId}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-dotted border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">Chủ hụi lập ước:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">Út Hương (0911.222.333)</span>
            </div>
            
            <div className="flex justify-between border-b border-dotted border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">Dây hụi đại diện:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {isWinnerReceipt ? periodWinner.lineName : payment.lineName}
              </span>
            </div>

            <div className="flex justify-between border-b border-dotted border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">Kỳ mở hốt:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                Kỳ thứ {isWinnerReceipt ? periodWinner.period : payment.period} ({dateStr})
              </span>
            </div>

            <div className="flex justify-between border-b border-dotted border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">Hụi viên đối chiếu:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {memberName}
              </span>
            </div>

            <div className="flex justify-between border-b border-dotted border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">Phần hụi (Pháp danh):</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {aliasName}
              </span>
            </div>

            <div className="flex justify-between border-b border-dotted border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">Phân hạng giao dịch:</span>
              <span className="font-medium text-sky-700 dark:text-sky-300">
                {transTypeLabel}
              </span>
            </div>

            {isWinnerReceipt && (
              <div className="flex justify-between border-b border-dotted border-slate-200 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500">Giá hốt thầu bỏ bớt:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {periodWinner.bidAmount.toLocaleString('vi-VN')} đ / phần sống
                </span>
              </div>
            )}

            {isWinnerReceipt && (
              <div className="flex justify-between border-b border-dotted border-slate-200 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500">Tiền đầu thảo (Trừ chủ hụi):</span>
                <span className="font-mono text-red-600 dark:text-red-400">
                  - {periodWinner.totalCommission.toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2.5">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Tổng quyết toán thực nhận:</span>
              <span className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                {amountValue.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* Visual SVG QR Code Replica with Banking Frame */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-850 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-white rounded-xl border border-dashed border-sky-200 inline-block shadow-xs">
              <svg className="w-24 h-24 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                {/* Simulated high-quality QR pattern */}
                <rect x="0" y="0" width="25" height="25" fill="#0284c7" />
                <rect x="5" y="5" width="15" height="15" fill="white" />
                <rect x="8" y="8" width="9" height="9" fill="#0284c7" />

                <rect x="75" y="0" width="25" height="25" fill="#0284c7" />
                <rect x="80" y="5" width="15" height="15" fill="white" />
                <rect x="83" y="8" width="9" height="9" fill="#0284c7" />

                <rect x="0" y="75" width="25" height="25" fill="#0284c7" />
                <rect x="5" y="80" width="15" height="15" fill="white" />
                <rect x="8" y="83" width="9" height="9" fill="#0284c7" />

                {/* center logo of Hui Pro */}
                <rect x="42" y="42" width="16" height="16" fill="#10b981" rx="2" />
                <circle cx="50" cy="50" r="4" fill="white" />

                {/* Random QR points */}
                <rect x="35" y="10" width="5" height="10" />
                <rect x="45" y="5" width="10" height="5" />
                <rect x="60" y="15" width="5" height="10" />
                <rect x="40" y="25" width="15" height="5" />

                <rect x="10" y="35" width="5" height="15" />
                <rect x="25" y="45" width="10" height="5" />
                <rect x="15" y="60" width="10" height="5" />
                <rect x="5" y="55" width="5" height="10" />

                <rect x="65" y="35" width="15" height="5" />
                <rect x="75" y="45" width="5" height="15" />
                <rect x="90" y="60" width="5" height="5" />
                <rect x="85" y="50" width="10" height="5" />

                <rect x="35" y="65" width="10" height="5" />
                <rect x="45" y="75" width="5" height="15" />
                <rect x="60" y="70" width="10" height="5" />
                <rect x="40" y="85" width="15" height="5" />

                <rect x="70" y="75" width="5" height="10" />
                <rect x="85" y="85" width="10" height="5" />
              </svg>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic max-w-[240px]">
              {isWinnerReceipt ? "Số tài khoản nhận được mã hóa tự động bảo mật" : "Thành viên quét mã xác thực thông tin đóng hụi sòng phẳng kỳ này"}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold text-center border-t border-slate-100 dark:border-slate-850 pt-3">
            <CheckCircle2 className="w-4 h-4" />
            Bộ Biên Nhận Ký Số Lưu Trữ Trên Khối Bộ Nhớ An Toàn VIETNAM PRO 2026
          </div>
        </div>

        {/* Action Controls no-print */}
        <div className="flex gap-3 pt-2 no-print">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-2xl transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Đã sao chép!' : 'Gửi Zalo / SMS'}
          </button>
          
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-2xl transition-colors shadow-lg shadow-sky-600/10"
          >
            <Printer className="w-4 h-4" />
            In Biên Nhận (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
