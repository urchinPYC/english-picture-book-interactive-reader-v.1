import React, { useState } from 'react';
import { Plus, Trash2, Eye, Share2, Edit3, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import { BookData } from '@/src/App';

interface BookLibraryProps {
  books: BookData[];
  onCreate: () => void;
  onSelect: (id: string, mode: 'edit' | 'read') => void;
  onDelete: (id: string) => void;
  onShare: (book: BookData) => void;
}

export default function BookLibrary({ books, onCreate, onSelect, onDelete, onShare }: BookLibraryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#FDF8F1] text-[#5D4037] p-6 md:p-12 font-sans">
      {/* 頂部標題區 */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-5xl md:text-7xl font-sketch text-primary text-center mb-4 leading-tight">
          My MAGIC STORY LAND
        </h1>
        <p className="text-xl md:text-2xl text-secondary text-center mb-8">
          繪本有聲館
        </p>
        <div className="flex justify-center">
          <button
            onClick={onCreate}
            className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 active:scale-95"
          >
            <Plus size={24} />
            <span className="text-lg font-bold">建立新繪本 (Create New Book)</span>
          </button>
        </div>
      </div>

      {/* 繪本列表 */}
      <div className="max-w-7xl mx-auto">
        {books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-secondary text-xl md:text-2xl mt-20"
          >
            <BookOpen size={64} className="mx-auto mb-4 text-accent" />
            目前沒有繪本，快來建立您的第一本魔法故事書吧！
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {books.map((book) => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transform hover:scale-[1.02] transition-all duration-300 ease-in-out"
                  onMouseEnter={() => setHoveredId(book.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="relative h-48 bg-gray-200 flex items-center justify-center text-gray-400 text-sm overflow-hidden">
                    {book.pages[0]?.imageUrl ? (
                      <img
                        src={book.pages[0].imageUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="sketch-font text-lg">無封面 (No Cover)</span>
                    )}
                    <AnimatePresence>
                      {hoveredId === book.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-4"
                        >
                          <button
                            onClick={() => onSelect(book.id, 'read')}
                            className="flex items-center gap-2 px-5 py-3 bg-white text-primary rounded-full shadow-md hover:bg-gray-100 transition-all font-bold active:scale-95"
                          >
                            <Eye size={20} />
                            閱讀
                          </button>
                          <button
                            onClick={() => onSelect(book.id, 'edit')}
                            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-full shadow-md hover:bg-[#8D6E63] transition-all font-bold active:scale-95"
                          >
                            <Edit3 size={20} />
                            編輯
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-primary mb-2 leading-snug">
                      {book.title}
                    </h3>
                    <p className="text-sm text-secondary mb-4 flex-grow">
                      {book.pages.length} 頁 (PAGES)
                    </p>
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => onSelect(book.id, 'edit')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#D7CCC8] text-[#5D4037] hover:bg-[#C9B8B4] rounded-xl transition-all font-bold text-sm active:scale-95"
                      >
                        <Edit3 size={16} />
                        <span>編輯</span>
                      </button>
                      <button
                        onClick={() => onShare(book)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#A1887F] text-white hover:bg-[#8D6E63] rounded-xl transition-all font-bold text-sm active:scale-95"
                      >
                        <Share2 size={16} />
                        <span>分享</span>
                      </button>
                      <button
                        onClick={() => onDelete(book.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-all font-bold text-sm active:scale-95"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-secondary text-sm">
        ©MAGIC STORY LAND - Daphne. C
      </footer>
    </div>
  );
}
