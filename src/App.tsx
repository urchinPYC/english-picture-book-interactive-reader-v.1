import React, { useState, useEffect } from 'react';
import BookLibrary from './components/Library/BookLibrary';
import BookEditor from './components/TeacherPortal/BookEditor';
import BookReader from './components/StudentPortal/BookReader';

export interface PageData {
  id: string;
  imageUrl: string;
  text: string;
}

export interface BookData {
  id: string;
  title: string;
  pages: PageData[];
}

const API_BASE_URL = import.meta.env.PROD
  ? 'https://english-picture-book-backend.onrender.com'
  : 'http://localhost:3001';

export default function App( ) {
  const [mode, setMode] = useState<'library' | 'edit' | 'read' | 'share'>('library');
  const [books, setBooks] = useState<BookData[]>([]);
  const [currentBook, setCurrentBook] = useState<BookData | null>(null);
  const [sharedBook, setSharedBook] = useState<BookData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/share/')) {
      const shareId = path.replace('/share/', '');
      fetchSharedBook(shareId);
      setMode('share');
    } else {
      loadBooks();
    }
  }, []);

  const loadBooks = () => {
    const storedBooks = localStorage.getItem('englishPictureBooks');
    if (storedBooks) {
      setBooks(JSON.parse(storedBooks));
    }
  };

  const saveBooks = (updatedBooks: BookData[]) => {
    setBooks(updatedBooks);
    localStorage.setItem('englishPictureBooks', JSON.stringify(updatedBooks));
  };

  const handleCreateBook = () => {
    const newBook: BookData = {
      id: Date.now().toString(),
      title: '我的新繪本 My New Book',
      pages: [{
        id: Date.now().toString() + '-page1',
        imageUrl: '',
        text: 'Hello, this is my first page. Let\'s read together!',
      }],
    };
    saveBooks([...books, newBook]);
    setCurrentBook(newBook);
    setMode('edit');
  };

  const handleSelectBook = (id: string, selectMode: 'edit' | 'read') => {
    const book = books.find(b => b.id === id);
    if (book) {
      setCurrentBook(book);
      setMode(selectMode);
    }
  };

  const handleDeleteBook = (id: string) => {
    if (window.confirm('確定要刪除這本繪本嗎？')) {
      const updatedBooks = books.filter(b => b.id !== id);
      saveBooks(updatedBooks);
    }
  };

  const handleSaveBook = (updatedPages: PageData[], updatedTitle: string) => {
    if (currentBook) {
      const updatedBooks = books.map(b =>
        b.id === currentBook.id ? { ...b, pages: updatedPages, title: updatedTitle } : b
      );
      saveBooks(updatedBooks);
      setCurrentBook({ ...currentBook, pages: updatedPages, title: updatedTitle });
      alert('繪本已儲存！');
    }
  };

  const handleShare = async (bookToShare: BookData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ book: bookToShare }),
      });

      if (!response.ok) {
        throw new Error('分享失敗');
      }

      const data = await response.json();
      const shareUrl = `${window.location.origin}/share/${data.shareId}`;
      navigator.clipboard.writeText(shareUrl);
      alert('分享連結已複製！');
    } catch (error) {
      console.error('分享錯誤:', error);
      alert('分享失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSharedBook = async (shareId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/share/${shareId}`);
      if (!response.ok) {
        throw new Error('載入分享繪本失敗');
      }
      const data = await response.json();
      setSharedBook(data.book);
    } catch (error) {
      console.error('載入分享繪本錯誤:', error);
      alert('載入分享繪本失敗，請檢查連結是否正確。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl">載入中...</div>
        </div>
      )}

      {mode === 'library' && (
        <BookLibrary
          books={books}
          onCreate={handleCreateBook}
          onSelect={handleSelectBook}
          onDelete={handleDeleteBook}
          onShare={handleShare}
        />
      )}

      {mode === 'edit' && currentBook && (
        <BookEditor
          book={currentBook}
          onSave={handleSaveBook}
          onBack={() => setMode('library')}
        />
      )}
      
      {mode === 'read' && currentBook && (
        <BookReader 
          pages={currentBook.pages} 
          onBack={() => setMode('library')} 
        />
      )}

      {mode === 'share' && sharedBook && (
        <BookReader 
          pages={sharedBook.pages} 
          onBack={() => {
            window.history.replaceState({}, '', window.location.pathname);
            window.location.reload();
          }} 
          isShareMode={true}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Fredericka+the+Great&display=swap' );
        
        body { 
          font-family: 'Noto Sans TC', sans-serif; 
          margin: 0; 
          padding: 0; 
        }

        .sketch-font {
          font-family: 'Fredericka the Great', cursive;
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D7CCC8; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #A1887F; }
      `}} />
    </div>
  );
}
