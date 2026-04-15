import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 初始化 Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 確保資料夾存在
const BOOKS_DIR = path.join(__dirname, 'data', 'books');
if (!fs.existsSync(BOOKS_DIR)) {
  fs.mkdirSync(BOOKS_DIR, { recursive: true });
}

// 路由：語音生成 (TTS)
app.post('/api/generate-voice', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: '缺少文字內容' });

    // 使用 Gemini 1.5 Flash 生成語音 (透過特定模型支援)
    // 注意：這裡假設您使用的是支援 TTS 的 Gemini 整合方式
    // 如果是標準 Gemini API，通常需要搭配 Google Cloud TTS
    // 為了簡化，這裡提供一個結構，我們稍後在 Render 部署時會確保環境變數正確
    
    // 暫時回傳一個模擬成功的訊息，或串接實際 API
    // 實際部署時，我們會使用 Google Cloud TTS 或是透過 Gemini 產生的 Base64
    res.json({ 
      success: true, 
      audioUrl: `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text )}&tl=en&client=tw-ob` 
    });
  } catch (error: any) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 路由：分享繪本
app.post('/api/share', (req, res) => {
  try {
    const bookData = req.body;
    const shareId = uuidv4().substring(0, 8);
    const filePath = path.join(BOOKS_DIR, `${shareId}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(bookData));
    
    res.json({ shareId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 路由：取得分享的繪本
app.get('/api/share/:id', (req, res) => {
  try {
    const filePath = path.join(BOOKS_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '找不到該繪本' });
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 靜態檔案 (前端)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`伺服器運行於 http://localhost:${PORT}` );
});
