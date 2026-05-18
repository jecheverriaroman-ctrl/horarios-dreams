import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocales } from '../services/api';
import Navbar from '../components/Navbar';
import './Dashboard.css';

export default function Dashboard({ usuario, onLogout }) {
  const [locales, setLocales] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getLocales().then(data => {
      if (usuario.rol === 'SUPERVISOR') {
        setLocales(data.filter(l => l.codigo === usuario.local));
      } else {
        setLocales(data);
      }
    });
  }, [usuario]);

  const mesActual = new Date().toLocaleString('es-CL', { month: 'long', year: 'numeric' });

  return (
    <>
      <Navbar usuario={usuario} onLogout={onLogout} />
      <div className="page">
        <div className="dashboard-header mb-24">
          <div>
            <h1 className="dashboard-title">Panel General</h1>
            <p className="dashboard-sub">Período activo: <strong>{mesActual}</strong></p>
          </div>
          {usuario.rol === 'ADMIN' && (
            <button className="btn btn-primary" onClick={() => navigate('/admin')}>
              + Configurar dotación
            </button>
          )}
        </div>

        <div className="section-title">Locales activos</div>
        <div className="locales-grid">
          {locales.map(local => (
            <div key={local.codigo} className="local-card"
              onClick={() => navigate(`/horario/${local.codigo}`)}>
              <div className="local-card-top">
                <span className="local-codigo">{local.codigo}</span>
                <span className={`badge badge-${local.area === 'FOH' ? 'super' : local.area === 'BOH' ? 'lectura' : 'admin'}`}>
                  {local.area}
                </span>
              </div>
              <div className="local-nombre">{local.nombre}</div>
              <div className="local-action">Ver horario →</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
