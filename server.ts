import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 初始化 Google Gemini API (保留作為未來擴充使用)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// 設定 CORS，允許您的前端網址存取
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 確保存放分享繪本的資料夾存在
const BOOKS_DIR = path.join(__dirname, 'data', 'books');
if (!fs.existsSync(BOOKS_DIR)) {
  fs.mkdirSync(BOOKS_DIR, { recursive: true });
}

// 路由：語音生成 (TTS)
app.post('/api/generate-voice', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: '缺少文字內容' });

    // 使用 Google 翻譯的 TTS 作為穩定來源
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text )}&tl=en&client=tw-ob`;
    
    res.json({ 
      success: true, 
      audioUrl: audioUrl 
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

// 靜態檔案服務 (用於 Render 部署)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`伺服器運行於 http://localhost:${PORT}` );
});
