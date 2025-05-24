import React, { useRef, useEffect } from 'react';
import CreateEventForm from '../CreateEventFor';
import CreatePoll from './CreatePoll';
import CreateFine from './CreateFine';
//import '../styles/ManagerPage.css';

const CreateSection = ({
  activeSection,
  isCreateEventModalOpen,
  setIsCreateEventModalOpen,
  isCreatePollModalOpen,
  setIsCreatePollModalOpen,
  isCreateFineModalOpen,
  setIsCreateFineModalOpen,
  userId,
  userRole,
  onEventCreated,
  onPollCreated,
  onFineCreated,
}) => {
  const createEventModalRef = useRef(null);
  const createPollModalRef = useRef(null);
  const createFineModalRef = useRef(null);

  // Logica pentru click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (createEventModalRef.current && !createEventModalRef.current.contains(event.target)) {
        setIsCreateEventModalOpen(false);
      }
      if (createPollModalRef.current && !createPollModalRef.current.contains(event.target)) {
        setIsCreatePollModalOpen(false);
      }
      if (createFineModalRef.current && !createFineModalRef.current.contains(event.target)) {
        setIsCreateFineModalOpen(false);
      }
    };

    const isAnyModalOpen = isCreateEventModalOpen || isCreatePollModalOpen || isCreateFineModalOpen;
    if (isAnyModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCreateEventModalOpen, isCreatePollModalOpen, isCreateFineModalOpen, setIsCreateEventModalOpen, setIsCreatePollModalOpen, setIsCreateFineModalOpen]);

  // Logica pentru Esc
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        setIsCreateEventModalOpen(false);
        setIsCreatePollModalOpen(false);
        setIsCreateFineModalOpen(false);
      }
    };

    const isAnyModalOpen = isCreateEventModalOpen || isCreatePollModalOpen || isCreateFineModalOpen;
    if (isAnyModalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isCreateEventModalOpen, isCreatePollModalOpen, isCreateFineModalOpen, setIsCreateEventModalOpen, setIsCreatePollModalOpen, setIsCreateFineModalOpen]);
  
  useEffect(() => {
  const isAnyModalOpen = isCreateEventModalOpen || isCreatePollModalOpen || isCreateFineModalOpen;
  if (isAnyModalOpen) {
    document.body.classList.add('modal-open');
  } else {
    document.body.classList.remove('modal-open');
  }

  return () => {
    document.body.classList.remove('modal-open');
  };
  }, [isCreateEventModalOpen, isCreatePollModalOpen, isCreateFineModalOpen]);
  
  return (
    <>
      {activeSection === 'create-section' && (
        <section className="create-event-section">
          <h2>Cereri</h2>
          <div className="requests-buttons">
            <button
              className="create-event-btn"
              onClick={() => setIsCreateEventModalOpen(true)}
            >
              Crează Eveniment
            </button>
            <button
              className="create-poll-btn"
              onClick={() => setIsCreatePollModalOpen(true)}
            >
              Crează Sondaj
            </button>
            <button
              className="create-fine-btn"
              onClick={() => setIsCreateFineModalOpen(true)}
            >
              Crează Penalizare
            </button>
          </div>

          {/* Modal pentru crearea evenimentului */}
          {isCreateEventModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content" ref={createEventModalRef}>
                <button
                  className="modal-close-btn"
                  onClick={() => setIsCreateEventModalOpen(false)}
                  aria-label="Închide"
                >
                  X
                </button>
                <CreateEventForm onEventCreated={onEventCreated} />
              </div>
            </div>
          )}

          {/* Modal pentru crearea sondajului */}
          {isCreatePollModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content" ref={createPollModalRef}>
                <button
                  className="modal-close-btn"
                  onClick={() => setIsCreatePollModalOpen(false)}
                  aria-label="Închide"
                >
                  X
                </button>
                <CreatePoll onPollCreated={onPollCreated} />
              </div>
            </div>
          )}

          {/* Modal pentru crearea penalizării */}
          {isCreateFineModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content" ref={createFineModalRef}>
                <button
                  className="modal-close-btn"
                  onClick={() => setIsCreateFineModalOpen(false)}
                  aria-label="Închide"
                >
                  X
                </button>
                <CreateFine
                  userId={userId}
                  userRole={userRole}
                  onClose={() => setIsCreateFineModalOpen(false)}
                  onFineCreated={onFineCreated}
                />
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default CreateSection;