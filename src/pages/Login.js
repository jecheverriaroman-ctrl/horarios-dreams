import React, { useState } from 'react';
import { loginUsuario } from '../services/api';
import './Login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const u = await loginUsuario(email);
      onLogin(u);
    } catch (err) {
      setError('Usuario no encontrado. Verifica tu correo corporativo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-dot" />
          <span className="logo-text">HORARIOS<span>DREAMS</span></span>
        </div>
        <p className="login-sub">Sistema de gestión de turnos</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label>Correo corporativo</label>
          <input
            type="email"
            placeholder="usuario@monticello.cl"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Verificando...' : 'Ingresar →'}
          </button>
        </form>
        <div className="login-hint">
          <p>Demo: usa uno de estos correos</p>
          <code>jecheverria@monticello.cl</code>
          <code>supervisor.hotel@monticello.cl</code>
          <code>lectura@monticello.cl</code>
        </div>
      </div>
      <div className="login-bg-text">DREAMS</div>
    </div>
  );
}
