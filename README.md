# RAGenius 投資導航｜前端介面

## Project Overview

RAGenius 結合財經新聞情緒分析、檢索增強生成（RAG）、基本面與技術指標，協助使用者整理台股資訊並分析短期股價趨勢。

本 Repository 為前端介面，負責呼叫後端 API，呈現市場指標、歷史走勢、新聞情緒與 AI 分析報告。

## Related Repository

- **前端介面**：[ragenius_react](https://github.com/pollykao2/ragenius_react)
- **模型與後端**：[RAGenius3](https://github.com/pollykao2/RAGenius3)

資料蒐集、情緒分析、向量檢索與 GPT-4o 分析由後端執行。

## Features

- **大盤資訊總覽**：呈現台灣加權指數、S&P 500 與 NASDAQ 的指數及技術指標。
- **歷史走勢圖**：以折線圖呈現後端提供的大盤與個股歷史價格。
- **股票與 ETF 選擇**：提供八檔標的按鈕，另開分頁查看分析。
- **AI 分析報告**：顯示後端產生的 GPT-4o 與 RAG 整合分析結果。
- **財經新聞與情緒**：呈現新聞標題、來源連結、情緒標籤與分數。
- **響應式版面**：依螢幕尺寸調整資訊卡片與圖表配置。

## Tech Stack

| 技術 | 用途 |
| --- | --- |
| Next.js / React | 頁面與互動介面 |
| TypeScript | 型別定義 |
| Tailwind CSS | 樣式與響應式版面 |
| Chart.js / react-chartjs-2 | 歷史價格折線圖 |
| Fetch API | 呼叫後端 API |

## Supported Stocks

台積電（2330）、鴻海（2317）、聯電（2303）、廣達（2382）、
聯發科（2454）、緯創（3231）、元大台灣50（0050）、
元大高股息（0056）。

## API Integration

目前前端的 API_BASE 設定為：

```text
http://127.0.0.1:5000
```

| 方法 | 路徑 | 用途 |
| --- | --- | --- |
| GET | /api/market-summary | 取得大盤指標、走勢與市場新聞 |
| GET | /api/stock/{ticker} | 取得個股分析、走勢與相關新聞 |

前端透過 `?ticker=2317.TW` 等 URL 參數切換至個股報告模式。

## Getting Started

1. 安裝 Node.js 與 npm。
2. 下載專案並安裝套件：

```bash
git clone https://github.com/pollykao2/ragenius_react.git
cd ragenius_react
npm install
```

3. 啟動後端，確認 API 位址與頁面程式中的 API_BASE 一致。
   後端需允許前端來源的跨來源請求（CORS）。
4. 啟動前端：

```bash
npm run dev
```

5. 開啟 http://localhost:3000；若功能頁放在其他路由，請開啟對應路徑。

## Current Limitations

- 需搭配後端服務，才能取得市場資料與 AI 分析結果。
- API_BASE 目前固定為本機位址，部署時需調整。
- 資料於頁面載入時請求，目前未設定定時自動更新。
- 模型評估與預測限制請參閱後端 Repository。

## Research Achievements

- 獲國科會大專學生研究計畫補助。
- 於第 23 屆 ITAOI 研討會發表研究成果。
