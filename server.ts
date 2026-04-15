import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 確保資料夾存在
const BOOKS_DIR = path.join(__dirname, 'data', 'books');
if (!fs.existsSync(BOOKS_DIR)) {
  fs.mkdirSync(BOOKS_DIR, { recursive: true });
}

// 路由：語音生成 (前端將直接使用 Google TTS，此處作為備援)
app.post('/api/generate-voice', (req, res) => {
  const { text } = req.body;
  const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text )}&tl=en&client=tw-ob`;
  res.json({ success: true, audioUrl });
});

// 路由：分享繪本
app.post('/api/share', (req, res) => {
  try {
    const shareId = uuidv4().substring(0, 8);
    fs.writeFileSync(path.join(BOOKS_DIR, `${shareId}.json`), JSON.stringify(req.body));
    res.json({ shareId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 靜態檔案 (重要：這讓前端和後端跑在同一個網址)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

