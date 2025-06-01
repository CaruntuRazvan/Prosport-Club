import React, { useState, useEffect } from 'react';
import '../../styles/shared/ScrollToTopButton.css';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Detect scroll position to show/hide the button
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Detect if any modal is open by checking for modal overlay elements
  useEffect(() => {
    const checkModal = () => {
      const modalClasses = [
        '.modal-overlay', // Used in RequestDropdown, CreateEventForm, CreatePoll, CreateFine
        '.event-modal-overlay', // Used in EventCalendar
        '.injury-modal-container', // Used in InjuredPlayersList
        '.image-modal-overlay',
        '.news-modal-overlay',
        '.edit-modal-container'
      ];
      
      const modalOpen = modalClasses.some(className => document.querySelector(className));
      setIsModalOpen(modalOpen);
    };

    // Check immediately and set up an interval to poll the DOM
    checkModal();
    const intervalId = setInterval(checkModal, 100); 

    return () => clearInterval(intervalId); 
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Hide the button if it's not visible due to scroll position or if a modal is open
  if (!isVisible || isModalOpen) {
    return null;
  }

  return (
    <button onClick={scrollToTop} className="scroll-to-top-btn">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        className="scroll-icon"
        viewBox="0 0 16 16"
      >
        <path fillRule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
      </svg>
    </button>
  );
};

export default ScrollToTopButton;