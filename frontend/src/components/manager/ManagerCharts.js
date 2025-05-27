import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import '../../styles/manager/ManagerCharts.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ManagerCharts = ({
  playersByPosition,
  ageDistribution,
  nationalities,
  medicalStatus,
  preferredFoot,
  averageAge,
  shirtNumbers,
  averageHeightByPosition,
}) => {
  // Definim culorile pentru fiecare categorie
  const positionColors = {
    Goalkeeper: '#FF5733', // Roșu cald
    Defender: '#33FF57', // Verde
    Midfielder: '#3357FF', // Albastru
    Forward: '#FFD700', // Galben auriu
  };

  // 1. Bar Chart: Distribution of Players by Position
  const positionLabels = Object.keys(playersByPosition);
  const positionData = Object.values(playersByPosition);
  const positionChartData = {
    labels: positionLabels,
    datasets: [
      {
        label: 'Number of Players',
        data: positionData,
        backgroundColor: positionLabels.map(position => positionColors[position] || '#999999'), // Folosim culoare implicită dacă poziția nu e în map
        borderColor: positionLabels.map(position => positionColors[position] || '#999999'),
        borderWidth: 1,
      },
    ],
  };

  const positionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { ticks: { stepSize: 1 }, min: 0, max: Math.max(...positionData) + 1 },
      x: { ticks: { font: { size: 14 } } },
    },
    plugins: {
      legend: { display: true, position: 'top', labels: { font: { size: 14 }, boxWidth: 20 } },
      title: { display: true, text: 'Distribution of Players by Position', font: { size: 18 } },
    },
  };

  // 2. Bar Chart: Age Distribution
  const ageLabels = Object.keys(ageDistribution);
  const ageData = Object.values(ageDistribution);
  const ageChartData = {
    labels: ageLabels,
    datasets: [
      {
        label: 'Number of Players',
        data: ageData,
        backgroundColor: '#3357FF',
        borderColor: '#3357FF',
        borderWidth: 1,
      },
    ],
  };

  const ageChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { ticks: { stepSize: 1 }, min: 0, max: Math.max(...ageData) + 1 },
      x: { ticks: { font: { size: 14 } } },
    },
    plugins: {
      legend: { display: true, position: 'top', labels: { font: { size: 14 }, boxWidth: 20 } },
      title: { display: true, text: 'Age Distribution of Players', font: { size: 18 } },
    },
  };

  // 3. Pie Chart: Nationality Distribution
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
        borderWidth: 1,
      },
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

  // 4. Pie Chart: Medical Status of Players
  const medicalStatusLabels = Object.keys(medicalStatus).map(status => {
    switch (status) {
      case 'notInjured':
        return 'Healthy';
      case 'recovering':
        return 'Recovering';
      case 'injured':
        return 'Injured';
      default:
        return status;
    }
  });
  const medicalStatusData = Object.values(medicalStatus);
  const medicalStatusChartData = {
    labels: medicalStatusLabels,
    datasets: [
      {
        label: 'Medical Status',
        data: medicalStatusData,
        backgroundColor: ['#28a745', '#f1c40f', '#dc3545'],
        borderColor: ['#FFFFFF'],
        borderWidth: 1,
      },
    ],
  };

  const medicalStatusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Medical Status of Players', font: { size: 18 } },
    },
  };

  // 5. Pie Chart: Players by Preferred Foot
  const preferredFootLabels = Object.keys(preferredFoot);
  const preferredFootData = Object.values(preferredFoot);
  const preferredFootChartData = {
    labels: preferredFootLabels,
    datasets: [
      {
        label: 'Preferred Foot',
        data: preferredFootData,
        backgroundColor: ['#FF5733', '#33FF57', '#3357FF'],
        borderColor: ['#FFFFFF'],
        borderWidth: 1,
      },
    ],
  };

  const preferredFootChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Players by Preferred Foot', font: { size: 18 } },
    },
  };

  // 6. Bar Chart: Average Height by Position
  const heightLabels = Object.keys(averageHeightByPosition);
  const heightData = Object.values(averageHeightByPosition);
  const heightChartData = {
    labels: heightLabels,
    datasets: [
      {
        label: 'Average Height (cm)',
        data: heightData,
        backgroundColor: heightLabels.map(position => positionColors[position] || '#999999'), // Folosim culoare implicită dacă poziția nu e în map
        borderColor: heightLabels.map(position => positionColors[position] || '#999999'),
        borderWidth: 1,
      },
    ],
  };

  const heightChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { ticks: { stepSize: 10 }, min: 0, max: Math.max(...heightData, 200) + 10 },
      x: { ticks: { font: { size: 14 } } },
    },
    plugins: {
      legend: { display: true, position: 'top', labels: { font: { size: 14 }, boxWidth: 20 } },
      title: { display: true, text: 'Average Height of Players by Position', font: { size: 18 } },
    },
  };

  return (
    <div className="charts-wrapper">
      {/* Average Age of Players */}
      <div className="average-age">
        <h3>Average Age of Players: {averageAge.toFixed(1)} years</h3>
      </div>

      {/* Distribution by Position */}
      <div className="chart-item">
        <Bar data={positionChartData} options={positionChartOptions} />
      </div>

      {/* Age Distribution */}
      <div className="chart-item">
        <Bar data={ageChartData} options={ageChartOptions} />
      </div>

      {/* Nationality Distribution */}
      <div className="chart-item">
        <Pie data={nationalityChartData} options={nationalityChartOptions} />
      </div>

      {/* Medical Status */}
      <div className="chart-item">
        <Pie data={medicalStatusChartData} options={medicalStatusChartOptions} />
      </div>

      {/* Preferred Foot */}
      <div className="chart-item">
        <Pie data={preferredFootChartData} options={preferredFootChartOptions} />
      </div>

      {/* Average Height by Position */}
      <div className="chart-item">
        <Bar data={heightChartData} options={heightChartOptions} />
      </div>
    </div>
  );
};

export default ManagerCharts;