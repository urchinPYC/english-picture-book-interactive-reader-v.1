import React, { useState, useEffect } from 'react';
import BookLibrary from './components/Library/BookLibrary';
import BookEditor from './components/TeacherPortal/BookEditor';
import BookReader from './components/StudentPortal/BookReader';

// 定義資料結構
export interface PageData {
  id: string;
  imageUrl: string;
  text: string;
}

export interface BookData {
  id: string;
  title: string;
  coverUrl: string;
  pages: PageData[];
  lastUpdated: string;
}

// 使用您目前的 Render 網址作為 API 基礎
const API_BASE_URL = 'https://my-magic-story-land.onrender.com';

export default function App( ) {
  const [view, setView] = useState<'library' | 'editor' | 'reader'>('library');
  const [books, setBooks] = useState<BookData[]>([]);
  const [currentBook, setCurrentBook] = useState<BookData | null>(null);

  // 初始化載入範例繪本
  useEffect(() => {
    const savedBooks = localStorage.getItem('picture-books');
    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    } else {
      const initialBook: BookData = {
        id: '1',
        title: 'My New Book',
        coverUrl: '',
        pages: [{ id: 'p1', imageUrl: '', text: 'Welcome to my story land!' }],
        lastUpdated: new Date().toLocaleDateString(),
      };
      setBooks([initialBook]);
    }
  }, []);

  const saveBooks = (updatedBooks: BookData[]) => {
    setBooks(updatedBooks);
    localStorage.setItem('picture-books', JSON.stringify(updatedBooks));
  };

  const handleCreateBook = () => {
    const newBook: BookData = {
      id: Date.now().toString(),
      title: 'New Story',
      coverUrl: '',
      pages: [{ id: 'p1', imageUrl: '', text: 'Once upon a time...' }],
      lastUpdated: new Date().toLocaleDateString(),
    };
    setCurrentBook(newBook);
    setView('editor');
  };

  const handleEditBook = (book: BookData) => {
    setCurrentBook(book);
    setView('editor');
  };

  const handleReadBook = (book: BookData) => {
    setCurrentBook(book);
    setView('reader');
  };

  const handleDeleteBook = (id: string) => {
    if (window.confirm('確定要刪除這本繪本嗎？')) {
      const updatedBooks = books.filter(b => b.id !== id);
      saveBooks(updatedBooks);
    }
  };

  const handleSaveBook = (pages: PageData[], title: string) => {
    if (!currentBook) return;
    
    const updatedBook: BookData = {
      ...currentBook,
      title,
      pages,
      coverUrl: pages[0]?.imageUrl || '',
      lastUpdated: new Date().toLocaleDateString(),
    };

    const bookExists = books.find(b => b.id === currentBook.id);
    let updatedBooks;
    if (bookExists) {
      updatedBooks = books.map(b => b.id === currentBook.id ? updatedBook : b);
    } else {
      updatedBooks = [...books, updatedBook];
    }
    
    saveBooks(updatedBooks);
    setView('library');
  };

  const handleShareBook = async (book: BookData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });
      const data = await response.json();
      const shareUrl = `${window.location.origin}/share/${data.shareId}`;
      alert(`分享連結已產生：\n${shareUrl}`);
    } catch (error) {
      alert('分享失敗，請稍後再試。');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1]">
      {view === 'library' && (
        <BookLibrary 
          books={books} 
          onCreate={handleCreateBook}
          onEdit={handleEditBook}
          onRead={handleReadBook}
          onDelete={handleDeleteBook}
          onShare={handleShareBook}
        />
      )}
      
      {view === 'editor' && currentBook && (
        <BookEditor 
          book={currentBook}
          onSave={handleSaveBook}
          onBack={() => setView('library')}
        />
      )}
      
      {view === 'reader' && currentBook && (
        <BookReader 
          pages={currentBook.pages}
          onBack={() => setView('library')}
        />
      )}
    </div>
  );
}
