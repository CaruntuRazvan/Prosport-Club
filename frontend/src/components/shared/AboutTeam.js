import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../services/announcementService';
import '../../styles/shared/AboutTeam.css';

const AboutTeam = ({ userRole }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [quote, setQuote] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const createModalRef = useRef(null);
  const editModalRef = useRef(null);

  // Fetch Quote of the Day
  const fetchQuote = async () => {
    const today = new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' });
    const cachedQuote = localStorage.getItem('dailyQuote');
    const cachedDate = localStorage.getItem('quoteDate');

    console.log('Today (CST):', today);
    console.log('Cached Date:', cachedDate);
    console.log('Cached Quote:', cachedQuote);

    if (cachedQuote && cachedDate === today) {
      setQuote(JSON.parse(cachedQuote));
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/quote`);
      console.log('Response status:', response.status);
      const text = await response.text();
      console.log('Raw response from /api/quote:', text);

      const data = JSON.parse(text);
      if (data && data[0]) {
        const quoteData = { text: data[0].q, author: data[0].a };
        setQuote(quoteData);
        console.log('New Quote:', quoteData);
        localStorage.setItem('dailyQuote', JSON.stringify(quoteData));
        localStorage.setItem('quoteDate', today);
      } else {
        throw new Error('No quote received');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      const fallbackQuote = {
        text: 'Teamwork makes the dream work.',
        author: 'John C. Maxwell',
      };
      setQuote(fallbackQuote);
      toast.error('Failed to fetch quote', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: {
          background: '#dc3545',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
        },
      });
    }
  };

  // Fetch Announcements
  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const announcementData = await fetchAnnouncements();
      console.log('Announcements Loaded:', announcementData);
      setAnnouncements(announcementData);
    } catch (error) {
      toast.error('Eroare la încărcarea anunțurilor', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: {
          background: '#dc3545',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
        },
      });
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apelăm fetchQuote și loadAnnouncements la montarea componentei
  useEffect(() => {
    fetchQuote();
    loadAnnouncements();
  }, []);

  // Gestionare click outside pentru modale
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (createModalRef.current && !createModalRef.current.contains(event.target)) {
        setIsCreating(false);
        setFormData({ title: '', description: '' });
      }
      if (editModalRef.current && !editModalRef.current.contains(event.target)) {
        setIsEditing(null);
        setFormData({ title: '', description: '' });
      }
    };

    if (isCreating || isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCreating, isEditing]);

  // Gestionare Esc și scroll pentru modale
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (isCreating) {
          setIsCreating(false);
          setFormData({ title: '', description: '' });
        }
        if (isEditing) {
          setIsEditing(null);
          setFormData({ title: '', description: '' });
        }
        if (selectedImage) {
          closeImageModal();
        }
      }
    };

    if (isCreating || isEditing || selectedImage) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscKey);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isCreating, isEditing, selectedImage]);

  // Function to open image in modal
  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  // Function to close image modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Function to handle overlay click for image modal
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('image-modal-overlay')) {
      closeImageModal();
    }
  };

  // Handle create announcement
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const announcementData = {
        title: formData.title,
        description: formData.description,
        date: new Date().toISOString(),
      };
      console.log('Creating Announcement:', announcementData);
      const newAnnouncement = await createAnnouncement(announcementData);
      setAnnouncements([newAnnouncement, ...announcements].slice(0, 5));
      toast.success('Anunț creat cu succes!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: {
          background: '#28a745',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
        },
      });
      setIsCreating(false);
      setFormData({ title: '', description: '' });
    } catch (error) {
      toast.error(error.message || 'Eroare la crearea anunțului.', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: {
          background: '#dc3545',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
        },
      });
    }
  };

  // Handle edit announcement
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const announcementData = {
        title: formData.title,
        description: formData.description,
        date: new Date().toISOString(),
      };
      console.log('Updating Announcement:', isEditing._id, announcementData);
      const updatedAnnouncement = await updateAnnouncement(isEditing._id, announcementData);
      setAnnouncements(announcements.map(ann => ann._id === updatedAnnouncement._id ? updatedAnnouncement : ann));
      toast.success('Anunț actualizat cu succes!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: {
          background: '#28a745',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
        },
      });
      setIsEditing(null);
      setFormData({ title: '', description: '' });
    } catch (error) {
      toast.error(error.message || 'Eroare la actualizarea anunțului.', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: {
          background: '#dc3545',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
        },
      });
    }
  };

  // Handle delete announcement with confirmation
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Ești sigur că vrei să ștergi acest anunț?');
    if (!confirmDelete) {
      return;
    }
    try {
      console.log('Deleting Announcement:', id);
      await deleteAnnouncement(id);
      setAnnouncements(announcements.filter(ann => ann._id !== id));
      toast.success('Anunț șters cu succes!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: {
          background: '#28a745',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
        },
      });
    } catch (error) {
      toast.error(error.message || 'Eroare la ștergerea anunțului.', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: {
          background: '#dc3545',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
        },
      });
    }
  };

  // Handle edit toggle
  const handleEditToggle = (announcement) => {
    setIsEditing(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description,
    });
  };

  // Handle create toggle
  const handleCreateToggle = () => {
    setIsCreating(!isCreating);
    setFormData({ title: '', description: '' });
  };

  // Format date to dd.mm.yyyy
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <section className="team-section">
      {/* Quote of the Day Banner */}
      {quote && (
        <div className="quote-banner" role="complementary" aria-label="Quote of the Day">
          <span className="quote-text">"{quote.text}" — {quote.author}</span>
        </div>
      )}

      <h2>Team Kits & News</h2>

      <div className="team-kits">
        <div className="kit-item">
          <img
            src="/images/kit/full_kit_home.webp"
            alt="Home Kit"
            className="kit-image"
            loading="lazy"
            draggable="false"
            decoding="async"
            onClick={() => openImageModal('/images/kit/full_kit_home.webp')}
          />
          <p>Home Kit</p>
        </div>
        <div className="kit-item">
          <img
            src="/images/kit/full_kit_away.webp"
            alt="Away Kit"
            className="kit-image"
            loading="lazy"
            draggable="false"
            decoding="async"
            onClick={() => openImageModal('/images/kit/full_kit_away.webp')}
          />
          <p>Away Kit</p>
        </div>
        <div className="kit-item">
          <img
            src="/images/kit/goalkeeper_kit_long.webp"
            alt="Goalkeeper Kit"
            className="kit-image"
            loading="lazy"
            draggable="false"
            decoding="async"
            onClick={() => openImageModal('/images/kit/goalkeeper_kit_long.webp')}
          />
          <p>Goalkeeper Kit</p>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={handleOverlayClick}>
          <div className="image-modal-content">
            <button className="image-modal-close-btn" onClick={closeImageModal}>
              ×
            </button>
            <img src={selectedImage} alt="Enlarged kit" className="enlarged-image" />
          </div>
        </div>
      )}

      <div className="team-news">
        <h4>Team News</h4>
        {['manager', 'admin'].includes(userRole) && (
          <div className="news-action-buttons">
            <button className="news-add-btn" onClick={handleCreateToggle}>
              Adaugă Anunț
            </button>
          </div>
        )}
        {loading ? (
          <div className="news-loading">Se încarcă...</div>
        ) : announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div key={announcement._id} className="news-item">
              <h5>{announcement.title}</h5>
              <p>{announcement.description}</p>
              <span className="news-date">
                {formatDate(announcement.date)}
              </span>
              {['manager', 'admin'].includes(userRole) && (
                <div className="news-item-actions">
                  <button
                    className="news-edit-btn"
                    onClick={() => handleEditToggle(announcement)}
                  >
                    Editează
                  </button>
                  <button
                    className="news-delete-btn"
                    onClick={() => handleDelete(announcement._id)}
                  >
                    Șterge
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="no-news">Nu există anunțuri disponibile.</p>
        )}

        {/* Fines Link Section */}
        <div className="fines-link-section">
          <h4>Rules and Penalties</h4>
          <p>Check the list of penalties and fees applicable to team members.</p>
          <a
            href="/documents/prosport_fines.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="fines-link"
          >
            View Penalties List
          </a>
        </div>
      </div>

      {/* Modal pentru creare */}
      {isCreating && (
        <div className="news-modal-overlay">
          <div className="news-modal-content" ref={createModalRef}>
            <button
              className="news-modal-close-btn"
              onClick={handleCreateToggle}
              aria-label="Închide"
            >
              ×
            </button>
            <h3>Adaugă Anunț</h3>
            <form onSubmit={handleCreateSubmit} className="news-form">
              <div className="news-form-group">
                <label>Titlu:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="news-input"
                  placeholder="Ex. Antrenament intensiv"
                  required
                />
              </div>
              <div className="news-form-group">
                <label>Descriere:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="news-input"
                  placeholder="Ex. Echipa a avut un antrenament intensiv..."
                  required
                />
              </div>
              <div className="news-modal-actions">
                <button type="submit" className="news-save-btn">Salvează</button>
                <button type="button" className="news-cancel-btn" onClick={handleCreateToggle}>
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pentru editare */}
      {isEditing && (
        <div className="news-modal-overlay">
          <div className="news-modal-content" ref={editModalRef}>
            <button
              className="news-modal-close-btn"
              onClick={() => setIsEditing(null)}
              aria-label="Închide"
            >
              ×
            </button>
            <h3>Editează Anunț</h3>
            <form onSubmit={handleEditSubmit} className="news-form">
              <div className="news-form-group">
                <label>Titlu:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="news-input"
                  placeholder="Ex. Antrenament intensiv"
                  required
                />
              </div>
              <div className="news-form-group">
                <label>Descriere:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="news-input"
                  placeholder="Ex. Echipa a avut un antrenament intensiv..."
                  required
                />
              </div>
              <div className="news-modal-actions">
                <button type="submit" className="news-save-btn">Salvează</button>
                <button type="button" className="news-cancel-btn" onClick={() => setIsEditing(null)}>
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default AboutTeam;