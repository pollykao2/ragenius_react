"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

// ===== 型別定義 =====
type NewsItem = {
  title: string;
  link: string;
  sentiment: string;
  score: number;
  query?: string;
  published?: string | null;
};

// 支援的股票清單對照表
const SUPPORTED_STOCKS = [
  { name: "台積電", id: "2330.TW" },
  { name: "鴻海", id: "2317.TW" },
  { name: "聯電", id: "2303.TW" },
  { name: "廣達", id: "2382.TW" },
  { name: "聯發科", id: "2454.TW" },
  { name: "緯創", id: "3231.TW" },
  { name: "元大台灣50 (0050)", id: "0050.TW" },
  { name: "元大高股息 (0056)", id: "0056.TW" },
];

const API_BASE = "http://127.0.0.1:5000";

export default function Home() {
  // 狀態管理：記錄當前選中的股票 ID
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [isNewWindowMode, setIsNewWindowMode] = useState<boolean>(false);
  
  // 數據狀態
  const [marketSummary, setMarketSummary] = useState<any>(null);
  const [stockDetail, setStockDetail] = useState<any>(null);
  
  // 讀取與錯誤狀態
  const [loadingMarket, setLoadingMarket] = useState<boolean>(true);
  const [loadingStock, setLoadingStock] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. 初始化檢查：解析 URL 參數，判斷當前視窗是「大盤首頁」還是「另開的個股報告新視窗」
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tickerParam = params.get("ticker");

    if (tickerParam) {
      // 💡 進入個股新視窗模式
      setSelectedStock(tickerParam);
      setIsNewWindowMode(true);
      setLoadingStock(true);

      fetch(`${API_BASE}/api/stock/${tickerParam}`)
        .then((res) => {
          if (!res.ok) throw new Error("無法取得個股分析數據");
          return res.json();
        })
        .then((data) => {
          setStockDetail(data);
          setLoadingStock(false);
        })
        .catch((err) => {
          console.error(err);
          setLoadingStock(false);
        });
    } else {
      // 💡 進入常規大盤首頁模式
      setLoadingMarket(true);
      fetch(`${API_BASE}/api/market-summary`)
        .then((res) => {
          if (!res.ok) throw new Error("無法取得大盤數據");
          return res.json();
        })
        .then((data) => {
          setMarketSummary(data);
          setLoadingMarket(false);
        })
        .catch((err) => {
          console.error(err);
          setError("載入大盤資料失敗，請確認後端 Flask 是否正常啟動。");
          setLoadingMarket(false);
        });
    }
  }, []);

  // 2. 核心功能修改：點擊股票按鈕時，觸發 window.open 另開全新獨立視窗
  const handleOpenStockWindow = (stockId: string) => {
    // 取得當前的路徑基礎（確保在 /stock 或是 / 都能正常開啟）
    const basePath = window.location.pathname;
    const newWindowUrl = `${basePath}?ticker=${stockId}`;
    
    // ✨ 另開新視窗（_blank）
    window.open(newWindowUrl, "_blank");
  };

  // 取得當前選中股票的中文名稱
  const currentStockName = SUPPORTED_STOCKS.find((s) => s.id === selectedStock)?.name || "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      
      {/* ==================== 系統頂部導覽列 ==================== */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4 bg-white p-5 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-600 flex items-center gap-2">
            🚀 RAGenius 股市智慧聯網預測系統
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            結合技術指標、即時財經新聞情緒分析與 RAG 檢索增強生成技術
          </p>
        </div>
        
        {/* 如果是在另開的個股新視窗內，提供關閉分頁的按鈕 */}
        {isNewWindowMode && (
          <button
            onClick={() => window.close()}
            className="px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-sm transition active:scale-95"
          >
            ❌ 關閉報告視窗
          </button>
        )}
      </header>

      {error && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center">
          {error}
        </div>
      )}

      <main className="max-w-7xl mx-auto space-y-8">
        
        {/* ==================== 模式一：大盤首頁畫面 ==================== */}
        {!selectedStock ? (
          <>
            {/* 三大指數小方框儀表板 */}
            {loadingMarket ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-slate-200 rounded-2xl shadow-sm"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 台灣加權指數方框 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-red-500 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Market Index</span>
                    <h3 className="text-lg font-bold text-slate-700 mt-0.5">台股加權指數</h3>
                  </div>
                  <div className="my-2">
                    <span className="text-3xl font-black text-slate-900">
                      {marketSummary?.index_twii?.last ? marketSummary.index_twii.last.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "N/A"}
                    </span>
                  </div>
                  <div className="text-xs flex flex-wrap gap-2 text-slate-500">
                    <span className={`px-2 py-0.5 rounded font-medium ${marketSummary?.index_twii?.trend === "偏多" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                      趨勢: {marketSummary?.index_twii?.trend || "分析中"}
                    </span>
                    <span>RSI: {marketSummary?.index_twii?.rsi?.toFixed(1) || "N/A"} ({marketSummary?.index_twii?.rsi_note})</span>
                  </div>
                </div>

                {/* S&P 500 指數方框 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-blue-500 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Market Index</span>
                    <h3 className="text-lg font-bold text-slate-700 mt-0.5">S&P 500 指數</h3>
                  </div>
                  <div className="my-2">
                    <span className="text-3xl font-black text-slate-900">
                      {marketSummary?.index_spx?.last ? marketSummary.index_spx.last.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "N/A"}
                    </span>
                  </div>
                  <div className="text-xs flex flex-wrap gap-2 text-slate-500">
                    <span className={`px-2 py-0.5 rounded font-medium ${marketSummary?.index_spx?.macd_note === "買入" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                      MACD: {marketSummary?.index_spx?.macd_note || "分析中"}
                    </span>
                    <span>RSI: {marketSummary?.index_spx?.rsi?.toFixed(1) || "N/A"}</span>
                  </div>
                </div>

                {/* 那斯達克指數方框 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-purple-500 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Market Index</span>
                    <h3 className="text-lg font-bold text-slate-700 mt-0.5">NASDAQ 指數</h3>
                  </div>
                  <div className="my-2">
                    <span className="text-3xl font-black text-slate-900">
                      {marketSummary?.index_ixic?.last ? marketSummary.index_ixic.last.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "N/A"}
                    </span>
                  </div>
                  <div className="text-xs flex flex-wrap gap-2 text-slate-500">
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded font-medium">
                      趨勢: {marketSummary?.index_ixic?.trend || "分析中"}
                    </span>
                    <span>RSI: {marketSummary?.index_ixic?.rsi?.toFixed(1) || "N/A"} ({marketSummary?.index_ixic?.rsi_note})</span>
                  </div>
                </div>
              </div>
            )}

            {/* 中間主體：加權指數走勢圖 與 股票選擇清單 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 加權指數大走勢圖方框 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1">
                    📈 台灣加權指數歷史走勢（近10日）
                  </h2>
                  <span className="text-xs text-slate-400">數據即時更新自 yfinance</span>
                </div>
                
                {loadingMarket ? (
                  <div className="h-64 bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-slate-400">
                    大盤圖表載入中...
                  </div>
                ) : marketSummary?.twii_chart ? (
                  <div className="w-full">
                    <Line
                      data={{
                        labels: marketSummary.twii_chart.dates,
                        datasets: [
                          {
                            label: "加權指數收盤點數",
                            data: marketSummary.twii_chart.prices,
                            borderColor: "#ef4444",
                            backgroundColor: "rgba(239, 68, 68, 0.04)",
                            borderWidth: 2.5,
                            pointRadius: 3,
                            pointBackgroundColor: "#ef4444",
                            tension: 0.15,
                            fill: true,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { ticks: { color: "#64748b" }, grid: { color: "#f1f5f9" } },
                          x: { ticks: { color: "#64748b" }, grid: { display: false } },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-center text-sm text-slate-400 py-10">暫無加權指數走勢圖資料</p>
                )}
              </div>

              {/* 股票點擊導覽方框（點擊後會另開視窗） */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <h2 className="text-lg font-bold text-slate-800 mb-1">🔍 智能個股導覽系統</h2>
                <p className="text-xs text-slate-400 mb-4">點擊指定權值股或 ETF，將會【另開新視窗】動態查看後端 RAG 與 GPT-4o 生成之決策分析報告。</p>
                
                <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1 max-h-[300px] pr-1">
                  {SUPPORTED_STOCKS.map((stock) => (
                    <button
                      key={stock.id}
                      onClick={() => handleOpenStockWindow(stock.id)}
                      className="p-3.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 font-bold border border-blue-100 hover:border-blue-200 shadow-sm text-center transition hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-0.5 group"
                    >
                      <span className="text-base group-hover:text-blue-800">{stock.name.split(" ")[0]}</span>
                      <span className="text-xs font-medium text-slate-400 group-hover:text-blue-500">
                        {stock.id.split(".")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 大盤新聞情緒區塊 */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">📰 總體市場大盤財經新聞面觀測（近3日）</h2>
              {loadingMarket ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => <div key={i} className="h-6 bg-slate-200 rounded w-3/4"></div>)}
                </div>
              ) : Array.isArray(marketSummary?.news?.market) && marketSummary.news.market.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-2 space-y-3">
                  {marketSummary.news.market.map((n: NewsItem, i: number) => (
                    <div key={i} className="pt-3 first:pt-0 group">
                      <a
                        href={n.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-slate-800 hover:text-blue-600 hover:underline block leading-snug transition"
                      >
                        {n.title}
                      </a>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                        <span className={`px-2 py-0.5 rounded font-semibold ${n.sentiment === "1" || n.sentiment === "POSITIVE" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                          RoBERTa 情緒：{n.sentiment === "1" || n.sentiment === "POSITIVE" ? "正向" : "負向"} ({n.score})
                        </span>
                        {n.published && (
                          <span>擷取時間：{n.published.slice(0, 16).replace("T", " ")}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">目前無可顯示的大盤時事新聞面數據</p>
              )}
            </section>
          </>
        ) : (
          
          // ==================== 模式二：另開新視窗顯示的【個股預測詳細頁面】 ====================
          <div className="space-y-6">
            
            {/* AI 預測核心報告方框 */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  🎯 {currentStockName} — RAGenius 智能聯網分析報告
                </h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-bold animate-pulse">
                  錨定推理：GPT-4o + RAG
                </span>
              </div>

              {loadingStock ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-base text-slate-500 font-bold animate-pulse">
                    正在呼叫全域嵌入模型並從 Pinecone 命名空間隔離檢索資料庫...
                  </p>
                  <p className="text-xs text-slate-400">基本面估值折現計算與技術指標融合推論中...</p>
                </div>
              ) : stockDetail?.gpt ? (
                <div className="prose max-w-none text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-6 rounded-xl border border-slate-200/80 font-medium text-[15px] shadow-inner">
                  {stockDetail.gpt}
                </div>
              ) : (
                <p className="text-center text-sm text-slate-400 py-6">生成層異常，無法順利導出分析報告</p>
              )}
            </section>

            {/* 下半部：個股歷史 10 日收盤圖 與 該股爬取新聞 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 個股歷史走勢圖 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 shadow-sm">
                <h3 className="font-bold text-lg text-slate-800 mb-1">📊 {currentStockName.split(" ")[0]} 歷史價格與輿情分數綜觀</h3>
                <p className="text-xs text-slate-400 mb-4">
                  近 3 日過濾語義平均情緒傾向：
                  <span className={`font-extrabold text-sm ml-1 px-2 py-0.5 rounded ${stockDetail?.sentiment_summary === "正向" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"}`}>
                    {stockDetail?.sentiment_summary || "推算中..."}
                  </span>
                </p>
                
                {loadingStock ? (
                  <div className="h-64 bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-slate-400">
                    個股圖表歷史序列載入中...
                  </div>
                ) : stockDetail?.stock_chart ? (
                  <div className="w-full">
                    <Line
                      data={{
                        labels: stockDetail.stock_chart.dates,
                        datasets: [
                          {
                            label: `${currentStockName.split(" ")[0]} 收盤價`,
                            data: stockDetail.stock_chart.prices,
                            borderColor: "#3b82f6",
                            backgroundColor: "rgba(59, 130, 246, 0.04)",
                            borderWidth: 2.5,
                            pointRadius: 3,
                            pointBackgroundColor: "#3b82f6",
                            tension: 0.15,
                            fill: true,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        scales: {
                          y: { ticks: { color: "#64748b" }, grid: { color: "#f1f5f9" } },
                          x: { ticks: { color: "#64748b" }, grid: { display: false } },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-center text-sm text-slate-400 py-10">暫無該標的近十日歷史走勢數據</p>
                )}
              </div>

              {/* 個股專屬 RAG 新聞庫 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col shadow-sm">
                <h3 className="font-bold text-lg text-slate-800 mb-4">📰 標的個股關聯財經新聞面觀測</h3>
                
                {loadingStock ? (
                  <div className="space-y-3 animate-pulse flex-1">
                    {[1, 2, 3].map((i) => <div key={i} className="h-6 bg-slate-100 rounded"></div>)}
                  </div>
                ) : Array.isArray(stockDetail?.news) && stockDetail.news.length > 0 ? (
                  <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[350px] pr-1 space-y-3">
                    {stockDetail.news.map((n: NewsItem, i: number) => (
                      <div key={i} className="pt-3 first:pt-0 group">
                        <a
                          href={n.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-sm text-slate-800 hover:text-blue-600 hover:underline block leading-snug transition"
                        >
                          {n.title}
                        </a>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5">
                          <span className={`px-1.5 py-0.2 rounded font-medium ${n.sentiment === "1" || n.sentiment === "POSITIVE" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                            {n.sentiment === "1" || n.sentiment === "POSITIVE" ? "正向" : "負向"} ({n.score})
                          </span>
                          {n.published && (
                            <span>{n.published.slice(5, 16).replace("T", " ")}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic py-6">目前此 namespace 下無可綁定的個股新聞</p>
                )}
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}