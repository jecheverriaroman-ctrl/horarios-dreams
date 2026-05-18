import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getColaboradores, getTurnos, validarHorario } from '../services/api';
import Navbar from '../components/Navbar';
import GrillaHorario from '../components/GrillaHorario';
import PanelAlertas from '../components/PanelAlertas';
import './Horario.css';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function Horario({ usuario }) {
  const { local } = useParams();
  const navigate = useNavigate();
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio] = useState(hoy.getFullYear());
  const [area, setArea] = useState('FOH');
  const [colaboradores, setColaboradores] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [asignaciones, setAsignaciones] = useState({});
  const [diasEspeciales, setDiasEspeciales] = useState({});
  const [alertas, setAlertas] = useState([]);
  const [showAlertas, setShowAlertas] = useState(false);

  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const DOW = ['Lu','Ma','Mi','Ju','Vi','Sa','Do'];
  const dias = Array.from({length: diasEnMes}, (_, i) => {
    const fecha = new Date(anio, mes, i + 1);
    return { num: i + 1, dow: DOW[fecha.getDay() === 0 ? 6 : fecha.getDay() - 1] };
  });

  useEffect(() => {
    getColaboradores(local).then(setColaboradores);
    getTurnos(local).then(setTurnos);
  }, [local]);

  const colaboradoresFiltrados = colaboradores.filter(c => c.area === area);

  const setAsignacion = useCallback((rut, dia, turno) => {
    setAsignaciones(prev => ({
      ...prev,
      [`${rut}_${dia}`]: turno
    }));
  }, []);

  const setEspecial = useCallback((rut, dia, tipo) => {
    setDiasEspeciales(prev => ({
      ...prev,
      [`${rut}_${dia}`]: tipo
    }));
  }, []);

  const handleValidar = () => {
    const asigArray = Object.entries(asignaciones).map(([key, turno_codigo]) => {
      const [rut, dia] = key.split('_');
      const turno = turnos.find(t => t.codigo === turno_codigo);
      return { rut, dia: parseInt(dia), turno_codigo, hora_entrada: turno?.hora_entrada };
    });
    const espArray = Object.entries(diasEspeciales).map(([key, tipo]) => {
      const [rut, dia] = key.split('_');
      return { rut, dia: parseInt(dia), tipo };
    });
    const result = validarHorario(colaboradoresFiltrados, asigArray, espArray);
    setAlertas(result);
    setShowAlertas(true);
  };

  const totalTrabajando = (dia) => {
    return colaboradoresFiltrados.filter(c => {
      const key = `${c.rut}_${dia}`;
      const val = asignaciones[key] || diasEspeciales[key];
      return val && !['X','DM','9V','9L','B'].includes(val);
    }).length;
  };

  return (
    <>
      <Navbar usuario={usuario} onLogout={() => navigate('/')} />
      <div className="page">
        <div className="horario-header mb-16">
          <div className="flex gap-8" style={{alignItems:'center'}}>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>← Volver</button>
            <h2 className="horario-title">{local}</h2>
          </div>
          <div className="horario-controls">
            <select value={mes} onChange={e => setMes(+e.target.value)}>
              {MESES.map((m,i) => <option key={i} value={i}>{m} {anio}</option>)}
            </select>
            <div className="area-toggle">
              {['FOH','BOH'].map(a => (
                <button key={a} className={`area-btn ${area===a?'active':''}`}
                  onClick={() => setArea(a)}>{a}</button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={handleValidar}>
              ⚡ Validar {alertas.length > 0 && <span className="alerta-count">{alertas.length}</span>}
            </button>
          </div>
        </div>

        <GrillaHorario
          colaboradores={colaboradoresFiltrados}
          dias={dias}
          turnos={turnos}
          asignaciones={asignaciones}
          diasEspeciales={diasEspeciales}
          onAsignar={setAsignacion}
          onEspecial={setEspecial}
          totalTrabajando={totalTrabajando}
          readonly={usuario.rol === 'LECTURA'}
        />

        {showAlertas && (
          <PanelAlertas alertas={alertas} onClose={() => setShowAlertas(false)} />
        )}
      </div>
    </>
  );
}
