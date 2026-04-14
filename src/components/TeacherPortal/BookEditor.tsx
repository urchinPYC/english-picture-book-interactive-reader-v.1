import React, { useState, useEffect, useRef } from 'react';
import { Upload, Mic, Play, Save, Plus, Trash2, ChevronRight, ChevronLeft, Share2, Eye, Volume2, BookOpen, AlertCircle, Home, SaveIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import { BookData, PageData } from '@/src/App';

interface BookEditorProps {
  book: BookData;
  onSave: (pages: PageData[], title: string) => void;
  onBack: () => void;
}

export default function BookEditor({ book, onSave, onBack }: BookEditorProps) {
  const imageCache = useRef<Record<string, string>>({});
  
  const [pages, setPages] = useState<PageData[]>(book.pages);
  const [title, setTitle] = useState<string>(book.title);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentPage = pages[currentPageIndex];

  useEffect(() => {
    setTitle(book.title);
    setPages(book.pages);
    setCurrentPageIndex(0);
  }, [book]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedPages = pages.map((page, index) =>
      index === currentPageIndex ? { ...page, text: e.target.value } : page
    );
    setPages(updatedPages);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        const updatedPages = pages.map((page, index) =>
          index === currentPageIndex ? { ...page, imageUrl: base64Image } : page
        );
        setPages(updatedPages);
        imageCache.current[currentPage.id] = base64Image; // 緩存圖片
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPage = () => {
    const newPage: PageData = {
      id: Date.now().toString(),
      imageUrl: "",
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Mic, Play, Save, Plus, Trash2, ChevronRight, ChevronLeft, Share2, Eye, Volume2, BookOpen, AlertCircle, Home, SaveIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import { BookData, PageData } from '@/src/App';

interface BookEditorProps {
  book: BookData;
  onSave: (pages: PageData[], title: string) => void;
  onBack: () => void;
}

export default function BookEditor({ book, onSave, onBack }: BookEditorProps) {
  const imageCache = useRef<Record<string, string>>({});
  
  const [pages, setPages] = useState<PageData[]>(book.pages);
  const [title, setTitle] = useState<string>(book.title);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentPage = pages[currentPageIndex];

  useEffect(() => {
    setTitle(book.title);
    setPages(book.pages);
    setCurrentPageIndex(0);
  }, [book]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedPages = pages.map((page, index) =>
      index === currentPageIndex ? { ...page, text: e.target.value } : page
    );
    setPages(updatedPages);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        const updatedPages = pages.map((page, index) =>
          index === currentPageIndex ? { ...page, imageUrl: base64Image } : page
        );
        setPages(updatedPages);
        imageCache.current[currentPage.id] = base64Image; // 緩存圖片
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPage = () => {
    const newPage: PageData = {
      id: Date.now().toString(),
      imageUrl: '',
      text: '這是一個新頁面。', // Default text for new page
    };
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length); // Go to the new page
  };

  const handleDeletePage = () => {
    if (pages.length <= 1) {
      alert('至少需要一頁繪本。');
      return;
    }
    if (window.confirm('確定要刪除此頁嗎？')) {
      const updatedPages = pages.filter((_, index) => index !== currentPageIndex);
      setPages(updatedPages);
      if (currentPageIndex >= updatedPages.length) {
        setCurrentPageIndex(updatedPages.length - 1);
      }
    }
  };

  const generateVoice = async () => {
    if (!currentPage.text) {
      alert('請輸入文字以生成語音。');
      return;
    }
    setIsGeneratingVoice(true);
    setCurrentAudioUrl(null);
    try {
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: currentPage.text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '語音生成失敗');
      }

      const data = await response.json();
      setCurrentAudioUrl(data.audioUrl);
    } catch (error: any) {
      console.error('語音生成錯誤:', error);
      alert(`語音生成失敗，請稍後再試。錯誤訊息: ${error.message}`);
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const playAudio = () => {
    if (currentAudioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = new Audio(currentAudioUrl);
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.onended = () => setIsPlayingAudio(false);
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1] text-[#5D4037] font-sans">
      <header className="bg-primary text-white p-4 shadow-md flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-white hover:text-accent transition-colors">
          <Home size={20} />
          <span className="font-bold">回書櫃</span>
        </button>
        <h2 className="text-2xl font-sketch text-white">編輯繪本</h2>
        <button
          onClick={() => onSave(pages, title)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-primary rounded-full hover:bg-white transition-colors font-bold"
        >
          <SaveIcon size={20} />
          儲存
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* 繪本標題 */}
          <div className="mb-8">
            <label htmlFor="bookTitle" className="block text-primary text-lg font-bold mb-2">
              繪本標題 (Book Title)
            </label>
            <input
              type="text"
              id="bookTitle"
              value={title}
              onChange={handleTitleChange}
              className="w-full p-3 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary text-lg"
              placeholder="輸入繪本標題"
            />
          </div>

          {/* 頁面編輯區 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左側：圖片與文字 */}
            <section className="bg-background p-6 rounded-xl shadow-inner">
              <h3 className="text-primary text-xl font-bold mb-4">頁面內容 (Page Content)</h3>
              <div className="relative h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                {currentPage.imageUrl ? (
                  <img src={currentPage.imageUrl} alt="Page Image" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-secondary">點擊上傳圖片</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 right-4 p-3 bg-primary text-white rounded-full shadow-md hover:bg-[#8D6E63] transition-colors"
                  title="上傳圖片"
                >
                  <Upload size={20} />
                </button>
              </div>
              <textarea
                value={currentPage.text}
                onChange={handleTextChange}
                className="w-full h-40 p-3 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary resize-none"
                placeholder="輸入此頁的英語故事內容..."
              ></textarea>
            </section>

            {/* 右側：語音生成與頁面管理 */}
            <section className="bg-background p-6 rounded-xl shadow-inner flex flex-col">
              <h3 className="text-primary text-xl font-bold mb-4">語音與頁面管理 (Voice & Page Management)</h3>
              
              {/* 語音生成 */}
              <div className="mb-6 flex-grow">
                <label className="block text-primary text-lg font-bold mb-2">語音朗讀 (Text-to-Speech)</label>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={generateVoice}
                    disabled={isGeneratingVoice || !currentPage.text}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-[#8D6E63] transition-all font-bold disabled:opacity-50 active:scale-95"
                  >
                    {isGeneratingVoice ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                     ) : (
                      <Mic size={20} />
                    )}
                    <span>生成語音</span>
                  </button>
                  <button
                    onClick={isPlayingAudio ? stopAudio : playAudio}
                    disabled={!currentAudioUrl}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-bold disabled:opacity-50 active:scale-95",
                      isPlayingAudio ? "bg-red-500 text-white hover:bg-red-600" : "bg-accent text-primary hover:bg-[#C9B8B4]"
                    )}
                  >
                    {isPlayingAudio ? <StopCircle size={20} /> : <Play size={20} />}
                    <span>{isPlayingAudio ? '停止播放' : '試聽朗讀'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm text-secondary mb-2">
                  <span>語音速度: {playbackRate.toFixed(1)}x</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={playbackRate}
                    onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                    className="w-2/3 accent-primary"
                  />
                </div>
              </div>

              {/* 頁面操作 */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={handleAddPage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-bold active:scale-95"
                >
                  <Plus size={20} />
                  <span>新增頁面</span>
                </button>
                <button
                  onClick={handleDeletePage}
                  disabled={pages.length <= 1}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-bold disabled:opacity-50 active:scale-95"
                >
                  <Trash2 size={20} />
                  <span>刪除此頁</span>
                </button>
              </div>
            </section>
            
            {/* 導覽控制 */}
            <div className="flex justify-between items-center pt-8">
              <button
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
                className="flex items-center gap-2 px-6 py-3 bg-[#D7CCC8] text-[#5D4037] hover:bg-[#C9B8B4] rounded-xl transition-all font-black disabled:opacity-30"
              >
                <ChevronLeft size={20} />
                上一頁 (Previous)
              </button>
              <span className="text-sm font-black text-[#8D6E63] uppercase tracking-widest">
                第 {currentPageIndex + 1} / {pages.length} 頁
              </span>
              <button
                onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                disabled={currentPageIndex === pages.length - 1}
                className="flex items-center gap-2 px-6 py-3 bg-[#8D6E63] text-white hover:bg-[#5D4037] rounded-xl transition-all font-black disabled:opacity-30"
              >
                下一頁 (Next)
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
