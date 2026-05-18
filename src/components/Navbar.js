import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ usuario, onLogout }) {
  const navigate = useNavigate();
  const rolLabel = { ADMIN: 'Administrador', SUPERVISOR: 'Supervisor', LECTURA: 'Solo lectura' };
  const rolBadge = { ADMIN: 'badge-admin', SUPERVISOR: 'badge-super', LECTURA: 'badge-lectura' };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')} style={{cursor:'pointer'}}>
        HORARIOS<span> / DREAMS</span>
      </div>
      <div className="navbar-user">
        <span style={{color:'var(--text2)', fontSize:'13px'}}>{usuario.nombre}</span>
        <span className={`badge ${rolBadge[usuario.rol]}`}>{rolLabel[usuario.rol]}</span>
        <button className="btn btn-secondary" style={{padding:'6px 14px', fontSize:'12px'}}
          onClick={onLogout}>Salir</button>
      </div>
    </nav>
  );
}
