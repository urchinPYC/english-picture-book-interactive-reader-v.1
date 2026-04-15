import React, { useState, useEffect, useRef } from 'react';
import { Upload, Mic, Play, Save, Plus, Trash2, ChevronRight, ChevronLeft, Volume2, BookOpen, Home, SaveIcon, StopCircle } from 'lucide-react';
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
        imageCache.current[currentPage.id] = base64Image;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPage = () => {
    const newPage: PageData = {
      id: Date.now().toString(),
      imageUrl: '',
      text: 'New page content...',
    };
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentPage.text }),
      });
      if (!response.ok) throw new Error('語音生成失敗');
      const data = await response.json();
      setCurrentAudioUrl(data.audioUrl);
    } catch (error: any) {
      alert(`錯誤: ${error.message}`);
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-background p-6 rounded-xl shadow-inner">
              <h3 className="text-primary text-xl font-bold mb-4">頁面內容 (Page Content)</h3>
              <div className="relative h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                {currentPage.imageUrl ? (
                  <img src={currentPage.imageUrl} alt="Page" className="w-full h-full object-cover" />
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

            <section className="bg-background p-6 rounded-xl shadow-inner flex flex-col">
              <h3 className="text-primary text-xl font-bold mb-4">語音與頁面管理</h3>
              <div className="mb-6 flex-grow">
                <label className="block text-primary text-lg font-bold mb-2">語音朗讀</label>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={generateVoice}
                    disabled={isGeneratingVoice || !currentPage.text}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-[#8D6E63] transition-all font-bold disabled:opacity-50"
                  >
                    {isGeneratingVoice ? <span className="animate-spin">🌀</span> : <Mic size={20} />}
                    <span>生成語音</span>
                  </button>
                  <button
                    onClick={isPlayingAudio ? stopAudio : playAudio}
                    disabled={!currentAudioUrl}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-bold disabled:opacity-50",
                      isPlayingAudio ? "bg-red-500 text-white" : "bg-accent text-primary"
                    )}
                  >
                    {isPlayingAudio ? <StopCircle size={20} /> : <Play size={20} />}
                    <span>{isPlayingAudio ? '停止播放' : '試聽朗讀'}</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <button onClick={handleAddPage} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-bold">
                  <Plus size={20} /> 新增頁面
                </button>
                <button onClick={handleDeletePage} disabled={pages.length <= 1} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-bold disabled:opacity-50">
                  <Trash2 size={20} /> 刪除此頁
                </button>
              </div>
            </section>
          </div>

          <div className="flex justify-between items-center pt-8">
            <button
              onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
              disabled={currentPageIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-[#D7CCC8] text-[#5D4037] rounded-xl disabled:opacity-30"
            >
              <ChevronLeft size={20} /> 上一頁
            </button>
            <span className="text-sm font-black text-[#8D6E63]">第 {currentPageIndex + 1} / {pages.length} 頁</span>
            <button
              onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
              disabled={currentPageIndex === pages.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-[#8D6E63] text-white rounded-xl disabled:opacity-30"
            >
              下一頁 <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

