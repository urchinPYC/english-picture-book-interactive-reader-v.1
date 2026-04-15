import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Volume2, Turtle, Rabbit, Home, BookOpen } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function BookReader({ pages, onBack }: { pages: any[], onBack: () => void }) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  const currentPage = pages[currentPageIndex];
  const words = currentPage.text.trim().split(/\s+/);

  const playTTS = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(currentPage.text )}&tl=en&client=tw-ob`;
    audioRef.current = new Audio(url);
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.onended = () => { setIsPlaying(false); setActiveWordIndex(-1); clearInterval(timerRef.current); };
    
    let current = 0;
    timerRef.current = setInterval(() => {
      setActiveWordIndex(current);
      current++;
      if (current >= words.length) clearInterval(timerRef.current);
    }, (400 / playbackRate));
    
    audioRef.current.play();
  };

  const stopTTS = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setActiveWordIndex(-1);
    clearInterval(timerRef.current);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1] text-[#5D4037] p-6">
      <header className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 font-bold"><Home size={20}/> 回書櫃</button>
        <h2 className="text-3xl font-sketch">Let's Read!</h2>
        <div className="w-20"></div>
      </header>
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="h-80 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
            {currentPage.imageUrl ? <img src={currentPage.imageUrl} className="w-full h-full object-contain" /> : <BookOpen size={64} className="text-accent" />}
          </div>
          <div className="flex flex-col justify-between">
            <div className="text-2xl leading-relaxed p-4 bg-background rounded-xl min-h-[150px]">
              {words.map((w, i) => <span key={i} className={cn("mr-2", i === activeWordIndex ? "bg-yellow-300 font-bold" : "")}>{w}</span>)}
            </div>
            <div className="flex gap-4 mt-4">
              <button onClick={isPlaying ? stopTTS : playTTS} className="flex-1 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                {isPlaying ? <Pause size={24}/> : <Volume2 size={24}/>} {isPlaying ? '停止' : '朗讀'}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-8">
          <button onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex-1))} disabled={currentPageIndex===0} className="px-6 py-2 bg-accent rounded-lg disabled:opacity-30">上一頁</button>
          <span className="font-bold">Page {currentPageIndex+1}/{pages.length}</span>
          <button onClick={() => setCurrentPageIndex(Math.min(pages.length-1, currentPageIndex+1))} disabled={currentPageIndex===pages.length-1} className="px-6 py-2 bg-primary text-white rounded-lg disabled:opacity-30">下一頁</button>
        </div>
      </div>
    </div>
  );
}
