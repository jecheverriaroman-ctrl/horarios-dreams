import React from 'react';
import './PanelAlertas.css';

const TIPO_CONFIG = {
  DIAS_CONSECUTIVOS:   { label:'Días consecutivos', color:'var(--danger)',  icon:'🔴' },
  SIN_DM_MES:          { label:'Sin DM en el mes',  color:'var(--accent2)', icon:'🟠' },
  LIBRE_FALSO:         { label:'Libre falso',        color:'var(--warning)', icon:'🟡' },
  SIN_DIA_LIBRE_SEMANAL:{ label:'Sin día libre semanal', color:'var(--warning)', icon:'🟡' },
};

export default function PanelAlertas({ alertas, onClose }) {
  const tipos = [...new Set(alertas.map(a => a.tipo))];

  return (
    <div className="alertas-overlay" onClick={onClose}>
      <div className="alertas-panel" onClick={e => e.stopPropagation()}>
        <div className="alertas-header">
          <div>
            <h3 className="alertas-title">⚡ Validación Legal</h3>
            <p className="alertas-sub">Código del Trabajo — Chile</p>
          </div>
          <button className="btn btn-secondary alertas-close" onClick={onClose}>✕</button>
        </div>

        {alertas.length === 0 ? (
          <div className="alertas-ok">
            <div className="alertas-ok-icon">✓</div>
            <div>El horario cumple con la normativa laboral vigente</div>
          </div>
        ) : (
          <>
            <div className="alertas-resumen">
              {tipos.map(t => {
                const cfg = TIPO_CONFIG[t] || { label: t, color: 'var(--text2)', icon: '⚠️' };
                const count = alertas.filter(a => a.tipo === t).length;
                return (
                  <div key={t} className="resumen-chip" style={{borderColor: cfg.color}}>
                    <span>{cfg.icon}</span>
                    <span style={{color: cfg.color, fontWeight:600}}>{count}</span>
                    <span className="resumen-label">{cfg.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="alertas-list">
              {alertas.map((a, i) => {
                const cfg = TIPO_CONFIG[a.tipo] || { label: a.tipo, color: 'var(--text2)', icon: '⚠️' };
                return (
                  <div key={i} className="alerta-item" style={{borderLeftColor: cfg.color}}>
                    <div className="alerta-item-header">
                      <span className="alerta-nombre">{a.nombre}</span>
                      <span className="alerta-tipo-badge" style={{color: cfg.color, borderColor: cfg.color}}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <div className="alerta-desc">{a.descripcion}</div>
                    {a.dia && <div className="alerta-dia">Día {a.dia} del mes</div>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
