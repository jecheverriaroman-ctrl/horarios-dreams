import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Horario from './pages/Horario';
import Admin from './pages/Admin';
import './App.css';

export default function App() {
  const [usuario, setUsuario] = useState(null);

  const login = (u) => setUsuario(u);
  const logout = () => setUsuario(null);

  if (!usuario) return <Login onLogin={login} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard usuario={usuario} onLogout={logout} />} />
        <Route path="/horario/:local" element={<Horario usuario={usuario} />} />
        <Route path="/admin" element={
          usuario.rol === 'ADMIN'
            ? <Admin usuario={usuario} />
            : <Navigate to="/" />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
