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

export default function StockPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const handleClick = () => {
    setLoading(true);
    setData(null); // 清除舊資料（避免殘留）
    fetch("http://localhost:5000/api/stock")
      .then((res) => res.json())
      .then((json) => {
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
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "分析中..." : "🔍 產生投資分析"}
      </button>

      {timestamp && (
        <p className="text-sm text-gray-500">🕒 最新分析時間：{timestamp}</p>
      )}

    {data && (
      <>
        {/* 股價圖 */}
        <section className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">📈 股價走勢圖（近10日）</h2>

          {data.chart_data ? (
          <Line
            data={{
              labels: data.chart_data?.map((item: any) => item.Date) ?? [],
              datasets: [
                {
                  label: "收盤價",
                  data: data.chart_data?.map((item: any) => item.Close) ?? [],
                  borderColor: "#3b82f6",
                  tension: 0.4,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
            }}
          />
        ) : (
          <p className="text-sm text-red-500">⚠️ 無法顯示股價圖，資料為空</p>
        )}

        </section>

        {/* GPT 分析摘要 */}
        <section className="bg-white p-6 rounded-xl shadow whitespace-pre-wrap">
          <h2 className="text-lg font-semibold mb-2">🧠 分析摘要</h2>
          <p>{data.gpt}</p>
        </section>

        {/* 新聞情緒 */}
        {data.news ? (
          data.news.length > 0 ? (
            <section className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-2">📰 最新新聞與情緒</h2>
              {data.news.map((n: any, i: number) => (
                <div key={i} className="mb-3">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-gray-600">
                    情緒：{n.sentiment}（信心值：{n.score}）
                  </p>
                </div>
              ))}
            </section>
          ) : (
            <p className="text-sm text-yellow-600">⚠️ 沒有可顯示的新聞資料</p>
          )
        ) : null}

      </>
    )}

    </main>
  );
}
