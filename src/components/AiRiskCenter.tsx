/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Brain, AlertTriangle, ShieldCheck, HelpCircle, Send, Loader2, ArrowRight } from 'lucide-react';
import { HuiLine, AIRiskAnalysis } from '../types';

interface AiRiskCenterProps {
  lines: HuiLine[];
}

export default function AiRiskCenter({ lines }: AiRiskCenterProps) {
  const [selectedLineId, setSelectedLineId] = useState(lines[0]?.id || '');
  const [analysisResult, setAnalysisResult] = useState<AIRiskAnalysis | null>(null);
  const [loadingScan, setLoadingScan] = useState(false);

  // Chat advisor states
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    { sender: 'assistant', text: 'Chèo bà con nhen! Thôn quê Tây Nam Bộ mình sống trọn chữ tình xóm giềng. Con kẹt chuyện hụi bơi, cách gom nợ, hay bỏ thầu thấu bao nhiêu thì an toàn cứ nhắn cho cô Út Hương giải đáp hết nghen.' }
  ]);
  const [loadingChat, setLoadingChat] = useState(false);

  const handleScanRisk = async () => {
    if (!selectedLineId) return;
    setLoadingScan(true);
    try {
      const response = await fetch('/api/ai/analyze-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineId: selectedLineId })
      });
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error("AI Scan failed", err);
    } finally {
      setLoadingScan(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userPrompt = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userPrompt }]);
    setLoadingChat(true);

    try {
      const response = await fetch('/api/ai/chat-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt })
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { sender: 'assistant', text: data.answer || "Út bận chút chuyện khui hụi rồi, hỏi lại mát lành sau nghe con!" }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { sender: 'assistant', text: "Lỗi đường cáp sông Tiền rồi con ơi, hỏi lại nha!" }]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      
      {/* Risk Scanner Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-sky-600 animate-pulse" />
            AI Phân Tích Rủi Ro Dây Hụi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ứng dụng công nghệ xử lý ngôn ngữ tự động phân tích điểm an toàn dột ngột từ dữ liệu đóng thầu
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Chọn dây hụi phân phát
            </label>
            <select
              value={selectedLineId}
              onChange={(e) => setSelectedLineId(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100 pointer-events-auto"
            >
              {lines.map((l) => (
                <option key={l.id} value={l.id}>{l.name} - Đầu {l.value.toLocaleString()}đ</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleScanRisk}
            disabled={loadingScan || !selectedLineId}
            className="self-end px-5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-600/10 flex items-center gap-2 transition-all transition-colors cursor-pointer"
          >
            {loadingScan ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang quét...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Khởi chạy quét AI
              </>
            )}
          </button>
        </div>

        {/* Scan Results Board */}
        {analysisResult ? (
          <div className="mt-4 bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
            
            {/* Score circle */}
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div className="relative flex items-center justify-center w-20 h-20 bg-white dark:bg-slate-900 rounded-full border-4 border-sky-100 dark:border-sky-950 shadow-sm">
                <span className={`text-2xl font-black font-mono ${
                  analysisResult.safetyScore >= 80 ? 'text-emerald-600' : (analysisResult.safetyScore >= 65 ? 'text-amber-500' : 'text-rose-600')
                }`}>
                  {analysisResult.safetyScore}
                </span>
                <span className="text-[10px] text-slate-400 absolute bottom-2 font-bold uppercase tracking-wider">An Toàn</span>
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <span className="text-xs font-bold text-slate-500">Cấp độ rủi ro:</span>
                  <span className={`px-2.5 py-0.5 text-[10px] uppercase font-black tracking-widest rounded-full ${
                    analysisResult.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-800' : (analysisResult.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                  }`}>
                    {analysisResult.riskLevel === 'LOW' ? 'AN TOÀN CAO' : (analysisResult.riskLevel === 'MEDIUM' ? 'TRUNG BÌNH' : 'CẢNH BÁO CAO')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  &ldquo;{analysisResult.summary}&rdquo;
                </p>
              </div>
            </div>

            {/* Factors list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Các nguy cơ tiềm tàng phát hiện bóng hụt:
              </h4>
              <ul className="space-y-1.5">
                {analysisResult.factors.map((f, index) => (
                  <li key={index} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-500 mt-1 flex-shrink-0">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-850">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Phương án gia cố đường hụi an toàn:
              </h4>
              <ul className="space-y-1.5">
                {analysisResult.recommendations.map((r, index) => (
                  <li key={index} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        ) : (
          <div className="h-48 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-750 mb-3" />
            <p className="text-sm font-semibold">Chưa có kết quả chẩn đoán rủi ro</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Ấn &quot;Khởi chạy quét AI&quot; để mổ xẻ phân tích dòng thầu của dây này nghe con!</p>
          </div>
        )}
      </div>

      {/* Advisor Chatbot Box Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col h-[520px]">
        {/* Chat Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            Út Hương AI – Cố Vấn Tận Tâm
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gửi câu hỏi của bạn về luật chơi, tiền thảo hay giải đáp tranh chấp hụi miền Tây sông nước
          </p>
        </div>

        {/* Chat History Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 my-3 space-y-3 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850">
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <divspan className="text-[10px] text-slate-400 mb-0.5 font-bold">
                {msg.sender === 'user' ? 'Hụi Viên' : 'Dì Út Hương Chủ Hụi'}
              </divspan>
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-sky-600 text-white rounded-tr-none font-medium' 
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 rounded-tl-none font-normal'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loadingChat && (
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
              <span>Dì Út đang nhai trầu rồi gõ ý kiến phản hồi nhen...</span>
            </div>
          )}
        </div>

        {/* Chat Input form */}
        <form onSubmit={handleSendChat} className="flex gap-2 flex-shrink-0 pt-2 border-t border-slate-100 dark:border-slate-800">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ví dụ: Có nên cho dì Út Trà Cú hốt hụi sớm dây này không Út?"
            className="flex-1 text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 pointer-events-auto"
          />
          <button
            type="submit"
            disabled={loadingChat || !chatInput.trim()}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center flex-shrink-0 transition-colors pointer-events-auto"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
