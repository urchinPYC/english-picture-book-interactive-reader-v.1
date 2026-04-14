import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Mic, RotateCcw, Volume2, Turtle, Rabbit, Home, BookOpen, Heart, Square, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function BookReader({ pages, onBack, isShareMode = false }: BookReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentPage = pages[currentPageIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const playTextToSpeech = async () => {
    if (!currentPage.text) {
      alert('請輸入文字以生成語音。');
      return;
    }
    setIsPlaying(true);
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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = new Audio(data.audioUrl);
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play();
    } catch (error: any) {
      console.error('語音生成錯誤:', error);
      alert(`語音生成失敗，請稍後再試。錯誤訊息: ${error.message}`);
      setIsPlaying(false);
    }
  };

  const stopTextToSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach(track => track.stop()); // 停止麥克風
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('錄音啟動失敗:', error);
      alert('無法啟動麥克風，請檢查權限設定。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecordedAudio = () => {
    if (recordedAudioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = new Audio(recordedAudioUrl);
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopAudioPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1] text-[#5D4037] font-sans">
      <header className="bg-primary text-white p-4 shadow-md flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-white hover:text-accent transition-colors">
          {isShareMode ? <BookOpen size={20} /> : <Home size={20} />}
          <span className="font-bold">{isShareMode ? '回首頁' : '回書櫃'}</span>
        </button>
        <h2 className="text-2xl font-sketch text-white">Let's read together!</h2>
        <div className="w-1/4"></div> {/* Placeholder for alignment */}
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* 頁面內容 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 左側：圖片 */}
            <div className="relative h-80 md:h-96 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden shadow-inner">
              {currentPage.imageUrl ? (
                <img src={currentPage.imageUrl} alt="Page Image" className="w-full h-full object-contain" />
              ) : (
                <span className="text-secondary sketch-font text-xl">無圖片</span>
              )}
            </div>

            {/* 右側：文字與語音控制 */}
            <div className="flex flex-col justify-between">
              <div className="bg-background p-6 rounded-xl shadow-inner flex-grow mb-4">
                <p className="text-lg md:text-xl leading-relaxed text-primary">
                  {currentPage.text}
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {/* 語音朗讀 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={isPlaying ? stopTextToSpeech : playTextToSpeech}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-4 rounded-xl transition-all font-black text-sm md:text-base active:scale-95",
                      isPlaying ? "bg-red-500 text-white hover:bg-red-600" : "bg-primary text-white hover:bg-[#8D6E63]"
                    )}
                  >
                    {isPlaying ? <Pause size={18} className="md:w-5 md:h-5" /> : <Volume2 size={18} className="md:w-5 md:h-5" />}
                    <span>{isPlaying ? '停止朗讀' : 'AI 朗讀'}</span>
                  </button>
                  <div className="flex items-center gap-2 bg-accent p-2 rounded-xl">
                    <Turtle size={18} className="text-primary" />
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={playbackRate}
                      onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                      className="w-24 accent-primary"
                    />
                    <Rabbit size={18} className="text-primary" />
                  </div>
                </div>

                {/* 錄音功能 */}
                {!isShareMode && (
                  <div className="flex gap-2">
                    {isRecording ? (
                      <button
                        onClick={stopRecording}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-4 bg-red-500 text-white hover:bg-red-600 rounded-xl transition-all font-black text-sm md:text-base active:scale-95"
                      >
                        <Square size={18} className="md:w-5 md:h-5" />
                        <span>停止錄音</span>
                      </button>
                    ) : recordedAudioUrl ? (
                      <>
                        <button
                          onClick={playRecordedAudio}
                          disabled={isPlaying}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-4 bg-green-500 text-white hover:bg-green-600 rounded-xl transition-all font-black text-sm md:text-base disabled:opacity-50 active:scale-95"
                        >
                          <Play size={18} className="md:w-5 md:h-5" />
                          <span>播放錄音</span>
                        </button>
                        <button
                          onClick={() => { setRecordedAudioUrl(null); stopAudioPlayback(); }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-4 bg-[#D7CCC8] text-[#5D4037] hover:bg-[#C9B8B4] rounded-xl transition-all font-black text-sm md:text-base active:scale-95"
                        >
                          <RotateCcw size={18} className="md:w-5 md:h-5" />
                          <span>重新錄音</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={startRecording}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-4 bg-blue-500 text-white hover:bg-blue-600 rounded-xl transition-all font-black text-sm md:text-base active:scale-95"
                      >
                        <Mic size={18} className="md:w-5 md:h-5" />
                        <span>開始錄音</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 導覽控制 */}
          <div className="flex justify-between items-center pt-8">
            <button
              onClick={() => {
                stopTextToSpeech();
                stopAudioPlayback();
                setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
              }}
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
              onClick={() => {
                stopTextToSpeech();
                stopAudioPlayback();
                setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1));
              }}
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
  );
}
