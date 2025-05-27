import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminCharts = ({ totalAdmins, totalPlayers, totalManagers, totalStaff, newPlayersLastMonth, averageAge, nationalities }) => {
  // Data for Bar Chart (User Distribution by Category)
  const chartData = {
    labels: [`Admins (${totalAdmins})`, `Players (${totalPlayers})`, `Managers (${totalManagers})`, `Staff (${totalStaff})`],
    datasets: [
      { label: `Number of Admins`, data: [totalAdmins, 0, 0, 0], backgroundColor: '#FF5733', borderColor: '#FF5733', borderWidth: 1 },
      { label: `Number of Players`, data: [0, totalPlayers, 0, 0], backgroundColor: '#33FF57', borderColor: '#33FF57', borderWidth: 1 },
      { label: `Number of Managers`, data: [0, 0, totalManagers, 0], backgroundColor: '#3357FF', borderColor: '#3357FF', borderWidth: 1 },
      { label: `Number of Staff`, data: [0, 0, 0, totalStaff], backgroundColor: '#FFD700', borderColor: '#FFD700', borderWidth: 1 },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { 
      y: { ticks: { stepSize: 1 }, min: 0, max: Math.max(totalAdmins, totalPlayers, totalManagers, totalStaff) + 1 }, 
      x: { ticks: { font: { size: 14 } } },
    },
    plugins: { 
      legend: { display: true, position: 'top', labels: { font: { size: 14 }, boxWidth: 20 } }, 
      title: { display: true, text: 'Number of Users by Category', font: { size: 18 } },
    },
  };

  // Data for Pie Chart (Nationality Distribution)
  const nationalityLabels = Object.keys(nationalities);
  const nationalityData = Object.values(nationalities);
  const nationalityChartData = {
    labels: nationalityLabels,
    datasets: [
      { 
        label: 'Nationalities', 
        data: nationalityData, 
        backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FFD700', '#FF00FF', '#00CED1'], 
        borderColor: ['#FFFFFF'], 
        borderWidth: 1 
      }
    ],
  };

  const nationalityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { position: 'top' }, 
      title: { display: true, text: 'Nationality Distribution of Players', font: { size: 18 } },
    },
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
    </div>
  );
};

export default AdminCharts;