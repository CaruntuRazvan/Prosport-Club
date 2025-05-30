import React, { useState, useEffect } from 'react';
import { fetchFines, deleteFine, updateFineStatus, requestPaymentConfirmation, rejectPaymentRequest, exportFinesToCSV } from '../../services/fineService';
import { toast, ToastContainer } from 'react-toastify';
import { useConfirm } from '../../context/ConfirmContext';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/fines/FineList.css';

const FineList = ({ userId, userRole, refresh, setActiveSection }) => {
  const [fines, setFines] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [paidFilter, setPaidFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const showConfirm  = useConfirm();

  useEffect(() => {
    fetchFinesData();
  }, [refresh]);

  const fetchFinesData = async () => {
    try {
      const data = await fetchFines();
      let filteredData = data;
      if (userRole === 'staff') {
        filteredData = data.filter(fine => fine.creatorId._id === userId);
      }
      console.log('Fines data:', filteredData);
      setFines(filteredData);
    } catch (error) {
      toast.error(error.message || 'Error fetching fines.', {
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

  const handleExportFines = async () => {
    try {
      const response = await exportFinesToCSV();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fines-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message || 'Error exporting fines to CSV.', {
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

  const handleDeleteFine = async (fineId) => {
    showConfirm('Are you sure you want to delete this fine?', async () => {
      try {
        await deleteFine(fineId);
        toast.success('Fine deleted successfully!', {
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
        fetchFinesData();
      } catch (error) {
        toast.error(error.message || 'Error deleting fine.', {
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
    });
  };

  const handleRequestPaymentConfirmation = async (fineId) => {
    try {
      await requestPaymentConfirmation(fineId);
      toast.success('Payment request sent successfully!', {
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
      fetchFinesData();
    } catch (error) {
      toast.error(error.message || 'Error requesting payment confirmation.', {
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

  const handleApprovePayment = async (fineId) => {
    try {
      await updateFineStatus(fineId, true);
      toast.success('Payment approved successfully!', {
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
      fetchFinesData();
    } catch (error) {
      toast.error(error.message || 'Error approving payment.', {
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

  const handleRejectPayment = async (fineId) => {
    try {
      await rejectPaymentRequest(fineId);
      toast.success('Payment request rejected!', {
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
      fetchFinesData();
    } catch (error) {
      toast.error(error.message || 'Error rejecting payment request.', {
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

  const handleGoToFinesTariffs = () => {
    setActiveSection('team'); // Setăm secțiunea activă la "team"
    setTimeout(() => {
      const finesSection = document.getElementById('fines-link-section');
      if (finesSection) {
        finesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 450); 
  };

  const filteredFines = fines.filter((fine) => {
    const matchesActive =
      activeFilter === 'all' ||
      (activeFilter === 'active' && fine.isActive) ||
      (activeFilter === 'inactive' && !fine.isActive);

    const matchesPaid =
      paidFilter === 'all' ||
      (paidFilter === 'paid' && fine.isPaid) ||
      (paidFilter === 'unpaid' && !fine.isPaid);

    const matchesSearch =
      !searchQuery ||
      (fine.receiverId?.name &&
        fine.receiverId.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));

    return matchesActive && matchesPaid && matchesSearch;
  });

  const totalFines = fines.length;
  const activeFines = fines.filter(fine => fine.isActive).length;
  const paidFines = fines.filter(fine => fine.isPaid).length;

  return (
    <section className="fines-section">
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
      <div className="fines-stats-section">
        <div className="fines-stats-line">
          <span className="fines-stat-item total">Total: {totalFines}</span>
          <span className="fines-stat-item active">Active: {activeFines}</span>
          <span className="fines-stat-item paid">Paid: {paidFines}</span>
        </div>
      </div>

      <div className="filters">
        <label>
          Status:
          <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label>
          Payment:
          <select value={paidFilter} onChange={(e) => setPaidFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </label>
        {(userRole === 'manager' || userRole === 'staff') && (
          <div className="search-export-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by player name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            {/* Afișăm butonul doar dacă există cel puțin o amendă */}
            {fines.length > 0 && (
              <button onClick={handleExportFines} className="export-csv-btn">
                Export to CSV
              </button>
            )}
          </div>
        )}
        {userRole === 'player' && (
          <button onClick={handleGoToFinesTariffs} className="go-to-fines-tariffs-btn">
            Go to Fines Tariffs
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
              <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
            </svg>
          </button>
        )}
      </div>

      <div className="fines-list">
        {fines.length === 0 ? (
          <p className="no-fines-message">No fines available.</p>
        ) : filteredFines.length === 0 ? (
          <p className="no-fines-message">
            {searchQuery ? `No fines found for "${searchQuery}".` : 'No fines available for the selected filters.'}
          </p>
        ) : (
          filteredFines.map((fine) => {
            console.log('Fine data:', fine);
            const isExpired = fine.expirationDate && new Date(fine.expirationDate) < new Date();
            return (
              <div key={fine._id} className="fine-item">
                {userRole === 'player' ? (
                  <>
                    <h4>{fine.reason}</h4>
                    <p>Amount: {fine.amount} EUR</p>
                    <p>Status: {fine.isPaid ? 'Paid' : 'Unpaid'}</p>
                    {fine.expirationDate && (
                      <p>
                        Expires on:{' '}
                        {new Date(fine.expirationDate).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                    <p>From: {fine.creatorId?.name || 'Unknown User'}</p>
                    {fine.receiverId === userId && !fine.isPaid && !fine.paymentRequested && !isExpired && (
                      <button
                        onClick={() => handleRequestPaymentConfirmation(fine._id)}
                        className="request-payment-btn"
                      >
                        I Paid
                      </button>
                    )}
                    {fine.paymentRequested && !fine.isPaid && (
                      <p className="awaiting-confirmation">Awaiting coach confirmation...</p>
                    )}
                    {!fine.paymentRequested && !fine.isPaid && fine.updatedAt > fine.createdAt && (
                      <p className="fine-rejected">Payment request rejected.</p>
                    )}
                    {fine.isPaid && <p className="fine-paid">Fine has been paid.</p>}
                    {isExpired && !fine.isPaid && (
                      <p className="fine-expired">
                        The payment period for this fine has expired. You can no longer pay.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h4>{fine.reason}</h4>
                    <p>Player: {fine.receiverId?.name || 'Unknown'}</p>
                    <p>Amount: {fine.amount} EUR</p>
                    <p>Status: {fine.isPaid ? 'Paid' : 'Unpaid'}</p>
                    {fine.expirationDate && (
                      <p>
                        Expires on:{' '}
                        {new Date(fine.expirationDate).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                    <p>Created by: {fine.creatorId?.name || 'Unknown User'}</p>
                    {fine.paymentRequested && !fine.isPaid && (
                      <p className="payment-requested">Player requested payment confirmation.</p>
                    )}
                    {fine.isPaid && <p className="fine-paid">Fine has been paid.</p>}
                    {isExpired && !fine.isPaid && (
                      <p className="fine-not-paid">Fine has not been paid.</p>
                    )}
                    {(userRole === 'manager' || userRole === 'staff') && fine.creatorId._id === userId && (
                      <>
                        {!fine.isPaid && fine.paymentRequested && (
                          <div className="approval-buttons">
                            <button
                              onClick={() => handleApprovePayment(fine._id)}
                              className="approve-payment-btn"
                            >
                              Approve Payment
                            </button>
                            <button
                              onClick={() => handleRejectPayment(fine._id)}
                              className="reject-payment-btn"
                            >
                              Reject Payment
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteFine(fine._id)}
                          className="delete-fine-btn"
                          title="Delete Fine"
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
                      </>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default FineList;