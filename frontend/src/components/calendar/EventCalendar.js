import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getEvents, getEventDetails, deleteEvent } from '../../services/eventService';
import { getFeedbackForEvent } from '../../services/feedbackService';
import AddFeedbackModal from '../feedbacks/AddFeedbackModal';
import FeedbackList from '../feedbacks/FeedbackList';
import { useConfirm } from '../../context/ConfirmContext';
import '../../styles/calendar/EventCalendar.css';

const EventCalendar = ({ userId, eventColor }) => {
  const [currentView, setCurrentView] = useState('timeGridWeek');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [userRole, setUserRole] = useState('');
  const showConfirm  = useConfirm();
  const modalRef = useRef(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .fc-daygrid-event, .fc-timegrid-event {
        background-color: ${eventColor} !important;
        border-color: ${eventColor} !important;
        color: ${getContrastColor(eventColor)} !important;
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, [eventColor]);

  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const fetchEvents = async () => {
    try {
      const eventData = await getEvents(userId);
      console.log('Event data:', eventData);
      let calendarEvents = eventData
        .filter(event => {
          if (userRole === 'player') {
            return event.players.some(player => player._id === userId);
          }
          return true;
        })
        .map(event => {
          return {
            id: event._id,
            title: event.title,
            start: event.startDate,
            end: event.finishDate,
            backgroundColor: eventColor,
            borderColor: eventColor,
            textColor: getContrastColor(eventColor),
            hasFeedback: false,
            createdBy: event.createdBy,
            staff: event.staff,
            classNames: ['custom-calendar-event']
          };
        });

      for (let event of calendarEvents) {
        try {
          const feedbackData = await getFeedbackForEvent(event.id);
          console.log('Feedback data:', feedbackData);
          if (userRole === 'player') {
            event.hasFeedback = feedbackData.some(feedback => feedback.receiverId._id === userId);
          } else if (userRole === 'manager') {
            event.hasFeedback = feedbackData.length > 0;
          } else if (userRole === 'staff') {
            event.hasFeedback = feedbackData.some(feedback => feedback.creatorId === userId) && feedbackData.length > 0;
          }
        } catch (error) {
          console.error(`Eroare la preluarea feedback-urilor pentru evenimentul ${event.id}:`, error);
          event.hasFeedback = false;
        }
      }

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Eroare la încărcarea evenimentelor:', error);
      toast.error('Eroare la încărcarea evenimentelor.', {
        autoClose: 2000,
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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setUserRole(user?.role || '');
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchEvents();
    }
  }, [userId, eventColor, userRole]);

  useEffect(() => {
    if (calendarRef.current && events.length > 0) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.refetchEvents();
    }
  }, [eventColor, events]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && isModalOpen && !showFeedbackModal) {
        closeModal();
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen, showFeedbackModal]);

  const handleEventClick = async (info) => {
    const eventId = info.event.id;
    try {
      const eventData = await getEventDetails(eventId);
      const feedbackData = await getFeedbackForEvent(eventId);
      setFeedbacks(feedbackData);
      setEventDetails({ ...eventData, feedbacks: feedbackData });
      setSelectedEvent(info.event);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Eroare la obținerea detaliilor evenimentului:', error);
      toast.error(error.message || 'Nu ai permisiunea de a vedea detaliile acestui eveniment.', {
        autoClose: 2000,
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

  const handleDeleteEvent = async (eventId) => {
    showConfirm('Ești sigur că vrei să ștergi acest eveniment?', async () => {
      try {
        await deleteEvent(eventId);
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        closeModal();
        toast.success('Eveniment șters!', {
          autoClose: 2000,
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
        console.error('Eroare la ștergerea evenimentului:', error);
        toast.error('Eroare la ștergere!', {
          autoClose: 2000,
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
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowFeedbackModal(false);
    setSelectedEvent(null);
    setEventDetails(null);
    setFeedbacks([]);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay') && !showFeedbackModal) {
      closeModal();
    }
  };

  const handleOpenFeedbackModal = () => {
    // Verificăm dacă toți jucătorii au primit feedback
    if (eventDetails && eventDetails.players) {
      const playerIds = eventDetails.players.map(player => player._id);
      const feedbackReceiverIds = feedbacks.map(feedback => feedback.receiverId._id);
      const allPlayersHaveFeedback = playerIds.every(playerId => feedbackReceiverIds.includes(playerId));

      if (allPlayersHaveFeedback) {
        toast.warning('Toți jucătorii au primit deja feedback pentru acest eveniment!', {
          autoClose: 1500,
          hideProgressBar: true,
          closeButton: false,
          style: {
            background: '#ff9800', 
            color: '#000', 
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: '4px',
          },
          
        });
        return;
      }
    }
    setShowFeedbackModal(true);
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
  };

  const handleFeedbackAdded = async () => {
    try {
      const feedbackData = await getFeedbackForEvent(eventDetails._id);
      setFeedbacks(feedbackData);
      setEventDetails({ ...eventDetails, feedbacks: feedbackData });
      setShowFeedbackModal(false);
      await fetchEvents();
    } catch (error) {
      console.error('Eroare la reîmprospătarea feedback-urilor:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ro-RO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const renderEventContent = (eventInfo) => {
    const isCreator = eventInfo.event.extendedProps.createdBy && eventInfo.event.extendedProps.createdBy._id && eventInfo.event.extendedProps.createdBy._id.toString() === userId;
    const crown = isCreator ? '👑' : '';
    const feedbackIcon = eventInfo.event.extendedProps.hasFeedback ? '💬' : '';

    return (
      <div className="custom-event-content">
        <div className="event-icons">{crown}{feedbackIcon}</div>
        <div className="event-title">{eventInfo.event.title}</div>
      </div>
    );
  };

  const handleViewChange = (viewInfo) => {
    setCurrentView(viewInfo.view.type);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const allEvents = calendarApi.getEvents();
      allEvents.forEach(event => {
        event.setProp('backgroundColor', eventColor);
        event.setProp('borderColor', eventColor);
        event.setProp('textColor', getContrastColor(eventColor));
      });
    }
  };

  return (
    <div className="event-calendar-container" onContextMenu={(e) => e.preventDefault()}>
      <ToastContainer
        position="bottom-left"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 999999, position: 'fixed', bottom: 0, left: 0, width: 'auto' }}
      />
      <div className="calendar-legend">
        <span className="legend-item">👑 Creator</span>
        <span className="legend-item">💬 Feedback</span>
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView={currentView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        locale="ro"
        firstDay={1}
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        height="600px"
        contentHeight="auto"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        buttonText={{
          today: 'Astăzi',
          month: 'Lună',
          week: 'Săptămână',
          day: 'Zi',
        }}
        dayMaxEvents={true}
        views={{
          timeGridWeek: {
            slotDuration: '01:00:00',
            slotLabelInterval: '01:00',
          },
          timeGridDay: {
            slotDuration: '01:00:00',
            slotLabelInterval: '01:00',
          },
        }}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        viewDidMount={handleViewChange}
        datesSet={handleViewChange}
      />

      {isModalOpen && eventDetails && (
        <div
          className={`event-modal-overlay ${showFeedbackModal ? 'event-modal-overlay-inactive' : ''}`}
          onClick={handleOverlayClick}
        >
          <div className="event-modal-content event-details-modal" ref={modalRef}>
            <div className="event-modal-header">
              {((userRole === 'manager' || userRole === 'staff') && eventDetails.createdBy && eventDetails.createdBy._id === userId) && (
                <div className="delete-section">
                  <button
                    className="event-modal-delete-btn"
                    onClick={() => handleDeleteEvent(eventDetails._id)}
                    aria-label="Șterge eveniment"
                  >
                    <i className="fas fa-trash-alt"></i> Șterge
                  </button>
                  {feedbacks.length > 0 && (
                    <p className="delete-warning">
                      Atenție! Acest eveniment are {feedbacks.length} feedback-uri asociate. Ștergerea evenimentului va șterge și feedback-urile.
                    </p>
                  )}
                </div>
              )}
              <button className="event-modal-close-btn" onClick={closeModal} aria-label="Închide">
                X
              </button>
            </div>
            <h2>{eventDetails.title}</h2>
            <div className="event-details-content">
              <p><strong>Descriere:</strong> {eventDetails.description}</p>
              <p><strong>Data de început:</strong> {formatDate(eventDetails.startDate)}</p>
              <p><strong>Data de sfârșit:</strong> {formatDate(eventDetails.finishDate)}</p>
              <p><strong>Status:</strong> {eventDetails.status}</p>
              <p>
                <strong>Creat de:</strong>{' '}
                {eventDetails.createdBy
                  ? `${eventDetails.createdBy.name} (${eventDetails.createdBy.email})`
                  : 'Necunoscut'}
              </p>

              {eventDetails.players && eventDetails.players.length > 0 ? (
                <div>
                  <h4>Jucători:</h4>
                  <ul className="event-participants-list">
                    {eventDetails.players.map((player) => (
                      <li key={player._id}>
                        {player.playerId
                          ? `${player.playerId.firstName} ${player.playerId.lastName}`
                          : player.name}{' '}
                        ({player.email})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p><strong>Jucători:</strong> Niciun jucător asociat.</p>
              )}

              {eventDetails.staff && eventDetails.staff.length > 0 ? (
                <div>
                  <h4>Staff:</h4>
                  <ul className="event-participants-list">
                    {eventDetails.staff.map((staff) => (
                      <li key={staff._id}>
                        {staff.staffId
                          ? `${staff.staffId.firstName} ${staff.staffId.lastName}`
                          : staff.name}{' '}
                        ({staff.email})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p><strong>Staff:</strong> Niciun membru al staff-ului asociat.</p>
              )}

              {((userRole === 'manager' && eventDetails.createdBy && eventDetails.createdBy._id === userId) ||
                (userRole === 'staff' && eventDetails.createdBy && eventDetails.createdBy._id === userId)) && (
                <button className="event-add-feedback-btn" onClick={handleOpenFeedbackModal}>
                  Adaugă feedback
                </button>
              )}
              <FeedbackList feedbacks={feedbacks} userRole={userRole} />
            </div>
          </div>
        </div>
      )}

      {showFeedbackModal && eventDetails && (
        <AddFeedbackModal
          event={eventDetails}
          onClose={handleCloseFeedbackModal}
          onFeedbackAdded={handleFeedbackAdded}
        />
      )}
    </div>
  );
};

export default EventCalendar;