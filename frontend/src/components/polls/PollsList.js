import React, { useState, useEffect } from 'react';
import { voteInPoll, fetchPolls, fetchPollById, deletePoll } from '../../services/pollService';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/polls/PollsList.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PollsList = ({ userId, userRole }) => {
  const [polls, setPolls] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [voteFilter, setVoteFilter] = useState('all'); // Nou: Filtru pentru hasVoted
  const [selectedPollId, setSelectedPollId] = useState(null);
  const [results, setResults] = useState(null);
  const [votes, setVotes] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // Nou: Filtru pentru Active/Expired

  useEffect(() => {
    fetchPollsData();
  }, []);

  const fetchPollsData = async () => {
    try {
      const data = await fetchPolls();
      console.log('Date primite de la fetchPolls:', data);
      data.forEach(poll => {
        console.log(`Poll ID: ${poll._id}, hasVoted: ${poll.hasVoted}`);
      });
      setPolls(data);
      setFilteredPolls(data);
    } catch (error) {
      toast.error(error.message || 'Error fetching polls.', {
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

  const handleVote = async (pollId, optionIndex) => {
    try {
      await voteInPoll(pollId, optionIndex);
      toast.success('Vote recorded successfully!', {
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
      fetchPollsData();
      if (selectedPollId === pollId) {
        fetchPollResults(pollId);
      }
    } catch (error) {
      toast.error(error.message || 'You have already voted in this poll.', {
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

  const fetchPollResults = async (pollId) => {
    try {
      const data = await fetchPollById(pollId);
      setSelectedPollId(pollId);
      setResults(data.results);
      setVotes(data.votes || []);
    } catch (error) {
      toast.error(error.message || 'Error fetching poll results.', {
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

  const togglePollResults = (pollId) => {
    if (selectedPollId === pollId) {
      setSelectedPollId(null);
      setResults(null);
      setVotes([]);
    } else {
      fetchPollResults(pollId);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      try {
        await deletePoll(pollId);
        toast.success('Poll deleted successfully!', {
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
        fetchPollsData();
        setSelectedPollId(null);
        setResults(null);
        setVotes([]);
      } catch (error) {
        toast.error(error.message || 'Error deleting poll.', {
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
    }
  };

  useEffect(() => {
    let searchFiltered = polls.filter(poll =>
      poll.question.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    if (userRole === 'player' && voteFilter !== 'all') {
      searchFiltered = searchFiltered.filter(poll =>
        voteFilter === 'voted' ? poll.hasVoted : !poll.hasVoted
      );
    }
    if ((userRole === 'manager' || userRole === 'staff') && statusFilter !== 'all') {
      searchFiltered = searchFiltered.filter(poll =>
        statusFilter === 'active' ? !poll.expiresAt || new Date(poll.expiresAt) >= new Date() : poll.expiresAt && new Date(poll.expiresAt) < new Date()
      );
    }
    setFilteredPolls(searchFiltered);
  }, [searchQuery, polls, voteFilter, statusFilter, userRole]);

  const groupVotesByOption = (votes) => {
    const grouped = {};
    votes.forEach((vote) => {
      const { option, user } = vote;
      if (!grouped[option]) {
        grouped[option] = [];
      }
      grouped[option].push(user);
    });
    return grouped;
  };

  const chartData = results && results.some(result => result.voteCount > 0)
    ? {
        labels: results.map(result => result.text),
        datasets: [
          {
            label: 'Number of Votes',
            data: results.map(result => result.voteCount),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} votes (${percentage}%)`;
          },
        },
      },
    },
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Calculează statisticile
  const totalPolls = polls.length;
  const activePolls = polls.filter(poll => !poll.expiresAt || new Date(poll.expiresAt) >= new Date()).length;

  return (
    <section className="polls-section">
      <ToastContainer
        position="bottom-left"
        autoClose={1500}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 999999, position: 'fixed', bottom: 0, left: 0 }}
      />
      {/* Secțiunea de statistici */}
      <div className="polls-stats-section">
        <div className="polls-stats-line">
          <span className="polls-stat-item total">Total: {totalPolls}</span>
          <span className="polls-stat-item active">Active: {activePolls}</span>
        </div>
      </div>
      <div className="filters">
        {userRole === 'player' && (
          <label className="vote-filter">
            Vote Status
            <select value={voteFilter} onChange={(e) => setVoteFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="voted">Voted</option>
              <option value="not-voted">Not Voted</option>
            </select>
          </label>
        )}
        {(userRole === 'manager' || userRole === 'staff') && (
          <label className="status-filter">
            Poll Status:
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </label>
        )}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search polls by title..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>
      <div className="polls-list">
        {polls.length === 0 ? (
          <p className="no-polls-message">No polls available.</p>
        ) : filteredPolls.length === 0 ? (
          <p className="no-polls-message">
          {searchQuery ? `No polls found for "${searchQuery}".` : 'No polls available for the selected filters.'}
        </p>
        ) : (
          filteredPolls.map((poll) => {
            const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
            return (
              <div key={poll._id} className={`poll-item ${userRole === 'player' && poll.hasVoted ? 'voted' : userRole === 'player' ? 'not-voted' : ''}`}>
                <h4>{poll.question}</h4>
                <p>Created by: {poll.createdBy?.name || 'Unknown user'}</p>
                {poll.expiresAt && (
                  <p>Expires on: {new Date(poll.expiresAt).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                )}
                {userRole === 'player' && (
                  <>
                    {isExpired ? (
                      <p>This poll has expired.</p>
                    ) : poll.hasVoted ? (
                      <div>
                        <p className="voted-message">✅ You have already voted in this poll.</p>
                        <button
                          onClick={() => togglePollResults(poll._id)}
                          className="view-results-btn"
                        >
                          {selectedPollId === poll._id ? 'Hide Results' : 'View Results'}
                        </button>
                      </div>
                    ) : (
                      <div className="poll-options">
                        {poll.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleVote(poll._id, index)}
                            className="vote-btn"
                          >
                            {option.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {(userRole === 'manager' || userRole === 'staff') && (
                  <>
                    <button
                      onClick={() => togglePollResults(poll._id)}
                      className="view-results-btn"
                    >
                      {selectedPollId === poll._id ? 'Hide Results' : 'View Results'}
                    </button>
                    {poll.createdBy._id === userId && (
                      <button
                        onClick={() => handleDeletePoll(poll._id)}
                        className="delete-poll-btn"
                        title="Delete poll"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-trash"
                          viewBox="0 0 16 16"
                        >
                          <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z" />
                          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
                {selectedPollId === poll._id && (
                  <div className="poll-results">
                    <h3>Results: {poll.question}</h3>
                    {results && results.some(result => result.voteCount > 0) ? (
                      <div className="chart-container">
                        <Pie data={chartData} options={chartOptions} />
                      </div>
                    ) : (
                      <div className="no-votes-message">
                        <p style={{ margin: 0, padding: '10px', background: '#f8f9fa', borderRadius: '5px', textAlign: 'center' }}>
                          No votes yet for this poll. Let's promote it! 🎉
                        </p>
                      </div>
                    )}
                    {(userRole === 'manager' || userRole === 'staff') && votes.length > 0 && (
                      <div className="voters-list">
                        <h4>Players who voted:</h4>
                        <div className="voters-columns">
                          {Object.entries(groupVotesByOption(votes)).map(([option, users]) => (
                            <div key={option} className="vote-column">
                              <h5>{option}</h5>
                              <ul>
                                {users.map((user, index) => (
                                  <li key={index}>{user}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default PollsList;