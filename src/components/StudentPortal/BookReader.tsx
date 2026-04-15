import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Volume2, Turtle, Rabbit, Home, BookOpen, RotateCcw } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface PageData { id: string; imageUrl: string; text: string; }
interface BookReaderProps { pages: PageData[]; onBack: () => void; isShareMode?: boolean; }

export default function BookReader({ pages, onBack, isShareMode = false }: BookReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentPage = pages[currentPageIndex];
  const words = currentPage.text.split(/\s+/);

  const playTextToSpeech = async () => {
    if (!currentPage.text) return;
    setIsPlaying(true);
    
    // 取得語音網址
    const response = await fetch('/api/generate-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: currentPage.text }),
    });
    const data = await response.json();
    
    if (audioRef.current) { audioRef.current.pause(); }
    audioRef.current = new Audio(data.audioUrl);
    audioRef.current.playbackRate = playbackRate;
    
    // 字幕同步邏輯：根據語速估算單字發亮時間
    let currentWord = 0;
    const interval = setInterval(() => {
      if (!isPlaying) { clearInterval(interval); return; }
      setActiveWordIndex(currentWord);
      currentWord++;
      if (currentWord >= words.length) {
        clearInterval(interval);
        setTimeout(() => { setActiveWordIndex(-1); setIsPlaying(false); }, 500);
      }
    }, (600 / playbackRate)); // 估算每個單字的朗讀時間

    audioRef.current.onended = () => {
      setIsPlaying(false);
      setActiveWordIndex(-1);
      clearInterval(interval);
    };
    
    audioRef.current.play();
  };

  const stopTextToSpeech = () => {
    if (audioRef.current) { audioRef.current.pause(); }
    setIsPlaying(false);
    setActiveWordIndex(-1);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1] text-[#5D4037] font-sans">
      <header className="bg-primary text-white p-4 shadow-md flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 hover:text-accent transition-colors">
          <Home size={20} /> <span className="font-bold">回書櫃</span>
        </button>
        <h2 className="text-2xl font-sketch">Let's read together!</h2>
        <div className="w-20"></div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-100 rounded-xl overflow-hidden h-80 flex items-center justify-center">
              {currentPage.imageUrl ? <img src={currentPage.imageUrl} className="w-full h-full object-contain" /> : <BookOpen size={48} className="text-accent" />}
            </div>
            <div className="flex flex-col justify-between">
              <div className="bg-background p-6 rounded-xl min-h-[200px] text-2xl leading-relaxed">
                {words.map((word, idx) => (
                  <span key={idx} className={cn("mr-2 transition-colors duration-200", idx === activeWordIndex ? "bg-yellow-300 font-bold" : "")}>
                    {word}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4">
                <button onClick={isPlaying ? stopTextToSpeech : playTextToSpeech} className="flex-1 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  {isPlaying ? <Pause size={24} /> : <Volume2 size={24} />} {isPlaying ? '停止' : '朗讀'}
                </button>
                <div className="flex items-center gap-2 bg-accent p-2 rounded-xl">
                  <Turtle size={20} />
                  <select value={playbackRate} onChange={(e) => setPlaybackRate(parseFloat(e.target.value))} className="bg-transparent font-bold">
                    <option value="0.5">0.5x</option>
                    <option value="0.8">0.8x</option>
                    <option value="1.0">1.0x</option>
                    <option value="1.2">1.2x</option>
                  </select>
                  <Rabbit size={20} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))} disabled={currentPageIndex === 0} className="px-6 py-2 bg-accent rounded-lg disabled:opacity-30">上一頁</button>
            <span className="font-bold">Page {currentPageIndex + 1} / {pages.length}</span>
            <button onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))} disabled={currentPageIndex === pages.length - 1} className="px-6 py-2 bg-primary text-white rounded-lg disabled:opacity-30">下一頁</button>
          </div>
        </div>
      </main>
    </div>
  );
}

