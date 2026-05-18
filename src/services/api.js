// ── CONFIGURACIÓN ──────────────────────────────────────────
// Reemplaza con tu connection string de Azure SQL
const API_BASE = process.env.REACT_APP_API_URL || '';

// Simulación local para desarrollo (sin backend aún)
const MOCK = true;

// ── DATOS MOCK ─────────────────────────────────────────────
const USUARIOS_MOCK = [
  { email: 'jecheverria@monticello.cl', nombre: 'Administrador', rol: 'ADMIN',       local: null },
  { email: 'supervisor.hotel@monticello.cl', nombre: 'Supervisor Hotel', rol: 'SUPERVISOR', local: 'HOTEL' },
  { email: 'lectura@monticello.cl',    nombre: 'Vista General', rol: 'LECTURA',     local: null },
];

const LOCALES_MOCK = [
  { codigo: 'HOTEL',     nombre: 'Hotel',          area: 'MIXTO' },
  { codigo: 'RES',       nombre: 'Res',             area: 'MIXTO' },
  { codigo: 'L7',        nombre: 'Lucky 7',         area: 'MIXTO' },
  { codigo: 'PRIVE',     nombre: 'Privé',           area: 'MIXTO' },
  { codigo: 'JR',        nombre: 'Jhonny R',        area: 'MIXTO' },
  { codigo: 'DECALETA',  nombre: 'Decaleta',        area: 'MIXTO' },
  { codigo: 'LOLA_TAPAS',nombre: 'Lola Tapas',      area: 'MIXTO' },
  { codigo: 'OLIVERA',   nombre: 'Olivera',         area: 'MIXTO' },
  { codigo: 'BANQUETES', nombre: 'Banquetes',       area: 'MIXTO' },
  { codigo: 'BOWLING',   nombre: 'Bowling',         area: 'FOH'   },
  { codigo: 'CAPATAZ',   nombre: 'Capataz',         area: 'MIXTO' },
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

const COLABORADORES_MOCK = {
  HOTEL: [
    { rut:'19276240-5', nombre:'ARRIAGADA ALIAGA ANDREA',    cargo:'GARZON',    jornada:'Full Time',   area:'FOH', empresa:'GPO' },
    { rut:'13597456-0', nombre:'AVILES RAMIREZ MARGARITA',   cargo:'GARZON',    jornada:'Full Time',   area:'FOH', empresa:'GPO' },
    { rut:'16230410-0', nombre:'CONTRERAS BARRERA ELIZABETH',cargo:'GARZON',    jornada:'Full Time',   area:'FOH', empresa:'GPO' },
    { rut:'18320756-3', nombre:'CURAQUEO CARES KAREN',       cargo:'GARZON',    jornada:'Full Time',   area:'FOH', empresa:'GPO' },
    { rut:'19852348-8', nombre:'CURIHUAN VERGARA TANIA',     cargo:'GARZON',    jornada:'Full Time',   area:'FOH', empresa:'GPO' },
    { rut:'19308385-4', nombre:'FUENTES ARELLANO CLAUDIA',   cargo:'GARZON',    jornada:'Full Time',   area:'FOH', empresa:'GPO' },
    { rut:'21456019-4', nombre:'GALVEZ CANIO JAVIERA',       cargo:'GARZON',    jornada:'Full Time',   area:'FOH', empresa:'GPO' },
    { rut:'19565514-6', nombre:'GARRIDO HIGUERA GENESIS',    cargo:'GARZON',    jornada:'Full Time',   area:'FOH', empresa:'GPO' },
    { rut:'20371405-k', nombre:'GONZALEZ LEIVA NASLY',       cargo:'GARZON',    jornada:'Full Time',   area:'FOH', empresa:'GPO' },
    { rut:'20658571-4', nombre:'ORTIZ DIAZ EMA ALEXANDRA',   cargo:'GARZON',    jornada:'Full Time',   area:'FOH', empresa:'GPO' },
    { rut:'19265465-3', nombre:'ROJAS BASUALTO GUILLERMO',   cargo:'GARZON',    jornada:'Full Time',   area:'FOH', empresa:'GPO' },
    { rut:'19850467-k', nombre:'VEGAS RIVERA FRANCISCA',     cargo:'GARZON',    jornada:'Full Time',   area:'FOH', empresa:'GPO' },
    { rut:'13889975-6', nombre:'Vega Carrillo Angel Enrique',cargo:'GARZON',    jornada:'Full Time',   area:'FOH', empresa:'MONTICELLO' },
    { rut:'16563022-K', nombre:'Contreras Diaz Cynilia',     cargo:'SUPERVISOR',jornada:'Full Time',   area:'FOH', empresa:'MONTICELLO' },
    { rut:'15123555-7', nombre:'ALVAREZ QUEZADA LORENA',     cargo:'GARZON',    jornada:'Part Time 20',area:'FOH', empresa:'GPO' },
    { rut:'21934653-0', nombre:'MUNOZ MUNOZ VICENTE',        cargo:'GARZON',    jornada:'Part Time 20',area:'FOH', empresa:'GPO' },
    { rut:'17312711-1', nombre:'Fredes Peñaloza Felipe',     cargo:'SOUS CHEF', jornada:'Full Time',   area:'BOH', empresa:'MONTICELLO' },
    { rut:'13342779-1', nombre:'Valdivia Herrera Susana',    cargo:'DEMI CHEF', jornada:'Full Time',   area:'BOH', empresa:'MONTICELLO' },
    { rut:'17716893-9', nombre:'FUENTES GONZALEZ TERESA',    cargo:'DEMI CHEF', jornada:'Full Time',   area:'BOH', empresa:'GPO' },
    { rut:'13301985-5', nombre:'Vargas Soto Luis Hernan',    cargo:'CHEF DE PARTIE',jornada:'Full Time',area:'BOH',empresa:'MONTICELLO' },
  ]
};

// ── API FUNCTIONS ──────────────────────────────────────────
export async function loginUsuario(email) {
  if (MOCK) {
    const u = USUARIOS_MOCK.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) throw new Error('Usuario no encontrado');
    return u;
  }
  const r = await fetch(`${API_BASE}/api/usuarios/${email}`);
  if (!r.ok) throw new Error('Error al autenticar');
  return r.json();
}

