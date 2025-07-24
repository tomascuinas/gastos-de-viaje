
import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function App() {
  const [gastos, setGastos] = useState([]);
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [pais, setPais] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [gastoEditando, setGastoEditando] = useState(null);

  useEffect(() => {
    const gastosGuardados = JSON.parse(localStorage.getItem('gastos'));
    if (gastosGuardados) {
      setGastos(gastosGuardados);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gastos', JSON.stringify(gastos));
  }, [gastos]);

  const capitalizar = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const agregarGasto = (e) => {
    e.preventDefault();
    if (!monto) return; // Solo el monto es realmente necesario

    if (gastoEditando) {
      // Actualizar gasto existente
      setGastos(gastos.map(gasto =>
        gasto.id === gastoEditando.id
          ? { ...gasto, fecha, monto: parseFloat(monto), categoria: categoria || 'Sin categoría', descripcion: descripcion || 'Sin descripción', pais: pais || 'Sin país' }
          : gasto
      ));
    } else {
      // Agregar nuevo gasto
      const nuevoGasto = {
        id: Date.now(),
        fecha,
        monto: parseFloat(monto),
        categoria: categoria || 'Sin categoría',
        descripcion: descripcion || 'Sin descripción',
        pais: pais || 'Sin país',
      };
      setGastos([...gastos, nuevoGasto]);
    }
    setMonto('');
    setCategoria('');
    setDescripcion('');
    setPais('');
    setFecha(new Date().toISOString().slice(0, 10));
    setGastoEditando(null); // Clear editing state
  };

  const eliminarGasto = (id) => {
    setGastos(gastos.filter(gasto => gasto.id !== id));
  };

  const editarGasto = (gasto) => {
    setGastoEditando(gasto);
    setMonto(gasto.monto);
    setCategoria(gasto.categoria);
    setDescripcion(gasto.descripcion);
    setPais(gasto.pais);
    setFecha(gasto.fecha);
  };

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
    const input = document.getElementById('pdf-content');
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

      <div id="contenido-a-exportar">
        <div className="card-body">
          <h2 className="card-title">Agregar Gasto</h2>
          <form onSubmit={agregarGasto}>
            <div className="mb-3">
              <label htmlFor="fecha" className="form-label">Fecha</label>
              <input type="date" className="form-control" id="fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div className="mb-3">
              <label htmlFor="monto" className="form-label">Monto</label>
              <input type="number" className="form-control" id="monto" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Ej: 50.00" required />
            </div>
            <div className="mb-3">
              <label htmlFor="categoria" className="form-label">Categoría</label>
              <input type="text" className="form-control" id="categoria" value={categoria} onChange={(e) => setCategoria(capitalizar(e.target.value))} placeholder="Ej: Comida, Transporte" />
            </div>
            <div className="mb-3">
              <label htmlFor="descripcion" className="form-label">Descripción</label>
              <textarea className="form-control" id="descripcion" value={descripcion} onChange={(e) => setDescripcion(capitalizar(e.target.value))} rows="2" placeholder="Ej: Cena en restaurante"></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="pais" className="form-label">País</label>
              <input type="text" className="form-control" id="pais" value={pais} onChange={(e) => setPais(capitalizar(e.target.value))} placeholder="Ej: Argentina" />
            </div>
            <button type="submit" className="btn btn-primary">{gastoEditando ? 'Actualizar' : 'Agregar'}</button>
          </form>
        </div>
      </div>

      <div id="pdf-content">
        <div id="resumenes-a-exportar">
        <h2 className="text-center mb-4">Resumen de Gastos de Viaje</h2>
        <div className="row">
          <div className="col-6">
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
          <div className="col-6">
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
        </div>
        <div className="card mb-4">
          <div className="card-body">
            <h2 className="card-title">Gasto Total del Viaje</h2>
            <h3 className="text-center">${gastos.reduce((acc, gasto) => acc + gasto.monto, 0).toFixed(2)}</h3>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="card-title">Mis Gastos</h2>
          <ul className="list-group">
            {gastos.map((gasto) => (
              <li key={gasto.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">{gasto.descripcion}</h5>
                  <small>{gasto.fecha} - {gasto.pais}</small>
                  <p className="mb-1 text-muted">{gasto.categoria}</p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary rounded-pill me-2">${gasto.monto.toFixed(2)}</span>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => editarGasto(gasto)}>Editar</button>
                  <button className="btn btn-sm btn-danger" onClick={() => eliminarGasto(gasto.id)}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;
