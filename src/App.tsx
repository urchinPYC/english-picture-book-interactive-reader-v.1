import React, { useState, useEffect } from 'react';
import BookLibrary from './components/Library/BookLibrary';
import BookEditor from './components/TeacherPortal/BookEditor';
import BookReader from './components/StudentPortal/BookReader';

export interface PageData { id: string; imageUrl: string; text: string; }
export interface BookData { id: string; title: string; coverUrl: string; pages: PageData[]; lastUpdated: string; }

export default function App() {
  const [view, setView] = useState<'library' | 'editor' | 'reader'>('library');
  const [books, setBooks] = useState<BookData[]>([]);
  const [currentBook, setCurrentBook] = useState<BookData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('picture-books');
    if (saved) setBooks(JSON.parse(saved));
  }, []);

  const saveBooks = (updated: BookData[]) => {
    setBooks(updated);
    localStorage.setItem('picture-books', JSON.stringify(updated));
  };

  const handleShareBook = async (book: BookData) => {
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });
      const data = await response.json();
      alert(`分享連結：${window.location.origin}/share/${data.shareId}`);
    } catch (e) { alert('分享功能暫時維護中'); }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1]">
      {view === 'library' && (
        <BookLibrary 
          books={books} 
          onCreate={() => { setCurrentBook({ id: Date.now().toString(), title: 'New Story', coverUrl: '', pages: [{ id: '1', imageUrl: '', text: 'Once upon a time...' }], lastUpdated: new Date().toLocaleDateString() }); setView('editor'); }}
          onEdit={(b) => { setCurrentBook(b); setView('editor'); }}
          onRead={(b) => { setCurrentBook(b); setView('reader'); }}
          onDelete={(id) => saveBooks(books.filter(b => b.id !== id))}
          onShare={handleShareBook}
        />
      )}
      {view === 'editor' && currentBook && <BookEditor book={currentBook} onBack={() => setView('library')} onSave={(p, t) => { const updated = books.find(b => b.id === currentBook.id) ? books.map(b => b.id === currentBook.id ? { ...currentBook, title: t, pages: p, coverUrl: p[0]?.imageUrl || '', lastUpdated: new Date().toLocaleDateString() } : b) : [...books, { ...currentBook, title: t, pages: p, coverUrl: p[0]?.imageUrl || '', lastUpdated: new Date().toLocaleDateString() }]; saveBooks(updated); setView('library'); }} />}
      {view === 'reader' && currentBook && <BookReader pages={currentBook.pages} onBack={() => setView('library')} />}
    </div>
  );
}

