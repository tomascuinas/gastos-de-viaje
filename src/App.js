
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
      <div>Hello World</div>
    </>
  );
}

export default App;
