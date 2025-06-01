import React, { useState, useRef, useEffect } from 'react';
import CreateEventForm from '../events/CreateEventForm';
import CreatePoll from '../polls/CreatePoll';
import CreateFine from '../fines/CreateFine';
import '../../styles/shared/RequestDropdown.css'; 

const RequestDropdown = ({ userId, userRole}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [isCreateFineModalOpen, setIsCreateFineModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const createEventModalRef = useRef(null);
  const createPollModalRef = useRef(null);
  const createFineModalRef = useRef(null);

  // Logica pentru click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
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

    const isAnyModalOpen = isCreateEventModalOpen || isCreatePollModalOpen || isCreateFineModalOpen || isOpen;
    if (isAnyModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isCreateEventModalOpen, isCreatePollModalOpen, isCreateFineModalOpen]);

  // Logica pentru Esc
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        setIsOpen(false);
        setIsCreateEventModalOpen(false);
        setIsCreatePollModalOpen(false);
        setIsCreateFineModalOpen(false);
      }
    };

    const isAnyModalOpen = isCreateEventModalOpen || isCreatePollModalOpen || isCreateFineModalOpen || isOpen;
    if (isAnyModalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, isCreateEventModalOpen, isCreatePollModalOpen, isCreateFineModalOpen]);

  useEffect(() => {
    const isAnyModalOpen = isCreateEventModalOpen || isCreatePollModalOpen || isCreateFineModalOpen || isOpen;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden'; // Oprește scroll-ul
    } else {
      document.body.style.overflow = 'auto'; // Restabilește scroll-ul
    }
  
    return () => {
      document.body.style.overflow = 'auto'; // Cleanup
    };
  }, [isOpen, isCreateEventModalOpen, isCreatePollModalOpen, isCreateFineModalOpen]);
  
  const handleEventCreated = (newEvent) => {
    console.log('Event created:', newEvent)
    setIsCreateEventModalOpen(false);
  };

  const handlePollCreated = () => {
    setIsCreatePollModalOpen(false);
  };

  const handleFineCreated = () => {
    setIsCreateFineModalOpen(false);
  };

  return (
    <div className="request-dropdown" ref={dropdownRef}>
      <button
        className="request-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-plus-square"
          viewBox="0 0 16 16"
        >
          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        <span>Requests</span>
      </button>

      {isOpen && (
        <div className="request-menu">
          <button
            className="request-option"
            onClick={() => {
              setIsCreateEventModalOpen(true);
              setIsOpen(false);
            }}
          >
            Create Event
          </button>
          <button
            className="request-option"
            onClick={() => {
              setIsCreatePollModalOpen(true);
              setIsOpen(false);
            }}
          >
            Create Poll
          </button>
          <button
            className="request-option"
            onClick={() => {
              setIsCreateFineModalOpen(true);
              setIsOpen(false);
            }}
          >
            Create Fine
          </button>
        </div>
      )}

      {/* Modal pentru crearea evenimentului */}
      {isCreateEventModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" ref={createEventModalRef}>
            <button
              className="modal-close-btn"
              onClick={() => setIsCreateEventModalOpen(false)}
              aria-label="Close"
            >
              X
            </button>
            <CreateEventForm onEventCreated={handleEventCreated} userId={userId} /> {/* Adăugăm userId */}
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
              aria-label="Close"
            >
              X
            </button>
            <CreatePoll onPollCreated={handlePollCreated} userId={userId} /> {/* Adăugăm userId */}
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
              aria-label="Close"
            >
              X
            </button>
            <CreateFine
              userId={userId}
              userRole={userRole}
              onClose={() => setIsCreateFineModalOpen(false)}
              onFineCreated={handleFineCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDropdown;