// ── CONFIGURACIÓN ──────────────────────────────────────────
const FLOW_COLABORADORES = 'https://f80c9cc9e766e8a5bb5d42b2e1208a.e4.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/d7f2bc3ddc9f4386a0f582f5bd7d3641/triggers/manual/paths/invoke?api-version=1';

// Mock solo para datos que aún no tienen flujo
const LOCALES_MOCK = [
  { codigo: 'HOTEL',      nombre: 'Hotel',          area: 'MIXTO' },
  { codigo: 'RES',        nombre: 'Res',             area: 'MIXTO' },
  { codigo: 'L7',         nombre: 'Lucky 7',         area: 'MIXTO' },
  { codigo: 'PRIVE',      nombre: 'Privé',           area: 'MIXTO' },
  { codigo: 'JR',         nombre: 'Jhonny R',        area: 'MIXTO' },
  { codigo: 'DECALETA',   nombre: 'Decaleta',        area: 'MIXTO' },
  { codigo: 'LOLA_TAPAS', nombre: 'Lola Tapas',      area: 'MIXTO' },
  { codigo: 'OLIVERA',    nombre: 'Olivera',         area: 'MIXTO' },
  { codigo: 'BANQUETES',  nombre: 'Banquetes',       area: 'MIXTO' },
  { codigo: 'BOWLING',    nombre: 'Bowling',         area: 'FOH'   },
  { codigo: 'CAPATAZ',    nombre: 'Capataz',         area: 'MIXTO' },
  { codigo: 'BLACK_BAR',  nombre: 'Black Bar',       area: 'FOH'   },
  { codigo: 'FB_CASINO',  nombre: 'FB Casino',       area: 'FOH'   },
  { codigo: 'YANN',       nombre: 'Yann',            area: 'MIXTO' },
  { codigo: 'CONFERENCE', nombre: 'Conference',      area: 'FOH'   },
];

const TURNOS_MOCK = {
  HOTEL: [
    { id:1, codigo:'APERTURA',     hora_entrada:8,  hora_salida:16, duracion_hrs:8,  color_hex:'#FFFFFF' },
    { id:2, codigo:'APERTURA_10H', hora_entrada:8,  hora_salida:18, duracion_hrs:10, color_hex:'#FFFF00' },
    { id:3, codigo:'ALMUERZO',     hora_entrada:12, hora_salida:20, duracion_hrs:8,  color_hex:'#92D050' },
    { id:4, codigo:'TARDE',        hora_entrada:16, hora_salida:0,  duracion_hrs:8,  color_hex:'#FFFF00' },
    { id:5, codigo:'CENA',         hora_entrada:20, hora_salida:4,  duracion_hrs:8,  color_hex:'#92D050' },
    { id:6, codigo:'NOCHE',        hora_entrada:0,  hora_salida:8,  duracion_hrs:8,  color_hex:'#C5B4E3' },
  ]
};

const USUARIOS_MOCK = [
  { email: 'jecheverria@monticello.cl',          nombre: 'Jose Echeverria', rol: 'ADMIN',       local: null },
  { email: 'supervisor.hotel@monticello.cl',     nombre: 'Supervisor Hotel', rol: 'SUPERVISOR', local: 'HOTEL' },
  { email: 'lectura@monticello.cl',              nombre: 'Vista General',   rol: 'LECTURA',     local: null },
];

// ── API FUNCTIONS ──────────────────────────────────────────

export async function loginUsuario(email) {
  const u = USUARIOS_MOCK.find(x => x.email.toLowerCase() === email.toLowerCase());
  if (!u) throw new Error('Usuario no encontrado');
  return u;
}

export async function getLocales() {
  return LOCALES_MOCK;
}

export async function getTurnos(local) {
  return TURNOS_MOCK[local] || TURNOS_MOCK['HOTEL'];
}

export async function getColaboradores(local) {
  try {
    const response = await fetch(FLOW_COLABORADORES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ local: local })
    });

    if (!response.ok) throw new Error('Error en el flujo');

    const data = await response.json();

    // El flujo devuelve ResultSets con tabla1
    const rows = data?.Table1 || data?.table1 || data?.ResultSets?.Table1 || [];

    return rows.map(r => ({
      rut:           r.rut,
      nombre:        r.nombre,
      cargo:         r.cargo,
      jornada:       r.jornada,
      area:          r.area,
      empresa:       r.empresa,
      tipo_contrato: r.tipo_contrato,
    }));

  } catch (err) {
    console.error('Error cargando colaboradores:', err);
    // Fallback a mock si falla
    return [];
  }
}

export async function getPlantilla(local, anio, mes) {
  return [];
}

export async function savePlantilla(data) {
  console.log('Save plantilla (pendiente):', data);
  return { ok: true };
}

export async function getAlertas(local, anio, mes) {
  return [];
}

// ── VALIDACIÓN LEGAL ───────────────────────────────────────
export function validarHorario(colaboradores, asignaciones, diasEspeciales) {
  const alertas = [];

  colaboradores.forEach(colab => {
    const rut = colab.rut;
    const dias = Array.from({length: 31}, (_, i) => {
      const fecha = i + 1;
      const especial = diasEspeciales.find(d => d.rut === rut && d.dia === fecha);
      if (especial) return { tipo: 'especial', codigo: especial.tipo };
      const asig = asignaciones.find(a => a.rut === rut && a.dia === fecha);
      if (asig) return { tipo: 'trabajo', turno: asig.turno_codigo, entrada: asig.hora_entrada };
      return { tipo: 'vacio' };
    });

    // Regla: max 6 consecutivos
    let consec = 0, inicio = 1;
    dias.forEach((d, i) => {
      if (['9V','9L','B'].includes(d.codigo) || d.tipo === 'vacio') {
        consec = 0; inicio = i + 2;
      } else if (['X','DM','9C'].includes(d.codigo)) {
        consec = 0; inicio = i + 2;
      } else {
        consec++;
        if (consec === 7) alertas.push({
          rut, nombre: colab.nombre,
          tipo: 'DIAS_CONSECUTIVOS',
          descripcion: `7° día consecutivo trabajado (desde día ${inicio})`,
          dia: i + 1
        });
      }
    });

    // Regla: 2 DM en el mes
    const dms = diasEspeciales.filter(d => d.rut === rut && d.tipo === 'DM');
    if (dms.length < 2) alertas.push({
      rut, nombre: colab.nombre,
      tipo: 'SIN_DM_MES',
      descripcion: `Solo ${dms.length} domingo(s) libre(s) DM. Requiere 2.`,
      dia: null
    });

    // Regla: semanas sin 2 días libres
    for (let sem = 0; sem < 5; sem++) {
      const inicio_sem = sem * 7;
      const fin_sem = Math.min(inicio_sem + 7, 31);
      const dias_sem = dias.slice(inicio_sem, fin_sem);
      const trabajados = dias_sem.filter(d => d.tipo === 'trabajo').length;
      const libres = dias_sem.filter(d => ['X','DM','9C'].includes(d.codigo)).length;
      if (trabajados > 0 && libres < 2) alertas.push({
        rut, nombre: colab.nombre,
        tipo: 'SIN_DIA_LIBRE_SEMANAL',
        descripcion: `Semana ${sem+1}: solo ${libres} día(s) libre(s), trabaja ${trabajados} días`,
        dia: inicio_sem + 1
      });
    }
  });

  return alertas;
}
