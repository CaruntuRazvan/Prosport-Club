// components/JournalSection.js
import React, { useState, useEffect } from 'react';
import '../../styles/shared/JournalSection.css';

const JournalSection = ({ userId }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    const storageKey = `journalNotes_${userId}`;
    const savedNotes = localStorage.getItem(storageKey);
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Eroare la parsarea datelor din localStorage:', error);
        setNotes([]);
      }
    } else {
      setNotes([]);
    }
  }, [userId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    const storageKey = `journalNotes_${userId}`;
    if (notes.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [notes, userId, isAuthenticated]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsFormOpen(false);
        setIsEditModalOpen(false);
        setTitle('');
        setContent('');
        setSelectedNote(null);
      }
    };

    if (isFormOpen || isEditModalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isFormOpen, isEditModalOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year}, ${hour}:${minute}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const newNote = {
      id: Date.now(),
      title: title.trim() || 'Fără titlu',
      content: content.trim(),
      date: new Date().toISOString(),
      lastModified: null,
      backgroundColor: getRandomColor(),
    };

    setNotes([newNote, ...notes]);
    setTitle('');
    setContent('');
    setIsFormOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const updatedNote = {
      ...selectedNote,
      title: title.trim() || 'Fără titlu',
      content: content.trim(),
      lastModified: new Date().toISOString(),
    };

    setNotes(notes.map((note) => (note.id === selectedNote.id ? updatedNote : note)));
    setTitle('');
    setContent('');
    setIsEditModalOpen(false);
    setSelectedNote(null);
  };

  const handleDelete = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const handleEdit = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditModalOpen(true);
  };

  const getRandomColor = () => {
    //const colors = ['#fef4e1', '#e1f5e1', '#e1f0f5', '#f5e1e1', '#f0e1f5'];
    const colors = ['#fef4e1', '#e1f5e1', '#e1f0f5', '#f5e1e1', '#f0e1f5', '#e1e7f5', '#f5e1f0', '#e1f5f0', '#f5f5e1'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('note-form-container')) {
      setIsFormOpen(false);
      setTitle('');
      setContent('');
    }
    if (e.target.classList.contains('edit-modal-container')) {
      setIsEditModalOpen(false);
      setTitle('');
      setContent('');
      setSelectedNote(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="journal-section">
        <h2>Jurnal</h2>
        <p>Trebuie să fii autentificat pentru a accesa jurnalul.</p>
      </section>
    );
  }

  return (
    <section className="journal-section">
      <button className="add-note-btn" onClick={() => setIsFormOpen(true)}>
        Adaugă Notiță
      </button>

      {isFormOpen && (
        <div className="note-form-container" onClick={handleOverlayClick}>
          <form onSubmit={handleSubmit} className="note-form">
            <input
              type="text"
              placeholder="Titlu..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="note-input"
            />
            <textarea
              placeholder="Scrie aici gândurile, țelurile sau ideile tale..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="note-textarea"
              rows="5"
            />
            <div className="note-form-actions">
              <button type="submit" className="save-note-btn">Salvează</button>
              <button type="button" onClick={() => {
                setIsFormOpen(false);
                setTitle('');
                setContent('');
              }} className="cancel-note-btn">Anulează</button>
            </div>
          </form>
        </div>
      )}

      {isEditModalOpen && selectedNote && (
        <div className="edit-modal-container" onClick={handleOverlayClick}>
          <form onSubmit={handleEditSubmit} className="note-form edit-form">
            <input
              type="text"
              placeholder="Titlu..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="note-input"
            />
            <textarea
              placeholder="Scrie aici gândurile, țelurile sau ideile tale..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="note-textarea"
              rows="5"
            />
            <div className="note-form-actions">
              <button type="submit" className="save-note-btn">Salvează Modificări</button>
              <button type="button" onClick={() => {
                setIsEditModalOpen(false);
                setTitle('');
                setContent('');
                setSelectedNote(null);
              }} className="cancel-note-btn">Anulează</button>
            </div>
          </form>
        </div>
      )}

      <div className="notes-list">
        {notes.length === 0 ? (
          <p className="no-notes">No notes</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="note-card"
              style={{ backgroundColor: note.backgroundColor }}
              onClick={() => handleEdit(note)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(note.id);
                }}
                className="delete-note-btn"
              >
                X
              </button>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <span className="note-date">
                {note.lastModified
                  ? `Modificat pe: ${formatDate(note.lastModified)}`
                  : `Adăugat pe: ${formatDate(note.date)}`}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default JournalSection;
