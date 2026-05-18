import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Admin({ usuario }) {
  const navigate = useNavigate();
  return (
    <>
      <Navbar usuario={usuario} onLogout={() => navigate('/')} />
      <div className="page">
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:24}}>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>← Volver</button>
          <h2 style={{fontFamily:'var(--mono)', fontSize:20}}>Configuración de Dotación</h2>
        </div>
        <div className="card">
          <p style={{color:'var(--text2)'}}>
            Aquí podrás definir cuántos turnos de cada tipo necesitas por día y por local.<br/>
            <strong style={{color:'var(--accent)'}}>Próximamente disponible.</strong>
          </p>
        </div>
      </div>
    </>
  );
}
