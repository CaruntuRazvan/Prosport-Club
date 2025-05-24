import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import '../../styles/manager/ManagerCharts.css'; // Importăm stilurile

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ManagerCharts = ({ playersByPosition, ageDistribution, nationalities, medicalStatus, preferredFoot, averageAge, shirtNumbers }) => {
  // 1. Grafic Bar: Distribuția jucătorilor pe poziții
  const positionLabels = Object.keys(playersByPosition);
  const positionData = Object.values(playersByPosition);
  const positionChartData = {
    labels: positionLabels,
    datasets: [
      {
        label: 'Număr jucători',
        data: positionData,
        backgroundColor: '#33FF57', // Verde
        borderColor: '#33FF57',
        borderWidth: 1,
      },
    ],
  };

  const positionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: { stepSize: 1 },
        min: 0,
        max: Math.max(...positionData) + 1,
      },
      x: {
        ticks: { font: { size: 14 } },
      },
    },
    plugins: {
      legend: { display: true, position: 'top', labels: { font: { size: 14 }, boxWidth: 20 } },
      title: { display: true, text: 'Distribuția jucătorilor pe poziții', font: { size: 18 } },
    },
  };

  // 2. Grafic Bar: Distribuția vârstelor
  const ageLabels = Object.keys(ageDistribution);
  const ageData = Object.values(ageDistribution);
  const ageChartData = {
    labels: ageLabels,
    datasets: [
      {
        label: 'Număr jucători',
        data: ageData,
        backgroundColor: '#3357FF', // Albastru
        borderColor: '#3357FF',
        borderWidth: 1,
      },
    ],
  };

  const ageChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: { stepSize: 1 },
        min: 0,
        max: Math.max(...ageData) + 1,
      },
      x: {
        ticks: { font: { size: 14 } },
      },
    },
    plugins: {
      legend: { display: true, position: 'top', labels: { font: { size: 14 }, boxWidth: 20 } },
      title: { display: true, text: 'Distribuția vârstelor jucătorilor', font: { size: 18 } },
    },
  };

  // 3. Grafic Pie: Distribuția naționalităților
  const nationalityLabels = Object.keys(nationalities);
  const nationalityData = Object.values(nationalities);
  const nationalityChartData = {
    labels: nationalityLabels,
    datasets: [
      {
        label: 'Naționalități',
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
      title: { display: true, text: 'Distribuția naționalităților jucătorilor', font: { size: 18 } },
    },
  };

  // 4. Grafic Pie: Statusul medical al jucătorilor
  const medicalStatusLabels = Object.keys(medicalStatus);
  const medicalStatusData = Object.values(medicalStatus);
  const medicalStatusChartData = {
    labels: medicalStatusLabels,
    datasets: [
      {
        label: 'Status medical',
        data: medicalStatusData,
        backgroundColor: ['#28a745', '#f1c40f', '#dc3545'], // Verde, Galben, Roșu
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
      title: { display: true, text: 'Statusul medical al jucătorilor', font: { size: 18 } },
    },
  };

  // 5. Grafic Pie: Jucători în funcție de piciorul preferat
  const preferredFootLabels = Object.keys(preferredFoot);
  const preferredFootData = Object.values(preferredFoot);
  const preferredFootChartData = {
    labels: preferredFootLabels,
    datasets: [
      {
        label: 'Picior preferat',
        data: preferredFootData,
        backgroundColor: ['#FF5733', '#33FF57', '#3357FF'], // Roșu, Verde, Albastru
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
      title: { display: true, text: 'Jucători în funcție de piciorul preferat', font: { size: 18 } },
    },
  };



  return (
    <div className="charts-wrapper">
      {/* Vârsta medie a jucătorilor */}
      <div className="average-age">
        <h3>Vârsta medie a jucătorilor: {averageAge.toFixed(1)} ani</h3>
      </div>

      {/* Distribuția pe poziții */}
      <div className="chart-item">
        <Bar data={positionChartData} options={positionChartOptions} />
      </div>

      {/* Distribuția vârstelor */}
      <div className="chart-item">
        <Bar data={ageChartData} options={ageChartOptions} />
      </div>

      {/* Distribuția naționalităților */}
      <div className="chart-item">
        <Pie data={nationalityChartData} options={nationalityChartOptions} />
      </div>

      {/* Statusul medical */}
      <div className="chart-item">
        <Pie data={medicalStatusChartData} options={medicalStatusChartOptions} />
      </div>

      {/* Piciorul preferat */}
      <div className="chart-item">
        <Pie data={preferredFootChartData} options={preferredFootChartOptions} />
      </div>
    </div>
  );
};

export default ManagerCharts;