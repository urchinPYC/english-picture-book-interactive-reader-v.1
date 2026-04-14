import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";
import cors from "cors";
import shortid from "shortid";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 確保資料目錄存在
const DATA_DIR = path.join(__dirname, 'data', 'books');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3001; // 後端運行在 3001 端口

  // 啟用 CORS，允許所有來源
  app.use(cors());
  app.use(express.json({ limit: '50mb' })); // 增加 JSON 請求體大小限制以處理 Base64 圖片

  // 健康檢查端點
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend API is running' });
  });

  // 語音生成 API
  app.post('/api/generate-voice', async (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "請提供要轉換為語音的文字。" });
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_GEMINI_API_KEY is not set.");
      return res.status(500).json({ error: "伺服器配置錯誤：缺少 API 金鑰。" });
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/text:synthesize?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: { text: text },
            voice: { languageCode: "en-US", name: "en-US-Neural2-D" },
            audioConfig: { audioEncoding: "MP3" },
          } ),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Google TTS API Error:", errorData);
        return res.status(response.status).json({ error: "語音生成失敗，請檢查 API 金鑰或文字內容。", details: errorData });
      }

      const data = await response.json();
      const audioContent = data.audioContent;
      const audioUrl = `data:audio/mp3;base64,${audioContent}`;
      res.json({ audioUrl });
    } catch (error: any) {
      console.error("TTS Error:", error);
      res.status(500).json({ error: "語音生成失敗，請稍後再試。", details: error.message });
    }
  });

  // 分享繪本 API
  app.post('/api/share', async (req, res) => {
    const { book } = req.body;
    if (!book) {
      return res.status(400).json({ error: "請提供要分享的繪本資料。" });
    }

    try {
      const shareId = shortid.generate();
      const filePath = path.join(DATA_DIR, `${shareId}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(book, null, 2), 'utf8');
      res.json({ shareId });
    } catch (error: any) {
      console.error("Share API Error:", error);
      res.status(500).json({ error: "分享失敗，請稍後再試。", details: error.message });
    }
  });

  // 讀取分享繪本 API
  app.get('/api/share/:shareId', async (req, res) => {
    const { shareId } = req.params;
    try {
      const filePath = path.join(DATA_DIR, `${shareId}.json`);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "找不到該分享的繪本。" });
      }
      const bookData = await fs.promises.readFile(filePath, 'utf8');
      res.json({ book: JSON.parse(bookData) });
    } catch (error: any) {
      console.error("Get Shared Book API Error:", error);
      res.status(500).json({ error: "讀取分享繪本失敗，請稍後再試。", details: error.message });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend API server running on http://0.0.0.0:${PORT}` );
  });
}

startServer();
