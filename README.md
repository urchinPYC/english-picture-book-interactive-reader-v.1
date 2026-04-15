# 英語繪本互動式閱讀網站 

這是一個互動式英語繪本閱讀網站，旨在提供一個有趣且具教育意義的平台，讓使用者可以建立、編輯、閱讀和分享英語繪本。

## 功能特色

*   **繪本編輯器**：直觀的介面，用於建立和編輯繪本頁面，包括圖片上傳和文字輸入。
*   **AI 語音朗讀**：整合 Google Gemini API，為繪本內容生成自然流暢的英語語音。
*   **跟讀錄音**：使用者可以錄製自己的聲音，與 AI 語音進行比較，提升口語能力。
*   **語音速度調整**：支援調整語音播放速度，適應不同學習者的需求。
*   **繪本分享**：生成獨特的分享連結，方便將繪本分享給他人。
*   **響應式設計**：網站介面適應不同設備，提供良好的使用者體驗。

## 技術棧

*   **前端**：React, TypeScript, Tailwind CSS, Vite
*   **後端**：Node.js, Express, TypeScript
*   **AI 語音**：Google Gemini API
*   **部署**：Netlify (前端), Render (後端)

## 專案結構


## 本地開發

1.  **複製儲存庫**：
    ```bash
    git clone https://github.com/urchinPYC/english-picture-book-interactive-reader-v.1.git
    cd english-picture-book-interactive-reader-v.1
    ```

2.  **安裝依賴**：
    ```bash
    pnpm install
    ```

3.  **設定環境變數**：
    *   複製 `.env.example` 為 `.env`：
        ```bash
        cp .env.example .env
        ```
    *   在 `.env` 檔案中填入您的 Google Gemini API 金鑰：
        ```
        GOOGLE_GEMINI_API_KEY=您的GoogleGeminiAPI金鑰
        ```

4.  **啟動開發伺服器**：
    *   啟動前端：
        ```bash
        pnpm run dev
        ```
    *   啟動後端：
        ```bash
        pnpm tsx server.ts
        ```

    網站將在 `http://localhost:3000` 運行 ，後端 API 在 `http://localhost:3001` 運行 。

## 部署到生產環境

### Netlify (前端)

1.  將此儲存庫連接到 Netlify。
2.  **Build command**：`pnpm run build`
3.  **Publish directory**：`dist`
4.  **Redirects**：確保 `netlify.toml` 配置正確，將 `/api/*` 請求代理到您的 Render 後端 URL。

### Render (後端)

1.  將此儲存庫連接到 Render，建立一個新的 Web Service。
2.  **Environment**：Node
3.  **Build command**：`pnpm install`
4.  **Start command**：`pnpm tsx server.ts`
5.  **Environment Variables**：設定 `GOOGLE_GEMINI_API_KEY` 和 `NODE_ENV=production`。

## 貢獻

歡迎任何形式的貢獻！如果您有任何建議或發現錯誤，請隨時提交 Issue 或 Pull Request。

## 授權

[MIT License](LICENSE)
