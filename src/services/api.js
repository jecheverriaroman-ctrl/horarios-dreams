// ── CONFIGURACIÓN SHAREPOINT ───────────────────────────────
const SP_SITE = 'https://dreamscl.sharepoint.com/sites/GPOAABB';
const SP_LIST = 'Colaboradores_Horarios';

// ── DATOS MOCK (turnos y locales — aún no en SharePoint) ───
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
  { email: 'jecheverria@monticello.cl',      nombre: 'Jose Echeverria', rol: 'ADMIN',      local: null },
  { email: 'supervisor.hotel@monticello.cl', nombre: 'Supervisor Hotel',rol: 'SUPERVISOR', local: 'HOTEL' },
  { email: 'lectura@monticello.cl',          nombre: 'Vista General',   rol: 'LECTURA',    local: null },
];

// ── SHAREPOINT REST API ────────────────────────────────────
async function fetchSharePoint(url) {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json;odata=verbose',
      'Content-Type': 'application/json;odata=verbose',
    },
    credentials: 'include', // usa las credenciales de Microsoft del navegador
  });
  if (!response.ok) throw new Error(`SharePoint error: ${response.status}`);
  const data = await response.json();
  return data?.d?.results || data?.d || data;
}

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
    const url = `${SP_SITE}/_api/web/lists/getbytitle('${SP_LIST}')/items`
      + `?$select=Title,RUT,Local,Cargo,Jornada,Area,Empresa,TipoContrato,Bloqueado`
      + `&$filter=Local eq '${local}' and Activo eq 1 and Bloqueado eq 0`
      + `&$top=500`
      + `&$orderby=Area,Cargo,Title`;

    const items = await fetchSharePoint(url);

    return items.map(item => ({
      rut:           item.RUT,
      nombre:        item.Title,
      cargo:         item.Cargo,
      jornada:       item.Jornada,
      area:          item.Area,
      empresa:       item.Empresa,
      tipo_contrato: item.TipoContrato,
    }));

  } catch (err) {
    console.error('Error cargando colaboradores desde SharePoint:', err);
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
      const ini = sem * 7;
      const fin = Math.min(ini + 7, 31);
      const ds = dias.slice(ini, fin);
      const trabajados = ds.filter(d => d.tipo === 'trabajo').length;
      const libres = ds.filter(d => ['X','DM','9C'].includes(d.codigo)).length;
      if (trabajados > 0 && libres < 2) alertas.push({
        rut, nombre: colab.nombre,
        tipo: 'SIN_DIA_LIBRE_SEMANAL',
        descripcion: `Semana ${sem+1}: solo ${libres} día(s) libre(s), trabaja ${trabajados} días`,
        dia: ini + 1
      });
    }
  });

  return alertas;
}
