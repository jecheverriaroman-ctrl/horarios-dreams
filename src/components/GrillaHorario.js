import React, { useState } from 'react';
import './GrillaHorario.css';

const ESPECIALES = ['X','DM','9C','9V','9L','B'];

const COLOR_TURNO = {
  'APERTURA':     { bg:'#1a1a1a', color:'#e8f0f8', border:'#3a3a3a' },
  'APERTURA_10H': { bg:'#3a3a00', color:'#FFFF00', border:'#666600' },
  'ALMUERZO':     { bg:'#1a3300', color:'#92D050', border:'#336600' },
  'TARDE':        { bg:'#3a3a00', color:'#FFFF00', border:'#666600' },
  'CENA':         { bg:'#1a3300', color:'#92D050', border:'#336600' },
  'NOCHE':        { bg:'#1e1330', color:'#C5B4E3', border:'#3d2a66' },
  'X':            { bg:'#1a1a1a', color:'#555',    border:'#333'    },
  'DM':           { bg:'#0d1f2d', color:'#7ab8d4', border:'#1a3d52' },
  '9C':           { bg:'#2d0000', color:'#ff6b6b', border:'#660000' },
  '9V':           { bg:'#2d1a00', color:'#FFC000', border:'#664400' },
  '9L':           { bg:'#2d0033', color:'#ff99ff', border:'#660066' },
  'B':            { bg:'#111',    color:'#444',    border:'#222'    },
};

function getHoraLabel(turno) {
  if (!turno) return '';
  const map = {
    'APERTURA':'8','APERTURA_10H':'8*','ALMUERZO':'12',
    'TARDE':'16','CENA':'20','NOCHE':'24'
  };
  return map[turno.codigo] || turno.hora_entrada;
}

export default function GrillaHorario({
  colaboradores, dias, turnos, asignaciones, diasEspeciales,
  onAsignar, onEspecial, totalTrabajando, readonly
}) {
  const [menu, setMenu] = useState(null); // {rut, dia, x, y}

  const getValor = (rut, dia) => {
    const esp = diasEspeciales[`${rut}_${dia}`];
    if (esp) return esp;
    const asig = asignaciones[`${rut}_${dia}`];
    return asig || null;
  };

  const getStyle = (valor) => {
    if (!valor) return {};
    const c = COLOR_TURNO[valor] || COLOR_TURNO['APERTURA'];
    return { background: c.bg, color: c.color, borderColor: c.border };
  };

  const handleCellClick = (e, rut, dia) => {
    if (readonly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMenu({ rut, dia, x: rect.left, y: rect.bottom + window.scrollY });
  };

  const handleSelect = (valor) => {
    if (!menu) return;
    if (ESPECIALES.includes(valor)) {
      onEspecial(menu.rut, menu.dia, valor);
      // limpiar asignacion si habia
      onAsignar(menu.rut, menu.dia, null);
    } else {
      onAsignar(menu.rut, menu.dia, valor);
      onEspecial(menu.rut, menu.dia, null);
    }
    setMenu(null);
  };

  const handleClear = () => {
    if (!menu) return;
    onAsignar(menu.rut, menu.dia, null);
    onEspecial(menu.rut, menu.dia, null);
    setMenu(null);
  };

  return (
    <div className="grilla-wrapper" onClick={() => setMenu(null)}>
      <div className="grilla-scroll">
        <table className="grilla-table">
          <thead>
            <tr>
              <th className="th-nombre">Nombre</th>
              <th className="th-cargo">Cargo</th>
              <th className="th-jornada">Jornada</th>
              {dias.map(d => (
                <th key={d.num}
                  className={`th-dia ${d.dow === 'Do' ? 'dia-domingo' : ''}`}>
                  <div className="th-dia-num">{d.num}</div>
                  <div className="th-dia-dow">{d.dow}</div>
                </th>
              ))}
              <th className="th-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {/* Fila totales por día */}
            <tr className="tr-totales">
              <td colSpan={3} className="td-totales-label">Personas trabajando</td>
              {dias.map(d => (
                <td key={d.num} className="td-total-dia">
                  <span>{totalTrabajando(d.num) || ''}</span>
                </td>
              ))}
              <td />
            </tr>

            {colaboradores.map((c, idx) => {
              const diasTrabajados = dias.filter(d => {
                const v = getValor(c.rut, d.num);
                return v && !['X','DM','9V','9L','B'].includes(v);
              }).length;

              return (
                <tr key={c.rut} className={idx % 2 === 0 ? 'tr-par' : 'tr-impar'}>
                  <td className="td-nombre">{c.nombre}</td>
                  <td className="td-cargo">{c.cargo}</td>
                  <td className="td-jornada">
                    <span className={`jornada-badge ${c.jornada === 'Full Time' ? 'ft' : 'pt'}`}>
                      {c.jornada === 'Full Time' ? 'FT' : 'PT'}
                    </span>
                  </td>
                  {dias.map(d => {
                    const valor = getValor(c.rut, d.num);
                    const style = getStyle(valor);
                    return (
                      <td key={d.num}
                        className={`td-cell ${d.dow==='Do'?'dia-domingo':''} ${!readonly?'clickable':''}`}
                        style={style}
                        onClick={(e) => { e.stopPropagation(); handleCellClick(e, c.rut, d.num); }}>
                        {valor ? (
                          ESPECIALES.includes(valor)
                            ? <span className="cell-especial">{valor}</span>
                            : <span className="cell-hora">
                                {getHoraLabel(turnos.find(t=>t.codigo===valor))}
                              </span>
                        ) : null}
                      </td>
                    );
                  })}
                  <td className="td-total-col">
                    <span className={diasTrabajados > 25 ? 'warn' : ''}>{diasTrabajados}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Menú contextual */}
      {menu && (
        <div className="cell-menu" style={{ top: menu.y, left: Math.min(menu.x, window.innerWidth - 220) }}
          onClick={e => e.stopPropagation()}>
          <div className="cell-menu-section">Turnos</div>
          {turnos.map(t => (
            <button key={t.codigo} className="cell-menu-item turno-item"
              style={getStyle(t.codigo)}
              onClick={() => handleSelect(t.codigo)}>
              <span className="menu-hora">{t.hora_entrada}:00</span>
              <span className="menu-nombre">{t.codigo.replace('_',' ')}</span>
              <span className="menu-dur">{t.duracion_hrs}h</span>
            </button>
          ))}
          <div className="cell-menu-section">Especiales</div>
          {ESPECIALES.map(e => (
            <button key={e} className="cell-menu-item especial-item"
              style={getStyle(e)}
              onClick={() => handleSelect(e)}>{e}</button>
          ))}
          <button className="cell-menu-item clear-item" onClick={handleClear}>
            ✕ Limpiar
          </button>
        </div>
      )}
    </div>
  );
}
