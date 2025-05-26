import React, { useState, useEffect } from 'react';
import { fetchFines, deleteFine, updateFineStatus, requestPaymentConfirmation, rejectPaymentRequest, exportFinesToCSV } from '../../services/fineService';
import { toast, ToastContainer } from 'react-toastify';
import { useConfirm } from '../../context/ConfirmContext';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/fines/FineList.css';

const FineList = ({ userId, userRole, refresh }) => {
  const [fines, setFines] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [paidFilter, setPaidFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { showConfirm } = useConfirm();
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
      toast.error(error.message || 'Eroare la preluarea penalizărilor.', {
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
      toast.error(error.message || 'Eroare la exportarea amenzilor în CSV.', {
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
    showConfirm('Ești sigur că vrei să ștergi această penalizare?', async () => {
      try {
        await deleteFine(fineId);
        toast.success('Penalizare ștearsă cu succes!', {
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
        toast.error(error.message || 'Eroare la ștergerea penalizării.', {
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
      toast.success('Solicitare de plată trimisă cu succes!', {
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
      toast.error(error.message || 'Eroare la solicitarea confirmării plății.', {
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
      toast.success('Plata aprobată cu succes!', {
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
      toast.error(error.message || 'Eroare la aprobarea plății.', {
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
      toast.success('Solicitarea de plată a fost respinsă!', {
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
      toast.error(error.message || 'Eroare la respingerea solicitării de plată.', {
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

  // Calculează statisticile
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
          <span className="fines-stat-item paid">Plătite: {paidFines}</span>
        </div>
     </div>

      <div className="filters">
        <label>
          Stare:
          <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
            <option value="all">Toate</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label>
          Plată:
          <select value={paidFilter} onChange={(e) => setPaidFilter(e.target.value)}>
            <option value="all">Toate</option>
            <option value="paid">Plătite</option>
            <option value="unpaid">Neplătite</option>
          </select>
        </label>
        {(userRole === 'manager' || userRole === 'staff') && (
          <div className="search-export-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="Caută după nume jucător..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button onClick={handleExportFines} className="export-csv-btn">
              Exportă CSV
            </button>
          </div>
        )}
      </div>

      <div className="fines-list">
        {fines.length === 0 ? (
          <p className="no-fines-message">Nu există penalizări disponibile.</p>
        ) : filteredFines.length === 0 ? (
          <p className="no-fines-message">
            {searchQuery ? `Nici o penalizare găsită pentru „${searchQuery}”.` : 'Nu există penalizări disponibile pentru filtrele selectate.'}
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
                    <p>Suma: {fine.amount} EUR</p>
                    <p>Stare: {fine.isPaid ? 'Plătită' : 'Neplătită'}</p>
                    {fine.expirationDate && (
                      <p>
                        Expiră la:{' '}
                        {new Date(fine.expirationDate).toLocaleString('ro-RO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                    <p>De la: {fine.creatorId?.name || 'Utilizator necunoscut'}</p>
                    {fine.receiverId === userId && !fine.isPaid && !fine.paymentRequested && !isExpired && (
                      <button
                        onClick={() => handleRequestPaymentConfirmation(fine._id)}
                        className="request-payment-btn"
                      >
                        Am plătit
                      </button>
                    )}
                    {fine.paymentRequested && !fine.isPaid && (
                      <p className="awaiting-confirmation">Așteaptă confirmarea antrenorului...</p>
                    )}
                    {!fine.paymentRequested && !fine.isPaid && fine.updatedAt > fine.createdAt && (
                      <p className="fine-rejected">Solicitarea de plată a fost respinsă.</p>
                    )}
                    {fine.isPaid && <p className="fine-paid">Amenda a fost plătită.</p>}
                    {isExpired && !fine.isPaid && (
                      <p className="fine-expired">
                        A expirat perioada de plată pentru această amendă. Nu mai puteți plăti.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h4>{fine.reason}</h4>
                    <p>Jucător: {fine.receiverId?.name || 'Necunoscut'}</p>
                    <p>Suma: {fine.amount} EUR</p>
                    <p>Stare: {fine.isPaid ? 'Plătită' : 'Neplătită'}</p>
                    {fine.expirationDate && (
                      <p>
                        Expiră la:{' '}
                        {new Date(fine.expirationDate).toLocaleString('ro-RO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                    <p>Creat de: {fine.creatorId?.name || 'Utilizator necunoscut'}</p>
                    {fine.paymentRequested && !fine.isPaid && (
                      <p className="payment-requested">Jucătorul a solicitat confirmarea plății.</p>
                    )}
                    {fine.isPaid && <p className="fine-paid">Amenda a fost plătită.</p>}
                    {isExpired && !fine.isPaid && (
                      <p className="fine-not-paid">Amenda nu a fost plătită.</p>
                    )}
                    {(userRole === 'manager' || userRole === 'staff') && fine.creatorId._id === userId && (
                      <>
                        {!fine.isPaid && fine.paymentRequested && (
                          <div className="approval-buttons">
                            <button
                              onClick={() => handleApprovePayment(fine._id)}
                              className="approve-payment-btn"
                            >
                              Aprobă plată
                            </button>
                            <button
                              onClick={() => handleRejectPayment(fine._id)}
                              className="reject-payment-btn"
                            >
                              Respinge plată
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteFine(fine._id)}
                          className="delete-fine-btn"
                          title="Șterge penalizare"
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