const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'solicitudes.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Asegurar que exista la carpeta data y el archivo json
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  // Datos iniciales de demostración opcionales
  const initialData = [
    {
      id: "SOL-2026-001",
      nombre: "María Fernanda González",
      departamento: "Contabilidad y Finanzas",
      correo: "maria.gonzalez@empresa.com",
      telefono: "Ext. 204",
      puesto: "Jefa de Contabilidad",
      categoria: "Hardware",
      prioridad: "Alta",
      titulo: "Computadora lenta al procesar cierres de mes y facturación",
      descripcion: "El equipo actual cuenta con poca memoria RAM y tarda más de 20 minutos en abrir los libros contables y sistemas de facturación SAT. Se congela constantemente.",
      personasAfectadas: "Equipo (2 a 5 personas)",
      beneficioEsperado: "Reducir a la mitad el tiempo de timbrado y evitar retrasos en declaraciones fiscales.",
      estado: "En Análisis",
      notasTI: "Se evaluará aumento de memoria RAM a 16GB o reemplazo por equipo i5/Ryzen 5 con SSD.",
      fecha: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "SOL-2026-002",
      nombre: "Carlos Eduardo Méndez",
      departamento: "Ventas y Comercial",
      correo: "carlos.mendez@empresa.com",
      telefono: "Ext. 115",
      puesto: "Coordinador de Ventas",
      categoria: "Red y Comunicaciones",
      prioridad: "Crítica",
      titulo: "Mala señal de WiFi y desconexiones continuas en sala de juntas",
      descripcion: "Durante las videollamadas con clientes importantes la red se desconecta o la imagen se congela. El punto de acceso actual no cubre bien la sala de juntas principal.",
      personasAfectadas: "Todo el departamento",
      beneficioEsperado: "Garantizar reuniones fluidas con clientes y no perder presentaciones comerciales.",
      estado: "En Proceso",
      notasTI: "Se programó instalación de Access Point dedicado en la sala de juntas el próximo martes.",
      fecha: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: "SOL-2026-003",
      nombre: "Lucía Paredes",
      departamento: "Recursos Humanos",
      correo: "lucia.paredes@empresa.com",
      telefono: "Ext. 302",
      puesto: "Generalista de RH",
      categoria: "Automatización",
      prioridad: "Media",
      titulo: "Sistema para registro de incidencias y vacaciones de personal",
      descripcion: "Actualmente llevamos las solicitudes de vacaciones y permisos en hojas de papel y Excel compartido, lo que genera errores y traspapelado de documentos.",
      personasAfectadas: "Toda la empresa",
      beneficioEsperado: "Automatizar el flujo de aprobación digital de vacaciones para que jefes aprueben por correo o portal.",
      estado: "Pendiente",
      notasTI: "",
      fecha: new Date().toISOString()
    }
  ];
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
}

// Funciones auxiliares para leer y escribir
function getSolicitudes() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error al leer solicitudes:', error);
    return [];
  }
}

function saveSolicitudes(solicitudes) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(solicitudes, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error al guardar solicitudes:', error);
    return false;
  }
}

// Obtener IPs locales de la máquina
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Filtrar IPv4 y no internas (127.0.0.1)
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

// RUTAS API

// 1. Obtener todas las solicitudes
app.get('/api/solicitudes', (req, res) => {
  const solicitudes = getSolicitudes();
  res.json(solicitudes);
});

// 2. Registrar una nueva solicitud
app.post('/api/solicitudes', (req, res) => {
  const {
    nombre,
    departamento,
    correo,
    telefono,
    puesto,
    categoria,
    prioridad,
    titulo,
    descripcion,
    personasAfectadas,
    beneficioEsperado
  } = req.body;

  // Validar campos esenciales
  const textoNecesidad = (descripcion || titulo || '').trim();

  if (!nombre || !departamento || !textoNecesidad) {
    return res.status(400).json({ error: 'Por favor ingresa al menos tu nombre, departamento y lo que necesitas.' });
  }

  const solicitudes = getSolicitudes();
  const year = new Date().getFullYear();
  const nextNum = (solicitudes.length + 1).toString().padStart(3, '0');
  const id = `SOL-${year}-${nextNum}`;

  // Si no viene título explícito, creamos un extracto de lo que escribió
  const tituloFinal = (titulo && titulo.trim()) 
    ? titulo.trim() 
    : (textoNecesidad.length > 70 ? textoNecesidad.substring(0, 67) + '...' : textoNecesidad);

  const nuevaSolicitud = {
    id,
    nombre: nombre.trim(),
    departamento: departamento.trim(),
    correo: (correo || '').trim(),
    telefono: (telefono || '').trim(),
    puesto: (puesto || '').trim(),
    categoria: categoria || 'General',
    prioridad: prioridad || 'Media',
    titulo: tituloFinal,
    descripcion: textoNecesidad,
    personasAfectadas: personasAfectadas || 'No especificado',
    beneficioEsperado: (beneficioEsperado || '').trim(),
    estado: 'Pendiente',
    notasTI: '',
    fecha: new Date().toISOString()
  };

  solicitudes.unshift(nuevaSolicitud);
  if (saveSolicitudes(solicitudes)) {
    res.status(201).json({ success: true, solicitud: nuevaSolicitud });
  } else {
    res.status(500).json({ error: 'Error al guardar la solicitud en el servidor.' });
  }
});

// 3. Actualizar estado y notas de una solicitud
app.put('/api/solicitudes/:id', (req, res) => {
  const { id } = req.params;
  const { estado, notasTI, prioridad } = req.body;
  const solicitudes = getSolicitudes();
  const index = solicitudes.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(400).json({ error: 'Solicitud no encontrada.' });
  }

  if (estado !== undefined) solicitudes[index].estado = estado;
  if (notasTI !== undefined) solicitudes[index].notasTI = notasTI;
  if (prioridad !== undefined) solicitudes[index].prioridad = prioridad;

  if (saveSolicitudes(solicitudes)) {
    res.json({ success: true, solicitud: solicitudes[index] });
  } else {
    res.status(500).json({ error: 'Error al actualizar la solicitud.' });
  }
});

// 4. Eliminar una solicitud
app.delete('/api/solicitudes/:id', (req, res) => {
  const { id } = req.params;
  let solicitudes = getSolicitudes();
  const initialLength = solicitudes.length;
  solicitudes = solicitudes.filter(s => s.id !== id);

  if (solicitudes.length === initialLength) {
    return res.status(404).json({ error: 'Solicitud no encontrada.' });
  }

  if (saveSolicitudes(solicitudes)) {
    res.json({ success: true, message: 'Solicitud eliminada con éxito.' });
  } else {
    res.status(500).json({ error: 'Error al eliminar la solicitud.' });
  }
});

// 5. Información del servidor e IPs de red
app.get('/api/info', (req, res) => {
  const localIPs = getLocalIPs();
  res.json({
    port: PORT,
    localIPs,
    shareUrls: localIPs.map(ip => `http://${ip}:${PORT}`),
    localhostUrl: `http://localhost:${PORT}`
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Sistema de Detección de Necesidades de Sistemas (TI)`);
  console.log(`=======================================================`);
  console.log(`Acceso Local:        http://localhost:${PORT}`);
  const ips = getLocalIPs();
  if (ips.length > 0) {
    console.log(`Acceso en Red (LAN): http://${ips[0]}:${PORT}`);
    console.log(`(Comparte este enlace a los otros departamentos)`);
  }
  console.log(`Panel de TI (Admin): http://localhost:${PORT}/admin.html`);
  console.log(`=======================================================`);
});
