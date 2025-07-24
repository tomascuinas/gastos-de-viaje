
import React from 'react';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function App() {
  const gastos = [];

  const resumenPorPais = gastos.reduce((acc, gasto) => {
    const pais = gasto.pais;
    if (!acc[pais]) {
      acc[pais] = 0;
    }
    acc[pais] += gasto.monto;
    return acc;
  }, {});

  const resumenPorCategoria = gastos.reduce((acc, gasto) => {
    const categoria = gasto.categoria;
    if (!acc[categoria]) {
      acc[categoria] = 0;
    }
    acc[categoria] += gasto.monto;
    return acc;
  }, {});

  const dataResumenPorPais = {
    labels: Object.keys(resumenPorPais),
    datasets: [
      {
        label: 'Monto',
        data: Object.values(resumenPorPais),
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
  };

  const dataResumenPorCategoria = {
    labels: Object.keys(resumenPorCategoria),
    datasets: [
      {
        label: 'Monto',
        data: Object.values(resumenPorCategoria),
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
  };

  const exportarPDF = () => {
    const input = document.getElementById('resumenes-a-exportar');
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save('resumen_gastos.pdf');
      });
  };

  return (
    <>
    <div className="container mt-5">
      <h1 className="text-center mb-4">Registro de Gastos de Viaje</h1>
      <button className="btn btn-success mb-4" onClick={exportarPDF}>Exportar a PDF</button>

      

      <div id="resumenes-a-exportar">
        <h2 className="text-center mb-4">Resumen de Gastos de Viaje</h2>
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-body">
                <h2 className="card-title">Resumen por País</h2>
                <ul className="list-group">
                  {Object.entries(resumenPorPais).map(([pais, total]) => (
                    <li key={pais} className="list-group-item d-flex justify-content-between align-items-center">
                      {pais}
                      <span className="badge bg-success rounded-pill">${total.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ width: '100%', height: '300px' }}>
                  <Pie data={dataResumenPorPais} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-body">
                <h2 className="card-title">Resumen por Categoría</h2>
                <ul className="list-group">
                  {Object.entries(resumenPorCategoria).map(([categoria, total]) => (
                    <li key={categoria} className="list-group-item d-flex justify-content-between align-items-center">
                      {categoria}
                      <span className="badge bg-info rounded-pill">${total.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ width: '100%', height: '300px' }}>
                  <Bar data={dataResumenPorCategoria} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card mb-4">
          <div className="card-body">
            <h2 className="card-title">Gasto Total del Viaje</h2>
            <h3 className="text-center">No hay gastos registrados.</h3>
          </div>
        </div>
      </div>

      
    </div>
    </>
  );
}

export default App;
