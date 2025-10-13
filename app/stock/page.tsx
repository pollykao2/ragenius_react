"use client";

import { useState } from "react";
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

// ===== 型別（避免 any 爆雷）=====
type IndexSnapshot = {
  last?: number;
  rsi?: number;
  rsi_note?: string;
  macd?: number;
  macd_signal?: number;
  macd_note?: string;
  trend?: string;
};

type NewsItem = {
  title: string;
  link: string;
  sentiment: string;
  score: number;
  query?: string;
  published?: string | null;
};

type ApiResponse = {
  gpt: string;
  sentiment_summary: string;
  stock_chart: { dates: string[]; prices: number[] };
  index_twii?: IndexSnapshot;
  index_spx?: IndexSnapshot;
  index_ixic?: IndexSnapshot;
  news: { foxconn: NewsItem[]; market: NewsItem[] };
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function StockPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const handleClick = () => {
    setLoading(true);
    setData(null); // 清除舊資料（避免殘留）
    fetch(`${API_BASE}/api/stock`)
      .then((res) => res.json())
      .then((json: ApiResponse) => {
        console.log("✅ 後端回傳資料：", json);
        setData(json);
        setTimestamp(new Date().toLocaleString()); // 記錄時間
      })
      .catch((err) => console.error("API 錯誤：", err))
      .finally(() => setLoading(false));
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold">鴻海（2317.TW）投資分析系統</h1>

      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "分析中..." : "🔍 產生投資分析"}
      </button>

      {timestamp && (
        <p className="text-sm text-gray-500">🕒 最新分析時間：{timestamp}</p>
      )}

      {data ? (
        <>
          {/* 股價圖（個股） */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-2">📈 鴻海收盤（近10日）</h2>

            {(() => {
              // 1) 安全取得資料 + 長度對齊 + 過濾 NaN
              const rawLabels = Array.isArray(data?.stock_chart?.dates) ? data.stock_chart.dates : [];
              const rawPrices = Array.isArray(data?.stock_chart?.prices) ? data.stock_chart.prices : [];

              const n = Math.min(rawLabels.length, rawPrices.length);
              const labels = rawLabels.slice(rawLabels.length - n);
              const prices = rawPrices
                .slice(rawPrices.length - n)
                .map((v: any) => (typeof v === "number" ? v : Number(v)))
                .filter((v: number) => Number.isFinite(v));

              // 2) 如果資料為空，顯示提示；否則渲染圖
              if (!labels.length || !prices.length) {
                return <p className="text-sm text-gray-500">（暫無股價資料可繪圖）</p>;
              }

              return (
                // 3) 用固定高度容器包住 Chart，並把 maintainAspectRatio 設為 false
                <div className="h-72"> {/* h-72 ≈ 288px，可依喜好調整 */}
                  <Line
                    data={{
                      labels,
                      datasets: [
                        {
                          label: "收盤價",
                          data: prices,
                          borderColor: "#3b82f6",
                          tension: 0.4,
                          pointRadius: 2,
                          pointHitRadius: 8,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false, // 讓它吃外層 div 的固定高度
                      plugins: { legend: { display: false }, tooltip: { intersect: false, mode: "index" } },
                      elements: { line: { borderWidth: 2 }, point: { radius: 2 } },
                      scales: {
                        x: { ticks: { autoSkip: true, maxTicksLimit: 8 } },
                        y: { ticks: { maxTicksLimit: 6 } },
                      },
                    }}
                  />
                </div>
              );
            })()}
          </section>

          {/* 大盤快照 */}
          <section className="bg-white p-6 rounded-xl shadow grid md:grid-cols-3 gap-4">
            {[
              ["台股加權", data?.index_twii],
              ["S&P 500", data?.index_spx],
              ["NASDAQ", data?.index_ixic],
            ].map(([name, idx]: any, i: number) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="font-semibold">{name as string}</div>
                <div className="text-2xl font-bold mt-1">
                  {idx?.last != null ? Number(idx.last).toFixed(2) : "--"}
                </div>
                <div className="text-sm text-gray-600">
                  RSI {idx?.rsi != null ? Number(idx.rsi).toFixed(1) : "--"}（
                  {idx?.rsi_note ?? "--"}） / MACD{" "}
                  {idx?.macd != null ? Number(idx.macd).toFixed(2) : "--"}/
                  {idx?.macd_signal != null
                    ? Number(idx.macd_signal).toFixed(2)
                    : "--"}
                  （{idx?.macd_note ?? "--"}）
                </div>
                <div className="text-sm mt-1">趨勢：{idx?.trend ?? "--"}</div>
              </div>
            ))}
          </section>

          {/* GPT 分析摘要 */}
          <section className="bg-white p-6 rounded-xl shadow whitespace-pre-wrap">
            <h2 className="text-lg font-semibold mb-2">🧠 分析摘要</h2>
            <p>{data?.gpt ?? "（暫無分析內容）"}</p>
          </section>

          {/* 新聞：大盤 */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-2">📰 大盤新聞（近10日）</h2>
            {Array.isArray(data?.news?.market) && data.news.market.length > 0 ? (
              data.news.market.map((n: NewsItem, i: number) => (
                <div key={i} className="mb-3">
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    {n.title}
                  </a>
                  <p className="text-sm text-gray-600">
                    {n.query ?? "Market"}｜情緒：{n.sentiment}（{n.score}）
                    {n.published
                      ? `｜時間：${n.published.slice(0, 16).replace("T", " ")}`
                      : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">（目前沒有可顯示的大盤新聞）</p>
            )}
          </section>

          {/* 新聞：鴻海 */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-2">📰 鴻海新聞（近10日）</h2>
            {Array.isArray(data?.news?.foxconn) &&
            data.news.foxconn.length > 0 ? (
              data.news.foxconn.map((n: NewsItem, i: number) => (
                <div key={i} className="mb-3">
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    {n.title}
                  </a>
                  <p className="text-sm text-gray-600">
                    情緒：{n.sentiment}（{n.score}）
                    {n.published
                      ? `｜時間：${n.published.slice(0, 16).replace("T", " ")}`
                      : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                （目前沒有可顯示的鴻海相關新聞）
              </p>
            )}
          </section>
        </>
      ) : (
        !loading && (
          <p className="text-sm text-yellow-600">⚠️ 沒有可顯示的新聞資料</p>
        )
      )}
    </main>
  );
}
