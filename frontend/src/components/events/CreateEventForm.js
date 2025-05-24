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
      throw new Error('Format dată sau oră invalid.');
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
        throw new Error('Data de start trebuie să fie în format zz/ll/aaaa.');
      }
      if (!validateTime(newEvent.startTime)) {
        throw new Error('Ora de start trebuie să fie în format hh:mm (ex. 15:00).');
      }
      if (!validateDate(newEvent.finishDate)) {
        throw new Error('Data de sfârșit trebuie să fie în format zz/ll/aaaa.');
      }
      if (!validateTime(newEvent.finishTime)) {
        throw new Error('Ora de sfârșit trebuie să fie în format hh:mm (ex. 15:00).');
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

      // Închidem modalul imediat
      if (onEventCreated) {
        onEventCreated(response);
      }

      // Afișăm toast-ul de succes după închiderea modalului
      toast.success('Eveniment creat!', {
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
      toast.error('Eroare la crearea evenimentului: ' + err.message, {
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
    console.log(`Selectați ${mode}:`, selectedPlayers);
  };

  const handlePlayerChange = (e) => {
    const selectedPlayers = Array.from(e.target.selectedOptions, option => option.value);
    setNewEvent({ ...newEvent, players: selectedPlayers });
    console.log('Jucători selectați manual:', selectedPlayers);
  };

  const handleStaffChange = (e) => {
    const selectedStaff = Array.from(e.target.selectedOptions, option => option.value);
    setNewEvent({ ...newEvent, staff: selectedStaff });
  };

  return (
    <section className="create-event-section">
      <h2>Creare Eveniment</h2>
      <form onSubmit={handleCreateEvent} className="event-form">
        <div className="form-group">
          <label>Titlu:</label>
          <input
            type="text"
            name="title"
            value={newEvent.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Descriere:</label>
          <textarea
            name="description"
            value={newEvent.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Data de start:</label>
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
          <label>Ora de start:</label>
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
          <label>Data de sfârșit:</label>
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
          <label>Ora de sfârșit:</label>
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
          <label>Mod selecție jucători:</label>
          <div className="selection-mode">
            <button
              type="button"
              onClick={() => handlePlayerSelection('all')}
              className={selectionMode === 'all' ? 'active' : ''}
            >
              Toți
            </button>
            <button
              type="button"
              onClick={() => handlePlayerSelection('goalkeepers')}
              className={selectionMode === 'goalkeepers' ? 'active' : ''}
            >
              Portari
            </button>
            <button
              type="button"
              onClick={() => handlePlayerSelection('defenders')}
              className={selectionMode === 'defenders' ? 'active' : ''}
            >
              Fundași
            </button>
            <button
              type="button"
              onClick={() => handlePlayerSelection('midfielders')}
              className={selectionMode === 'midfielders' ? 'active' : ''}
            >
              Mijlocași
            </button>
            <button
              type="button"
              onClick={() => handlePlayerSelection('forwards')}
              className={selectionMode === 'forwards' ? 'active' : ''}
            >
              Atacanți
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
            <label>Jucători: (Ține apăsată Ctrl/Cmd pentru selecție multiplă)</label>
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
        <button type="submit" className="submit-event">Creează Eveniment</button>
      </form>
    </section>
  );
};

export default CreateEventForm;