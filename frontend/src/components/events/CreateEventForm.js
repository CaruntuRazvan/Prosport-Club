import React, { useState, useEffect } from 'react';
import { fetchPlayers, fetchStaff } from '../../services/userService';
import { createEvent } from '../../services/eventService';
import { toast } from 'react-toastify';
import '../../styles/shared/CreateForm.css';

const CreateEventForm = ({ onEventCreated, userId }) => {
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    finishDate: '',
    finishTime: '',
    players: [],
    staff: [],
  });
  const [players, setPlayers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectionMode, setSelectionMode] = useState('manual');

  useEffect(() => {
    const loadPlayers = async () => {
      const playerList = await fetchPlayers();
      setPlayers(playerList);
    };
    loadPlayers();

    const loadStaff = async () => {
      const staffList = await fetchStaff();
      const filteredStaff = staffList.filter(staff => staff._id !== userId);
      setStaff(filteredStaff);
    };
    loadStaff();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const validateDate = (dateStr) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateStr)) return false;

    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() + 1 === month && date.getFullYear() === year;
  };

  const validateTime = (timeStr) => {
    const regex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(timeStr);
  };

  const convertToISO = (dateStr, timeStr) => {
    if (!validateDate(dateStr) || !validateTime(timeStr)) {
      throw new Error('Invalid date or time format.');
    }

    const [day, month, year] = dateStr.split('/').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(year, month - 1, day, hours, minutes);
    return date.toISOString();
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      if (!validateDate(newEvent.startDate)) {
        throw new Error('Start date must be in dd/mm/yyyy format.');
      }
      if (!validateTime(newEvent.startTime)) {
        throw new Error('Start time must be in hh:mm format (e.g., 15:00).');
      }
      if (!validateDate(newEvent.finishDate)) {
        throw new Error('End date must be in dd/mm/yyyy format (e.g., 31/12/2023).');
      }
      if (!validateTime(newEvent.finishTime)) {
        throw new Error('End time must be in hh:mm format (e.g., 15:00).');
      }

      const startDateISO = convertToISO(newEvent.startDate, newEvent.startTime);
      const finishDateISO = convertToISO(newEvent.finishDate, newEvent.finishTime);

      const response = await createEvent({
        ...newEvent,
        startDate: startDateISO,
        finishDate: finishDateISO,
      });

      setNewEvent({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        finishDate: '',
        finishTime: '',
        players: [],
        staff: [],
      });

      // close the selection mode
      if (onEventCreated) {
        onEventCreated(response);
      }

      toast.success('Event created!', {
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
    } catch (err) {
      toast.error('Error creating the event: ' + err.message, {
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

  const handlePlayerSelection = (mode) => {
    setSelectionMode(mode);
    let selectedPlayers = [];
    const goalkeepers = players.filter(player => player.playerId?.position === 'Goalkeeper');
    const defenders = players.filter(player => player.playerId?.position === 'Defender');
    const midfielders = players.filter(player => player.playerId?.position === 'Midfielder');
    const forwards = players.filter(player => player.playerId?.position === 'Forward');

    switch (mode) {
      case 'all':
        selectedPlayers = players.map(player => player._id);
        break;
      case 'goalkeepers':
        selectedPlayers = goalkeepers.map(player => player._id);
        break;
      case 'defenders':
        selectedPlayers = defenders.map(player => player._id);
        break;
      case 'midfielders':
        selectedPlayers = midfielders.map(player => player._id);
        break;
      case 'forwards':
        selectedPlayers = forwards.map(player => player._id);
        break;
      case 'manual':
        selectedPlayers = [];
        break;
      default:
        selectedPlayers = [];
    }
    setNewEvent({ ...newEvent, players: selectedPlayers });
    console.log(`Selected ${mode}:`, selectedPlayers);
  };

  const handlePlayerChange = (e) => {
    const selectedPlayers = Array.from(e.target.selectedOptions, option => option.value);
    setNewEvent({ ...newEvent, players: selectedPlayers });
    console.log('Manually selected players:', selectedPlayers);
  };

  const handleStaffChange = (e) => {
    const selectedStaff = Array.from(e.target.selectedOptions, option => option.value);
    setNewEvent({ ...newEvent, staff: selectedStaff });
  };

  return (
    <section className="create-event-section">
      <h2>Create Event</h2>
      <form onSubmit={handleCreateEvent} className="event-form">
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={newEvent.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={newEvent.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Start date:</label>
          <input
            type="text"
            name="startDate"
            placeholder="dd/mm/yyyy"
            value={newEvent.startDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Start time</label>
          <input
            type="text"
            name="startTime"
            placeholder="hh:mm"
            value={newEvent.startTime}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>End Date:</label>
          <input
            type="text"
            name="finishDate"
            placeholder="dd/mm/yyyy"
            value={newEvent.finishDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>End time:</label>
          <input
            type="text"
            name="finishTime"
            placeholder="hh:mm"
            value={newEvent.finishTime}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Player Selection Mode:</label>
          <div className="selection-mode">
            <button
              type="button"
              onClick={() => handlePlayerSelection('all')}
              className={selectionMode === 'all' ? 'active' : ''}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handlePlayerSelection('goalkeepers')}
              className={selectionMode === 'goalkeepers' ? 'active' : ''}
            >
              Goalkeepers
            </button>
            <button
              type="button"
              onClick={() => handlePlayerSelection('defenders')}
              className={selectionMode === 'defenders' ? 'active' : ''}
            >
              Defenders
            </button>
            <button
              type="button"
              onClick={() => handlePlayerSelection('midfielders')}
              className={selectionMode === 'midfielders' ? 'active' : ''}
            >
              Midfielders
            </button>
            <button
              type="button"
              onClick={() => handlePlayerSelection('forwards')}
              className={selectionMode === 'forwards' ? 'active' : ''}
            >
              Forwards
            </button>
            <button
              type="button"
              onClick={() => handlePlayerSelection('manual')}
              className={selectionMode === 'manual' ? 'active' : ''}
            >
              Manual
            </button>
          </div>
        </div>
        {selectionMode === 'manual' && (
          <div className="form-group">
            <label>Players: (Hold Ctrl/Cmd for multiple selection)</label>
            <select
              name="players"
              multiple
              value={newEvent.players}
              onChange={handlePlayerChange}
              size={5}
            >
              {players.map(player => (
                <option key={player._id} value={player._id}>
                  {player.name} ({player.playerId?.position || 'N/A'})
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="form-group">
          <label>Staff:</label>
          <select
            name="staff"
            multiple
            value={newEvent.staff}
            onChange={handleStaffChange}
            size={3}
          >
            {staff.map(staff => (
              <option key={staff._id} value={staff._id}>
                {staff.name} ({staff.staffId?.role || 'N/A'})
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="submit-event">Create Event</button>
      </form>
    </section>
  );
};

export default CreateEventForm;