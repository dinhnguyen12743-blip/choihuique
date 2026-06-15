/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  Users, 
  Coins, 
  Brain, 
  Database, 
  Menu, 
  Sun, 
  Moon, 
  AlertTriangle, 
  ShieldCheck, 
  Bell, 
  RefreshCcw, 
  HelpCircle, 
  FileText,
  Clock,
  LogOut,
  ChevronRight,
  CloudLightning
} from 'lucide-react';
import { 
  HuiMember, 
  HuiLine, 
  HuiPayment, 
  HuiTransaction, 
  HuiLog, 
  HuiPeriodResult 
} from './types';
import HuiLineManager from './components/HuiLineManager';
import MemberManager from './components/MemberManager';
import FinanceManager from './components/FinanceManager';
import AiRiskCenter from './components/AiRiskCenter';
import ErdSpecs from './components/ErdSpecs';
import ReceiptModal from './components/ReceiptModal';
import GoogleSheetsSync from './components/GoogleSheetsSync';

export default function App() {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lines' | 'members' | 'finance' | 'ai' | 'erd' | 'sheets'>('dashboard');

  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Database core state pools
  const [members, setMembers] = useState<HuiMember[]>([]);
  const [lines, setLines] = useState<HuiLine[]>([]);
  const [receivables, setReceivables] = useState<HuiPayment[]>([]);
  const [transactions, setTransactions] = useState<HuiTransaction[]>([]);
  const [logs, setLogs] = useState<HuiLog[]>([]);
  const [results, setResults] = useState<HuiPeriodResult[]>([]);

  // Metadata dashboard summaries
  const [summary, setSummary] = useState({
    totalLines: 0,
    totalMembers: 0,
    totalCollect: 0,
    totalDisburse: 0,
    totalCommissions: 0,
    outstandingDebt: 0,
    riskPrecent: 0,
    systemAlert: "Đang tải dữ liệu...",
    alertLevel: "safe",
    chartData: [] as any[]
  });

  // Modal share/receipt details
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<HuiPayment | null>(null);
  const [activeReceiptWinner, setActiveReceiptWinner] = useState<HuiPeriodResult | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Local clock state 
  const [currentTime, setCurrentTime] = useState('');

  // Initializing API pull loaders
  const loadAllData = async () => {
    try {
      // 1. Fetch core databases
      const resMembers = await fetch('/api/members');
      const dataMembers = await resMembers.json();
      setMembers(dataMembers);

      const resLines = await fetch('/api/lines');
      const dataLines = await resLines.json();
      setLines(dataLines);

      const resReceivables = await fetch('/api/receivables');
      const dataReceivables = await resReceivables.json();
      setReceivables(dataReceivables);

      const resTransactions = await fetch('/api/transactions');
      const dataTransactions = await resTransactions.json();
      setTransactions(dataTransactions);

      const resLogs = await fetch('/api/logs');
      const dataLogs = await resLogs.json();
      setLogs(dataLogs);

      const resResults = await fetch('/api/results');
      const dataResults = await resResults.json();
      setResults(dataResults);

      // 2. Fetch analytical summaries
      const resSummary = await fetch('/api/analytics/summary');
      const dataSummary = await resSummary.json();
      setSummary(dataSummary);
    } catch (err) {
      console.error("Failed to sync applet database state:", err);
    }
  };

  useEffect(() => {
    loadAllData();
    // Start interval
    const tInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
    }, 1000);

    return () => clearInterval(tInterval);
  }, []);

  // Sync dark scheme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Operations triggers
  const handleResetDb = async () => {
    if (window.confirm("Út ơi có chắc đặt lại sổ hụi từ đầu để chạy thử không? Toàn bộ giao dịch mới sẽ bị xóa á nghen.")) {
      try {
        const res = await fetch('/api/reset-db', { method: 'POST' });
        await res.json();
        await loadAllData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddMember = async (memberData: any) => {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Lỗi thêm hụi viên');
    }
    await loadAllData();
  };

  const handleUpdateMember = async (id: string, updates: any) => {
    const res = await fetch(`/api/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Lỗi cập nhật hụi viên');
    await loadAllData();
  };

  const handleDeleteMember = async (id: string) => {
    const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Lỗi xóa hụi viên');
    }
    await loadAllData();
  };

  const handleCreateLine = async (lineData: any) => {
    const res = await fetch('/api/lines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lineData)
    });
    if (!res.ok) throw new Error('Lỗi tạo dây hụi mới');
    await loadAllData();
  };

  const handleDeleteLine = async (id: string) => {
    const res = await fetch(`/api/lines/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Lỗi xóa dây hụi');
    await loadAllData();
  };

  const handleBidLine = async (lineId: string, winnerPartId: string, bidAmount: number) => {
    const res = await fetch(`/api/lines/${lineId}/bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerPartId, bidAmount })
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Lỗi khui đấu hụi');
      return;
    }
    const data = await res.json();
    await loadAllData();

    // Hiện biên nhận thắng thầu lên liền cho lộng lẫy
    setActiveReceiptPayment(null);
    setActiveReceiptWinner(data.periodResult);
    setShowReceiptModal(true);
  };

  const handlePayReceivable = async (id: string) => {
    const res = await fetch(`/api/payments/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datePaid: new Date().toISOString().split('T')[0] })
    });
    if (!res.ok) return;
    const data = await res.json();
    await loadAllData();

    // Hiện biên nhận đóng hụi sòng phẳng lên liền
    setActiveReceiptWinner(null);
    setActiveReceiptPayment(data.payment);
    setShowReceiptModal(true);
  };

  const handleAddTransaction = async (txData: any) => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(txData)
    });
    if (!res.ok) throw new Error('Lỗi ghi giao dịch lẻ');
    await loadAllData();
  };

  // Safe manual rendering check
  const chartHeight = 160;
  const chartWidth = 480;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      {/* 1. Header Area (HUD Bar) */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 no-print shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg pointer-events-auto"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-rose-50 dark:bg-slate-950 border-2 border-amber-500/50 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden shrink-0">
              {/* Premium Majestic Gold Pagoda, Lotus & Money Bags Traditional Art SVG Emblem */}
              <svg viewBox="0 0 64 64" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
                {/* Golden Rays Backing */}
                <g className="text-amber-400/35">
                  <path d="M32 0l4 28 4-28M32 64l-4-28-4 28M0 32l28-4-28-4M64 32l-28 4 28 4" stroke="currentColor" strokeWidth="1" />
                </g>
                {/* Traditional Red temple roof */}
                <path d="M12 28 C 12 28, 32 15, 32 15 C 32 15, 52 28, 52 28 C 44 26, 32 25, 12 28 Z" fill="#b91c1c" stroke="#dfb64d" strokeWidth="1.5" />
                <path d="M18 27 v14 h28 v-14 Z" fill="#b91c1c" opacity="0.9" />
                {/* Temple Gate (Gold) */}
                <path d="M26 41 v-8 a 6 6 0 0 1 12 0 v 8 Z" fill="#dfb64d" />
                {/* Vibrant Lotus Flower (Pink) at Left */}
                <path d="M8 43 C 6 36, 16 35, 18 43 C 20 35, 24 38, 20 45 Z" fill="#ec4899" opacity="0.95" />
                <path d="M14 45 C 10 40, 20 38, 16 45 Z" fill="#f472b6" />
                {/* Gold Coins & Bag Symbol at Right */}
                <path d="M48 43 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0" fill="#78350f" stroke="#dfb64d" strokeWidth="1" />
                <text x="50.5" y="46.5" fill="#dfb64d" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Đ</text>
                {/* Cupping Human Trust Hands at Bottom */}
                <path d="M10 44 c 5 5, 22 8, 22 8 s 17-3, 22-8 c -4 5, -18 11, -22 11 s -18-6, -22-11 Z" fill="#fbcfe8" opacity="0.4" />
                <path d="M6 46 c 8 8, 26 12, 26 12 s 18-4, 26-12 c -4 8, -22 13, -26 13 s -22-5, -26-13 Z" fill="#dfb64d" />
              </svg>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black font-display tracking-widest text-slate-800 dark:text-amber-100 uppercase leading-none">
                  NỀN TẢNG QUẢN LÝ HỤI PRO <span className="text-yellow-600 dark:text-yellow-400 font-black font-mono">2026</span>
                </span>
                <span className="bg-red-700 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                  Cực kỳ sòng phẳng
                </span>
              </div>
              <p className="text-xs text-red-700 dark:text-red-500 font-extrabold tracking-wide mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-500 animate-ping"></span>
                <span>Tác giả sửa đổi thiết kế:</span>
                <span className="underline decoration-2 underline-offset-2">Nguyễn Công Dinh _ Zalo: 039.399.0638</span>
              </p>
              <p className="text-[9px] text-slate-400 dark:text-slate-400 font-semibold tracking-wide uppercase mt-0.5">
                Thiết kế tùy biến riêng cho tiểu thương, nhà vườn vùng sông nước Đồng Bằng Sông Cửu Long Việt Nam
              </p>
            </div>
          </div>

          {/* System Warnings Scroll block */}
          <div className="hidden md:flex flex-1 max-w-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-1.5 items-center gap-2">
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
              summary.alertLevel === 'danger' ? 'text-red-500 animate-bounce' : (summary.alertLevel === 'warning' ? 'text-amber-500' : 'text-emerald-500')
            }`} />
            <marquee className="text-xs font-medium text-slate-600 dark:text-slate-300" scrollamount="3">
              {summary.systemAlert} • Điểm uy tín hụi viên được hiệu chỉnh thuật toán tự động theo thời gian khui hốt sòng phẳng.
            </marquee>
          </div>

          {/* Clock & Actions HUD */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime || "Hệ thống online"}</span>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer pointer-events-auto"
              title="Chuyển đổi giao diện Sáng / Tối"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <button
              onClick={handleResetDb}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center gap-1 text-[11px] font-bold pointer-events-auto"
              title="Đặt lại dữ liệu mô phỏng"
            >
              <RefreshCcw className="w-3.5 h-3.5 animate-spin-reverse" />
              <span className="hidden lg:inline">Cài lại dữ liệu</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Main Content Frame (Sidebar Grid) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar Nav: lg:col-span-3 */}
        <aside className={`lg:col-span-3 space-y-4 no-print ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-blue-900 dark:bg-slate-900 border border-blue-950 rounded-2xl p-4 space-y-1.5 shadow-2x">
            <span className="text-[10px] font-bold text-blue-200 dark:text-slate-400 uppercase tracking-widest px-3 block mb-2">Phân hệ điều khiển</span>
            
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer pointer-events-auto ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-800 text-white shadow-md shadow-blue-900/40 border-blue-700/50' 
                  : 'text-blue-300 dark:text-slate-300 border-transparent hover:bg-blue-800/40 dark:hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Building2 className="w-4.5 h-4.5" />
                Tổng Quan Sổ Hụi
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => { setActiveTab('lines'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer pointer-events-auto ${
                activeTab === 'lines' 
                  ? 'bg-blue-800 text-white shadow-md shadow-blue-900/40 border-blue-700/50' 
                  : 'text-blue-300 dark:text-slate-300 border-transparent hover:bg-blue-800/40 dark:hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Layers className="w-4.5 h-4.5" />
                Các Dây Hụi Khui
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => { setActiveTab('members'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer pointer-events-auto ${
                activeTab === 'members' 
                  ? 'bg-blue-800 text-white shadow-md shadow-blue-900/40 border-blue-700/50' 
                  : 'text-blue-300 dark:text-slate-300 border-transparent hover:bg-blue-800/40 dark:hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4.5 h-4.5" />
                Quản Lý Hụi Viên
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => { setActiveTab('finance'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer pointer-events-auto ${
                activeTab === 'finance' 
                  ? 'bg-blue-800 text-white shadow-md shadow-blue-900/40 border-blue-700/50' 
                  : 'text-blue-300 dark:text-slate-300 border-transparent hover:bg-blue-800/40 dark:hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Coins className="w-4.5 h-4.5" />
                Sổ Thu Chi - Công Nợ
              </span>
              {receivables.length > 0 ? (
                <span className="bg-yellow-400 text-blue-950 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {receivables.length}
                </span>
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              )}
            </button>

            <button
              onClick={() => { setActiveTab('ai'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer pointer-events-auto ${
                activeTab === 'ai' 
                  ? 'bg-blue-800 text-white shadow-md shadow-blue-900/40 border-blue-700/50' 
                  : 'text-blue-300 dark:text-slate-300 border-transparent hover:bg-blue-800/40 dark:hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Brain className="w-4.5 h-4.5 animate-pulse" />
                AI Khảo Sát Rủi Ro
              </span>
              <span className="text-[10px] bg-yellow-400 text-blue-950 px-1.5 py-0.5 rounded-sm font-mono font-bold">
                PRO
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('erd'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer pointer-events-auto ${
                activeTab === 'erd' 
                  ? 'bg-blue-800 text-white shadow-md shadow-blue-900/40 border-blue-700/50' 
                  : 'text-blue-300 dark:text-slate-300 border-transparent hover:bg-blue-800/40 dark:hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Database className="w-4.5 h-4.5" />
                Hệ Thống CSDL
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => { setActiveTab('sheets'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer pointer-events-auto ${
                activeTab === 'sheets' 
                  ? 'bg-blue-800 text-white shadow-md shadow-blue-900/40 border-blue-700/50' 
                  : 'text-blue-300 dark:text-slate-300 border-transparent hover:bg-blue-800/40 dark:hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <CloudLightning className="w-4.5 h-4.5 text-yellow-400" />
                Đồng Bộ Google Sheets
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60 text-yellow-400" />
            </button>

          </div>

          {/* AI Risk notice card in sidebar matching Geometric design */}
          <div className="bg-blue-950/60 dark:bg-slate-900/80 p-4 rounded-2xl border border-blue-850 dark:border-slate-800">
            <div className="bg-yellow-400/10 p-3 rounded-xl border border-yellow-400/20">
              <p className="text-[10px] text-yellow-400 font-bold uppercase mb-1 tracking-wider">Cảnh báo rủi ro AI</p>
              <p className="text-xs text-blue-100 dark:text-slate-200">
                {summary.riskPrecent > 20 ? 'Phát hiện thành viên có nguy cơ trễ.' : 'Tín nhiệm hụi viên đang ở mức lý tưởng.'}
              </p>
            </div>
            <p className="text-[10.5px] text-blue-200/80 dark:text-slate-400 mt-2 font-mono italic leading-relaxed">
              ★ {summary.systemAlert}
            </p>
          </div>
        </aside>

        {/* Primary View container: lg:col-span-9 */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Dashboard VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-sky-600 dark:border-l-4 dark:border-l-sky-600 p-5 rounded-2xl shadow-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Số Đường Dây Hụi</span>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100">
                      {summary.totalLines}
                    </span>
                    <span className="text-xs bg-sky-50 dark:bg-sky-950 text-sky-700 px-2 py-0.5 rounded-full font-bold">dây đang chạy</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-yellow-400 dark:border-l-4 dark:border-l-yellow-400 p-5 rounded-2xl shadow-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Quy mô hụi viên</span>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100">
                      {summary.totalMembers}
                    </span>
                    <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">mối liên kết</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-slate-850 dark:border-l-4 dark:border-l-slate-400 p-5 rounded-2xl shadow-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Hoa Hồng Đút Túi</span>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {summary.totalCommissions.toLocaleString()}đ
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">đầu thảo</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-red-500 dark:border-l-4 dark:border-l-red-500 p-5 rounded-2xl shadow-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Chỉ số rủi ro vỡ hụi</span>
                  <div className="flex items-end justify-between">
                    <span className={`text-3xl font-black font-mono ${
                      summary.riskPrecent > 30 ? 'text-red-500' : (summary.riskPrecent > 15 ? 'text-amber-500' : 'text-emerald-500')
                    }`}>
                      {summary.riskPrecent}%
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      summary.riskPrecent > 25 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {summary.riskPrecent > 25 ? 'NGUY HIỂM' : 'AN TOÀN'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Graphic Financial Growth / Sổ dư quỹ pure SVG render chart */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3 border-slate-50 dark:border-slate-850">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Biểu đồ đối sánh dòng tiền đóng hốt 2026</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Trực quan dòng tiền nạp đóng hụi sống/chết và chi trả thấu hốt cho bà con</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-sky-500 rounded-xs inline-block"></span>
                      <span className="text-slate-600 dark:text-slate-400">Thu đóng hụi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-red-400 rounded-xs inline-block"></span>
                      <span className="text-slate-600 dark:text-slate-400">Chi hốt thấu</span>
                    </div>
                  </div>
                </div>

                {/* Pure SVG Custom chart that guarantees React 19 visual compatibility flawlessly */}
                <div className="pt-2 flex items-center justify-center">
                  <svg className="w-full max-w-2xl h-44 overflow-visible" viewBox="-30 -10 540 180">
                    {/* Gridlines */}
                    <line x1="0" y1="0" x2="480" y2="0" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
                    <line x1="0" y1="40" x2="480" y2="40" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
                    <line x1="0" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
                    <line x1="0" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800" />
                    <line x1="0" y1="150" x2="480" y2="150" stroke="#94a3b8" strokeWidth="1.5" />

                    {/* Left vertical rules */}
                    <text x="-12" y="5" className="text-[9px] fill-slate-400 font-mono text-right">30M</text>
                    <text x="-12" y="45" className="text-[9px] fill-slate-400 font-mono text-right">20M</text>
                    <text x="-12" y="85" className="text-[9px] fill-slate-400 font-mono text-right">10M</text>
                    <text x="-12" y="125" className="text-[9px] fill-slate-400 font-mono text-right">5M</text>
                    <text x="-12" y="154" className="text-[9px] fill-slate-400 font-mono text-right">0</text>

                    {/* Chart Bars/Columns mock data representing months */}
                    {/* Feb month */}
                    <rect x="50" y="70" width="18" height="80" fill="#0284c7" rx="3" />
                    <rect x="72" y="80" width="18" height="70" fill="#f87171" rx="3" />
                    <text x="65" y="165" className="text-[10px] fill-slate-400 font-semibold text-center font-mono">Tháng 2</text>

                    {/* Mar month */}
                    <rect x="150" y="60" width="18" height="90" fill="#0284c7" rx="3" />
                    <rect x="172" y="75" width="18" height="75" fill="#f87171" rx="3" />
                    <text x="165" y="165" className="text-[10px] fill-slate-400 font-semibold text-center font-mono">Tháng 3</text>

                    {/* Apr month */}
                    <rect x="250" y="40" width="18" height="110" fill="#0284c7" rx="3" />
                    <rect x="272" y="60" width="18" height="90" fill="#f87171" rx="3" />
                    <text x="265" y="165" className="text-[10px] fill-slate-400 font-semibold text-center font-mono">Tháng 4</text>

                    {/* May month (Current) */}
                    <rect x="350" y="52" width="18" height="98" fill="#0284c7" rx="3" fillOpacity="0.8" />
                    <rect x="372" y="115" width="18" height="35" fill="#f87171" rx="3" fillOpacity="0.8" />
                    <text x="365" y="165" className="text-[10px] fill-slate-400 font-semibold text-center font-mono">Tháng 5</text>
                  </svg>
                </div>
              </div>

              {/* Bottom twin boxes: Active alerts / Quick Logs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Active Alerts */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                    Cảnh Báo Độ Uy Tín Nợ Hụi Gần Đây
                  </h3>
                  
                  {members.filter(m => m.reputation < 70).map(m => (
                    <div key={m.id} className="p-4 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-red-800 dark:text-red-400">{m.name}</h4>
                        <p className="text-[11px] text-slate-500">{m.address}</p>
                        <p className="text-[10px] text-red-600 bg-red-100/60 font-medium p-1 rounded-sm block w-fit">
                          Lý do: Điểm uy tín sụt xuống {m.reputation} điểm.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('members')}
                        className="py-1 px-3 bg-red-100 dark:bg-red-900 hover:bg-red-200 text-red-800 dark:text-red-200 text-[10px] font-bold rounded-lg cursor-pointer"
                      >
                        Mở Hồ Sơ
                      </button>
                    </div>
                  ))}
                  
                  {members.filter(m => m.reputation < 70).length === 0 && (
                    <div className="h-32 border border-dashed text-slate-400 flex flex-col items-center justify-center rounded-xl p-4 text-center">
                      <ShieldCheck className="w-8 h-8 text-emerald-500 mb-2" />
                      <p className="text-xs font-bold">Bà con đóng hụi đều đặn quý giá!</p>
                      <p className="text-[10px] text-slate-500 mt-1">Chưa thấy dấu hiệu bùng, giật thầu thấu bất thường nào.</p>
                    </div>
                  )}
                </div>

                {/* Audit Logs */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-5 h-5 text-sky-600" />
                      Nhật Ký Nghiệp Vụ Khui Hốt
                    </h3>
                    
                    <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                      {logs.slice(0, 4).map((log, i) => (
                        <div key={i} className="text-xs space-y-1.5 border-l-2 border-sky-600 pl-3.5 py-0.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-3 flex justify-end">
                    <span className="text-[10px] text-slate-400 italic">Vận hành và kiểm toán bởi dòng họ Út Hương</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Lines View */}
          {activeTab === 'lines' && (
            <HuiLineManager 
              lines={lines} 
              members={members} 
              onCreateLine={handleCreateLine}
              onDeleteLine={handleDeleteLine}
              onBidLine={handleBidLine}
            />
          )}

          {/* Members View */}
          {activeTab === 'members' && (
            <MemberManager 
              members={members} 
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
            />
          )}

          {/* Finance View */}
          {activeTab === 'finance' && (
            <FinanceManager 
              receivables={receivables} 
              transactions={transactions} 
              onPayReceivable={handlePayReceivable}
              onAddTransaction={handleAddTransaction}
              onShowReceipt={(p) => {
                setActiveReceiptWinner(null);
                setActiveReceiptPayment(p);
                setShowReceiptModal(true);
              }}
            />
          )}

          {/* AI Advisor View */}
          {activeTab === 'ai' && (
            <AiRiskCenter lines={lines} />
          )}

          {/* ERD specifications table */}
          {activeTab === 'erd' && (
            <ErdSpecs />
          )}

          {/* Google Sheets Sync portal */}
          {activeTab === 'sheets' && (
            <GoogleSheetsSync />
          )}


        </main>

      </div>

      {/* 3. Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-12 text-center text-xs text-slate-400 no-print space-y-2">
        <p className="font-black text-slate-800 dark:text-slate-200 tracking-wider">NỀN TẢNG QUẢN LÝ HỤI PRO 2026</p>
        <p className="text-slate-500 dark:text-slate-400">Thiết kế tùy biến riêng cho tiểu thương, nhà vườn vùng sông nước Đồng Bằng Sông Cửu Long Việt Nam.</p>
        <p className="text-red-700 dark:text-red-500 font-extrabold text-sm uppercase bg-red-50 dark:bg-red-950/20 max-w-fit mx-auto px-4 py-1 border border-red-200/50 rounded-full shadow-xs">
          Nguyễn Công Dinh_Zalo 039.399.0638
        </p>
        <p className="font-mono text-[10px] text-slate-400">Bảo trì hệ thống bởi HP-Tech Co. • Phiên bản 1.2.0-Cực kỳ sòng phẳng</p>
      </footer>

      {/* 4. Global E-Receipt modals layer */}
      <ReceiptModal 
        isOpen={showReceiptModal} 
        onClose={() => setShowReceiptModal(false)}
        payment={activeReceiptPayment}
        periodWinner={activeReceiptWinner}
      />

    </div>
  );
}
