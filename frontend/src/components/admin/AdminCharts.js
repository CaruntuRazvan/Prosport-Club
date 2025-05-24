import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminCharts = ({ totalAdmins, totalPlayers, totalManagers, totalStaff, newPlayersLastMonth, averageAge, nationalities }) => {
  // Date pentru graficul Bar (distribuția utilizatorilor pe categorii)
  const chartData = {
    labels: [`Admini (${totalAdmins})`, `Jucători (${totalPlayers})`, `Manageri (${totalManagers})`, `Staff (${totalStaff})`],
    datasets: [
      { label: `Număr admini`, data: [totalAdmins, 0, 0, 0], backgroundColor: '#FF5733', borderColor: '#FF5733', borderWidth: 1 },
      { label: `Număr jucători`, data: [0, totalPlayers, 0, 0], backgroundColor: '#33FF57', borderColor: '#33FF57', borderWidth: 1 },
      { label: `Număr manageri`, data: [0, 0, totalManagers, 0], backgroundColor: '#3357FF', borderColor: '#3357FF', borderWidth: 1 },
      { label: `Număr staff`, data: [0, 0, 0, totalStaff], backgroundColor: '#FFD700', borderColor: '#FFD700', borderWidth: 1 },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { ticks: { stepSize: 1 }, min: 0, max: Math.max(totalAdmins, totalPlayers, totalManagers, totalStaff) + 1 }, x: { ticks: { font: { size: 14 } } } },
    plugins: { legend: { display: true, position: 'top', labels: { font: { size: 14 }, boxWidth: 20 } }, title: { display: true, text: 'Număr utilizatori pe categorii', font: { size: 18 } } },
  };

  // Date pentru graficul Pie (distribuția naționalităților)
  const nationalityLabels = Object.keys(nationalities);
  const nationalityData = Object.values(nationalities);
  const nationalityChartData = {
    labels: nationalityLabels,
    datasets: [{ label: 'Naționalități', data: nationalityData, backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FFD700', '#FF00FF', '#00CED1'], borderColor: ['#FFFFFF'], borderWidth: 1 }],
  };

  const nationalityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Distribuția naționalităților jucătorilor', font: { size: 18 } } },
  };

  return (
    <div className="charts-wrapper">
      <div className="chart-item">
        <div style={{ height: '300px', width: '500px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
      <div className="chart-item">
        <div style={{ height: '300px', width: '400px' }}>
          <Pie data={nationalityChartData} options={nationalityChartOptions} />
        </div>
      </div>
      {/* Placeholder pentru alte grafice pe care le poți adăuga */}
      {/* Ex. <div className="chart-item"><Line data={newChartData} options={newChartOptions} /></div> */}
    </div>
  );
};

export default AdminCharts;