export async function getLocales() {
  if (MOCK) return LOCALES_MOCK;
  const r = await fetch(`${API_BASE}/api/locales`);
  return r.json();
}

export async function getTurnos(local) {
  if (MOCK) return TURNOS_MOCK[local] || [];
  const r = await fetch(`${API_BASE}/api/turnos/${local}`);
  return r.json();
}

export async function getColaboradores(local) {
  if (MOCK) return COLABORADORES_MOCK[local] || [];
  const r = await fetch(`${API_BASE}/api/colaboradores/${local}`);
  return r.json();
}

export async function getPlantilla(local, anio, mes) {
  if (MOCK) return [];
  const r = await fetch(`${API_BASE}/api/plantilla/${local}/${anio}/${mes}`);
  return r.json();
}

export async function savePlantilla(data) {
  if (MOCK) { console.log('MOCK save plantilla', data); return { ok: true }; }
  const r = await fetch(`${API_BASE}/api/plantilla`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

export async function getAlertas(local, anio, mes) {
  if (MOCK) return [];
  const r = await fetch(`${API_BASE}/api/alertas/${local}/${anio}/${mes}`);
  return r.json();
}

// ── VALIDACIÓN LEGAL (sin backend) ────────────────────────
export function validarHorario(colaboradores, asignaciones, diasEspeciales) {
  const alertas = [];

  colaboradores.forEach(colab => {
    const rut = colab.rut;
    // Construir array de 31 días
    const dias = Array.from({length: 31}, (_, i) => {
      const fecha = i + 1;
      const especial = diasEspeciales.find(d => d.rut === rut && d.dia === fecha);
      if (especial) return { tipo: 'especial', codigo: especial.tipo };
      const asig = asignaciones.find(a => a.rut === rut && a.dia === fecha);
      if (asig) return { tipo: 'trabajo', turno: asig.turno_codigo, entrada: asig.hora_entrada };
      return { tipo: 'vacio' };
    });

    // Regla: max 6 consecutivos
    let consec = 0, inicio = 0;
    dias.forEach((d, i) => {
      if (['9V','9L','B'].includes(d.codigo) || d.tipo === 'vacio') {
        consec = 0; inicio = i + 1;
      } else if (d.codigo === 'X' || d.codigo === 'DM' || d.codigo === '9C') {
        consec = 0; inicio = i + 1;
      } else {
        consec++;
        if (consec === 7) alertas.push({
          rut, nombre: colab.nombre,
          tipo: 'DIAS_CONSECUTIVOS',
          descripcion: `7° día consecutivo trabajado (desde día ${inicio + 1})`,
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
  });

  return alertas;
}
