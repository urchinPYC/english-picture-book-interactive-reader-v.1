import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Volume2, Turtle, Rabbit, Home, BookOpen } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface PageData { 
  id: string; 
  imageUrl: string; 
  text: string; 
}

interface BookReaderProps { 
  pages: PageData[]; 
  onBack: () => void; 
  isShareMode?: boolean; 
}

// 設定您的 Render 網址作為 API 基礎
const API_BASE_URL = 'https://my-magic-story-land.onrender.com';

export default function BookReader({ pages, onBack, isShareMode = false }: BookReaderProps ) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentPage = pages[currentPageIndex];
  // 將文字拆解成單字陣列
  const words = currentPage.text.trim().split(/\s+/);

  // 當切換頁面時，停止播放並重置狀態
  useEffect(() => {
    stopTextToSpeech();
  }, [currentPageIndex]);

  const playTextToSpeech = async () => {
    if (!currentPage.text || isPlaying) return;
    
    setIsPlaying(true);
    setActiveWordIndex(-1);

    try {
      // 呼叫後端 API 取得語音網址
      const response = await fetch(`${API_BASE_URL}/api/generate-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentPage.text }),
      });
      
      if (!response.ok) throw new Error('語音生成失敗');
      const data = await response.json();
      
      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(data.audioUrl);
      audioRef.current.playbackRate = playbackRate;
      
      // 設定音訊結束時的處理
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setActiveWordIndex(-1);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      // 字幕同步邏輯：根據語速估算每個單字的發亮時間
      let currentWord = 0;
      // 基礎速度估算：一般朗讀速度約為每分鐘 150 個單字
      // 每個單字的毫秒數 = (60,000 / 150) / 語速倍率
      const msPerWord = (400 / playbackRate);

      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        setActiveWordIndex(currentWord);
        currentWord++;
        if (currentWord >= words.length) {
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, msPerWord);

      await audioRef.current.play();
    } catch (error) {
      console.error("語音播放錯誤:", error);
      alert("語音朗讀暫時無法使用，請稍後再試。");
      setIsPlaying(false);
      setActiveWordIndex(-1);
    }
  };

  const stopTextToSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsPlaying(false);
    setActiveWordIndex(-1);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1] text-[#5D4037] font-sans">
      <header className="bg-[#5D4037] text-white p-4 shadow-md flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 hover:text-[#D7CCC8] transition-colors">
          <Home size={20} />
          <span className="font-bold">回書櫃</span>
        </button>
        <h2 className="text-2xl font-sketch">Let's read together!</h2>
        <div className="w-20"></div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* 圖片區域 */}
            <div className="bg-gray-100 rounded-xl overflow-hidden h-80 flex items-center justify-center border-2 border-[#D7CCC8]">
              {currentPage.imageUrl ? (
                <img src={currentPage.imageUrl} alt="Story" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center text-[#A1887F]">
                  <BookOpen size={64} />
                  <p className="mt-2">這頁還沒有圖片喔</p>
                </div>
              )}
            </div>

            {/* 文字與控制區域 */}
            <div className="flex flex-col justify-between">
              <div className="bg-[#FDF8F1] p-6 rounded-xl min-h-[200px] text-2xl leading-relaxed shadow-inner border border-[#D7CCC8]">
                {words.map((word, idx) => (
                  <span 
                    key={idx} 
                    className={cn(
                      "inline-block mr-2 px-1 rounded transition-all duration-200",
                      idx === activeWordIndex ? "bg-yellow-300 scale-110 font-bold text-black" : ""
                    )}
                  >
                    {word}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={isPlaying ? stopTextToSpeech : playTextToSpeech}
                    className={cn(
                      "flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95",
                      isPlaying ? "bg-red-500 text-white" : "bg-[#5D4037] text-white hover:bg-[#8D6E63]"
                    )}
                  >
                    {isPlaying ? <Pause size={24} /> : <Volume2 size={24} />}
                    <span className="text-xl">{isPlaying ? '停止播放' : '開始朗讀'}</span>
                  </button>

                  <div className="flex items-center gap-2 bg-[#D7CCC8] p-3 rounded-xl shadow-inner">
                    <Turtle size={20} className="text-[#5D4037]" />
                    <select 
                      value={playbackRate} 
                      onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                      className="bg-transparent font-bold text-[#5D4037] outline-none cursor-pointer"
                    >
                      <option value="0.5">0.5x</option>
                      <option value="0.8">0.8x</option>
                      <option value="1.0">1.0x</option>
                      <option value="1.2">1.2x</option>
                    </select>
                    <Rabbit size={20} className="text-[#5D4037]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 翻頁控制 */}
          <div className="flex justify-between items-center border-t border-[#D7CCC8] pt-6">
            <button 
              onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
              disabled={currentPageIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-[#D7CCC8] text-[#5D4037] rounded-xl font-bold disabled:opacity-30 hover:bg-[#C7BCA8] transition-colors"
            >
              <ChevronLeft size={24} /> 上一頁
            </button>
            
            <div className="text-center">
              <span className="text-lg font-black text-[#8D6E63]">Page {currentPageIndex + 1} / {pages.length}</span>
            </div>

            <button 
              onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
              disabled={currentPageIndex === pages.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-[#5D4037] text-white rounded-xl font-bold disabled:opacity-30 hover:bg-[#8D6E63] transition-colors"
            >
              下一頁 <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}


