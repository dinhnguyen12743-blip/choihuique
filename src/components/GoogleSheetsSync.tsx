/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CloudLightning, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Code, 
  Copy, 
  Check, 
  ExternalLink,
  BookOpen,
  Settings
} from 'lucide-react';

interface SheetConfig {
  sheetId: string;
  appsScriptUrl: string;
  isConnected?: boolean;
  lastSynced?: string;
  source?: 'sheets' | 'local';
}

export default function GoogleSheetsSync() {
  const [appsScriptUrl, setAppsScriptUrl] = useState('');
  const [sheetId, setSheetId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({ text: '', type: null });
  const [isCopied, setIsCopied] = useState(false);
  const [sheetConfig, setSheetConfig] = useState<SheetConfig | null>(null);

  // Load backend config on component mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/sheets/config');
      if (res.ok) {
        const data = await res.json();
        setSheetConfig(data);
        setAppsScriptUrl(data.appsScriptUrl || '');
        setSheetId(data.sheetId || '');
      }
    } catch (err) {
      console.error("Lỗi nạp cấu hình Google Sheets:", err);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ text: 'Đang kiểm tra kết nối với Google Sheets...', type: 'info' });

    try {
      const res = await fetch('/api/sheets/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetId, appsScriptUrl })
      });

      const responseData = await res.json();

      if (res.ok && responseData.connected) {
        setSaveSuccess(true);
        setStatusMessage({ 
          text: `Đã kết nối thành công! Thiết lập mới đã được xác thực bảo mật và kích hoạt hoạt động.`, 
          type: 'success' 
        });
        fetchConfig();
      } else {
        setStatusMessage({ 
          text: responseData.error || `Lỗi kết nối. Vui lòng kiểm tra lại Đường dẫn Apps Script API và quyền chia sẻ của Google Sheet ID.`, 
          type: 'error' 
        });
      }
    } catch (err) {
      setStatusMessage({ 
        text: 'Lỗi thực thi mạng. Kiểm tra xem Apps Script URL có đúng định dạng https://script.google.com/macros/s/.../exec không.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  const syncPull = async () => {
    if (!sheetId || !appsScriptUrl) {
      setStatusMessage({ text: 'Vui lòng điền và lưu cấu hình kết nối trước khi đồng bộ.', type: 'error' });
      return;
    }
    setIsLoading(true);
    setStatusMessage({ text: 'Đang kết hợp tải dữ liệu trực tiếp từ Google Sheets...', type: 'info' });

    try {
      const res = await fetch('/api/sheets/sync-pull', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ 
          text: `Đã khôi phục và phục hồi thành công ${data.recordsCount || 'toàn bộ'} dòng dữ liệu từ Google Sheets về cơ sở dữ liệu nội bộ.`, 
          type: 'success' 
        });
        fetchConfig();
        // Force refresh UI after short delay so updates propagate
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setStatusMessage({ text: data.error || 'Lỗi kéo dữ liệu. Vui lòng kiểm tra lại quyền của Apps Script.', type: 'error' });
      }
    } catch (err) {
      setStatusMessage({ text: 'Lỗi kết nối mạng trong quá trình truy xuất Sheets.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const syncPush = async () => {
    if (!sheetId || !appsScriptUrl) {
      setStatusMessage({ text: 'Vui lòng điền và lưu cấu hình kết nối trước khi đồng bộ.', type: 'error' });
      return;
    }
    setIsLoading(true);
    setStatusMessage({ text: 'Đang tải và đồng bộ toàn bộ cơ sở dữ liệu nội bộ lên Google Sheets...', type: 'info' });

    try {
      const res = await fetch('/api/sheets/sync-push', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ 
          text: 'Phát hành cơ sở dữ liệu lên Google Sheets thành công! Toàn bộ 8 Sheets đã được làm mới.', 
          type: 'success' 
        });
        fetchConfig();
      } else {
        setStatusMessage({ text: data.error || 'Lỗi đẩy dữ liệu lên Sheets.', type: 'error' });
      }
    } catch (err) {
      setStatusMessage({ text: 'Lỗi kết nối mạng trong quá trình đẩy dữ liệu.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const appsScriptTemplate = `/**
 * Google Apps Script Web App API for Huipro 2026
 * Paste this code inside your extensions -> Apps Script Editor
 * Click "Deploy" -> "New deployment" -> "Web App"
 * Set "Execute as: Me" and "Who has access: Anyone"
 */

function doGet(e) {
  var action = e.parameter.action;
  var sheetId = e.parameter.sheetId;
  
  if (!sheetId) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Missing sheetId parameter" }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    var ss = SpreadsheetApp.openById(sheetId);
    
    if (action === "getAllData" || !action) {
      var data = {};
      var sheetNames = ["Users", "DayHui", "ThanhVien", "DongHui", "HotHui", "CongNo", "ThuChi", "AuditLog"];
      
      sheetNames.forEach(function(name) {
        var sheet = ss.getSheetByName(name);
        if (!sheet) {
          // Auto create sheet if missing
          sheet = ss.insertSheet(name);
          setupSheetHeaders(sheet, name);
        }
        
        var rows = sheet.getDataRange().getValues();
        if (rows.length <= 1) {
          data[name] = [];
        } else {
          var headers = rows[0];
          var list = [];
          for (var i = 1; i < rows.length; i++) {
            var item = {};
            for (var j = 0; j < headers.length; j++) {
              item[headers[j]] = rows[i][j];
            }
            list.push(item);
          }
          data[name] = list;
        }
      });
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: "Unknown action" }))
                         .setMimeType(ContentService.MimeType.JSON);
                         
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var sheetId = postData.sheetId;
    var action = postData.action;
    
    if (!sheetId) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Missing sheetId in POST body" }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    var ss = SpreadsheetApp.openById(sheetId);
    
    if (action === "syncAllData" && postData.data) {
      var inputSheets = postData.data;
      
      Object.keys(inputSheets).forEach(function(name) {
        var sheet = ss.getSheetByName(name);
        if (!sheet) {
          sheet = ss.insertSheet(name);
        }
        
        sheet.clear();
        setupSheetHeaders(sheet, name);
        
        var rowsToWrite = inputSheets[name];
        if (rowsToWrite && rowsToWrite.length > 0) {
          var headersLength = getHeadersFor(name).length;
          // Ensure each row matches header length
          var formattedRows = rowsToWrite.map(function(row) {
            // pad or slice to match headers exactly
            var newRow = [];
            for (var k = 0; k < headersLength; k++) {
              newRow.push(row[k] !== undefined ? row[k] : "");
            }
            return newRow;
          });
          
          sheet.getRange(2, 1, formattedRows.length, headersLength).setValues(formattedRows);
        }
      });
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Synchronized all sheets successfully" }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: "Unknown POST action" }))
                         .setMimeType(ContentService.MimeType.JSON);
                         
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function getHeadersFor(name) {
  switch(name) {
    case "Users": 
      return ["ID", "HoTen", "SoDienThoai", "VaiTro", "TrangThai", "CreatedAt", "address", "notes"];
    case "DayHui": 
      return ["ID", "TenDayHui", "GiaTriPhan", "SoPhan", "NgayMo", "TrangThai", "KyHienTai", "Commission"];
    case "ThanhVien": 
      return ["ID", "DayHuiID", "HoTen", "IsWithdrawn", "WithdrawnPeriod", "BidAmount", "TotalPaid", "TotalReceived", "Alias"];
    case "DongHui": 
      return ["ID", "ThanhVienID", "KyHui", "SoTien", "NgayDong", "TrangThai"];
    case "HotHui": 
      return ["ID", "ThanhVienID", "KyHot", "GiaBoHui", "TienThucNhan", "WinnerName", "Date"];
    case "CongNo": 
      return ["ID", "ThanhVienID", "SoTienNo", "HanThanhToan", "TrangThai"];
    case "ThuChi": 
      return ["ID", "Loai", "SoTien", "NoiDung", "NgayGiaoDich"];
    case "AuditLog": 
      return ["ID", "UserID", "HanhDong", "ThoiGian"];
    default: 
      return ["ID"];
  }
}

function setupSheetHeaders(sheet, name) {
  var headers = getHeadersFor(name);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1e3a8a").setFontColor("#ffffff");
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptTemplate);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isCurrentActive = sheetConfig?.isConnected;

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="bg-blue-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-sm border border-blue-950">
        <div className="absolute right-0 top-0 p-8 opacity-10">
          <Database className="w-48 h-48" />
        </div>
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-yellow-400 text-blue-950 text-[10px] font-black uppercase px-2 py-0.5 rounded">SaaS Integration</span>
            <span className="bg-blue-800 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">Google Sheets DB</span>
          </div>
          <h2 className="text-xl font-black font-display tracking-tight text-white uppercase italic">
            Phân Hệ Đồng Bộ Google Sheets Điện Tử Pro
          </h2>
          <p className="text-sm text-blue-100 leading-relaxed font-light">
            Vận hành toàn vẹn cơ sở dữ liệu hụi trên nền tảng đám mây Google. Đọc, ghi và sao lưu sòng phẳng, bảo mật tuyệt đối với Google Apps Script API. Không lo rò rỉ dữ liệu hoặc mất đồng bộ.
          </p>
        </div>
      </div>

      {/* Grid of panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Connection Configuration */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isCurrentActive 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-300' 
              : 'bg-amber-50/70 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-300'
          }`}>
            <div className="flex items-start gap-3">
              {isCurrentActive ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 w-full">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Trạng Thái Kết Nối: {isCurrentActive ? 'ĐÃ KẾT NỐI CLOUD' : 'CHẾ ĐỘ NGOẠI TUYẾN (HỤI NỘI BỘ)'}
                </h4>
                <p className="text-xs font-medium">
                  {isCurrentActive 
                    ? `Đang đồng bộ trực tuyến với Google Sheets (ID: ...${sheetId.slice(-8) || 'Sheets'}). Dữ liệu an toàn tuyệt đối.` 
                    : `Hệ thống đang chạy trên bộ nhớ lưu trữ đệm JSON cục bộ của máy chủ. Cần cấu hình Apps Script để mở khóa đồng bộ đám mây.`}
                </p>
                {sheetConfig?.lastSynced && (
                  <p className="text-[10px] opacity-85 font-mono italic mt-1.5">
                    ● Lượt đồng bộ gần nhất: {new Date(sheetConfig.lastSynced).toLocaleString('vi-VN')}
                  </p>
                )}
                
                {sheetId && (
                  <div className="pt-2">
                    <a 
                      href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`}
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 font-bold text-xs rounded-xl shadow-xs transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Truy cập nhanh / Mở Google Sheet</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
              <Settings className="w-4.5 h-4.5 text-blue-900 dark:text-white" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Tham số cấu hình cổng kết nối</h3>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Google Sheet ID <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Điền Spreadsheet ID từ thanh địa chỉ Google Sheets"
                  className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-blue-800 outline-none"
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 italic">
                  Ví dụ: 1aBC-X_DefGh_iJkLmNoPqRstUvWxYzA123456789abc
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Google Apps Script Web App URL <span className="text-red-500">*</span>
                </label>
                <input 
                  type="url"
                  required
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-blue-800 outline-none"
                  value={appsScriptUrl}
                  onChange={(e) => setAppsScriptUrl(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 italic">
                  Đường dẫn triển khai dạng Web App sau khi xuất bản từ trang Apps Script.
                </p>
              </div>

              {statusMessage.text && (
                <div className={`p-3 rounded-lg text-xs font-semibold ${
                  statusMessage.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : statusMessage.type === 'error'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  {statusMessage.text}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-900 hover:bg-blue-950 disabled:bg-blue-800/60 dark:bg-blue-800 dark:hover:bg-blue-900 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <CloudLightning className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Lưu & Kiểm Tra Kết Nối Cloud
                </button>
              </div>
            </form>
          </div>

          {/* Sync Trigger buttons */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
              <RefreshCw className="w-4.5 h-4.5 text-blue-900 dark:text-white" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Đồng Bộ Thủ Công Trực Tiếp</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Mặc dù hệ thống Quản Lý Hụi Pro tự động đồng bộ ngầm khi phát sinh thêm bớt kỳ đấu/hốt/đóng hụi, chủ hụi có thể kích hoạt kéo/đẩy dữ liệu thủ công bất cứ lúc nào để đồng bộ hai chiều.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={syncPull}
                disabled={isLoading || !sheetId || !appsScriptUrl}
                className="p-4 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/20 dark:hover:bg-yellow-950/40 text-blue-900 dark:text-yellow-400 border border-yellow-200 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all text-xs font-extrabold cursor-pointer disabled:opacity-40"
              >
                <Download className="w-6 h-6 shrink-0 text-yellow-600 dark:text-yellow-400" />
                <span>Kéo Data Từ Sheets Về</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal normal-case block text-center">
                  Nhập đè lên bộ nhớ nội bộ
                </span>
              </button>

              <button
                type="button"
                onClick={syncPush}
                disabled={isLoading || !sheetId || !appsScriptUrl}
                className="p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/10 dark:hover:bg-blue-950/30 text-blue-900 dark:text-blue-300 border border-blue-200 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all text-xs font-extrabold cursor-pointer disabled:opacity-40"
              >
                <Upload className="w-6 h-6 shrink-0 text-blue-700 dark:text-blue-400" />
                <span>Ghi Đè Data Lên Sheets</span>
                <span className="text-[10px] text-slate-500 normal-case block text-center">
                  Ghi mới toàn bộ 8 Table lên đám mây
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Setup Instructions & Script Code Template */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 space-y-5 border border-slate-950 shadow-lg">
            
            <div className="flex items-center justify-between border-b pb-3.5 border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-yellow-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  Google Apps Script Code
                </h3>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 py-1 px-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-[10px] font-bold text-slate-200 cursor-pointer transition-all border border-slate-700"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã Copy</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao Chép Mã</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-yellow-400">
                <BookOpen className="w-4.5 h-4.5 text-yellow-400" />
                <span>Hướng dẫn cài đặt nhanh 3 bước:</span>
              </div>

              <ol className="text-xs text-slate-300 class-ol space-y-3 pl-4 list-decimal leading-relaxed">
                <li>
                  Nhấp vào nút <span className="text-white font-semibold">Sao Chép Mã</span> ở trên.
                </li>
                <li>
                  Mở tệp Google Sheets của con, nhấn vào <span className="text-white font-semibold">Tiện ích mở rộng (Extensions)</span> &rarr; <span className="text-white font-semibold">Apps Script</span>. Xóa toàn bộ mã mặc định và dán đoạn mã này vào. Nhấn biểu tượng lưu lại.
                </li>
                <li>
                  Bấm <span className="text-white font-semibold">Triển khai (Deploy)</span> &rarr; <span className="text-white font-semibold">Tải triển khai mới (New deployment)</span>. Chọn loại là <span className="text-white font-semibold">Ứng dụng Web (Web App)</span>.
                  <div className="mt-1 bg-slate-950 p-2 rounded-lg font-mono text-[10px] text-yellow-500/90 leading-tight space-y-1 border border-slate-850">
                    <div>● Execute as: Me (Email của con)</div>
                    <div>● Who has access: Anyone (Mọi người)</div>
                  </div>
                </li>
                <li>
                  Sao chép <span className="text-yellow-400 font-semibold font-mono">Web App URL</span> nhận được và dán vào ô cài đặt bên trái để kích hoạt cổng đồng bộ!
                </li>
              </ol>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 justify-between">
                <span>Spreadsheet tự động sinh 8 trang tính khi kết nối.</span>
                <a 
                  href="https://sheets.google.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-yellow-400 hover:underline flex items-center gap-1 font-bold shrink-0"
                >
                  Google Sheets <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
