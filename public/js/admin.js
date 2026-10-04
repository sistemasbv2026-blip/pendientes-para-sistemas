// Lógica del Panel de Control de TI / Dashboard

let allSolicitudes = [];
let currentSolicitudId = null;
let chartDeptInstance = null;
let chartCatInstance = null;
let currentShareUrl = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

// Inicialización de la aplicación
async function initApp() {
  await loadServerInfo();
  await loadSolicitudes();
}

// Cargar información de la red para compartir
async function loadServerInfo() {
  const shareableUrlSpan = document.getElementById('shareableUrl');
  try {
    const res = await fetch('/api/info');
    if (res.ok) {
      const info = await res.json();
      if (info.shareUrls && info.shareUrls.length > 0) {
        currentShareUrl = info.shareUrls[0];
      } else {
        currentShareUrl = info.localhostUrl;
      }
    }
  } catch (err) {
    console.warn('Servidor API no disponible para info, usando URL actual:', err);
    currentShareUrl = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
  }

  // Si se está abriendo desde un túnel público o dominio web externo, usar ese enlace directamente
  if (window.location.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
    currentShareUrl = window.location.origin;
  }

  if (shareableUrlSpan) {
    shareableUrlSpan.textContent = currentShareUrl;
  }
}

// Cargar solicitudes desde el servidor o localStorage
async function loadSolicitudes() {
  try {
    const res = await fetch('/api/solicitudes');
    if (res.ok) {
      allSolicitudes = await res.json();
    } else {
      throw new Error('No se pudo obtener datos del servidor');
    }
  } catch (err) {
    console.warn('Cargando desde localStorage como respaldo:', err);
    allSolicitudes = JSON.parse(localStorage.getItem('solicitudes_ti') || '[]');
  }

  populateDepartmentFilter();
  updateKPIs();
  updateCharts();
  renderTable();
}

// Poblar selector de departamentos dinámicamente
function populateDepartmentFilter() {
  const filterDept = document.getElementById('filterDept');
  const depts = new Set([
    "Recursos Humanos", "Finanzas", "Mantenimiento", "Front Desk",
    "Reservas", "Eventos", "Banquetes", "Cocina", "Criollo",
    "Tai Kai", "Faro", "Chiringuito", "Duna", "Puntarena",
    "Mansa", "BV Food Service", "Housekeeping", "Seguridad", "Golf"
  ]);
  allSolicitudes.forEach(s => {
    if (s.departamento) depts.add(s.departamento);
  });

  // Guardar valor actual
  const currentVal = filterDept.value;
  filterDept.innerHTML = `<option value="">Todos los Departamentos</option>`;

  Array.from(depts).sort().forEach(dept => {
    const opt = document.createElement('option');
    opt.value = dept;
    opt.textContent = dept;
    filterDept.appendChild(opt);
  });

  filterDept.value = currentVal;
}

// Actualizar tarjetas de KPI
function updateKPIs() {
  const total = allSolicitudes.length;
  const criticas = allSolicitudes.filter(s => s.prioridad === 'Crítica').length;
  const enProceso = allSolicitudes.filter(s => s.estado === 'En Análisis' || s.estado === 'En Proceso').length;
  const resueltas = allSolicitudes.filter(s => s.estado === 'Resuelto').length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statCriticas').textContent = criticas;
  document.getElementById('statEnProceso').textContent = enProceso;
  document.getElementById('statResueltas').textContent = resueltas;
}

// Configurar gráficas con Chart.js
function updateCharts() {
  // 1. Conteo por departamento
  const deptCounts = {};
  allSolicitudes.forEach(s => {
    deptCounts[s.departamento] = (deptCounts[s.departamento] || 0) + 1;
  });

  const deptLabels = Object.keys(deptCounts);
  const deptData = Object.values(deptCounts);

  const ctxDept = document.getElementById('chartDept').getContext('2d');
  if (chartDeptInstance) chartDeptInstance.destroy();

  chartDeptInstance = new Chart(ctxDept, {
    type: 'bar',
    data: {
      labels: deptLabels.length ? deptLabels : ['Sin registros'],
      datasets: [{
        label: 'Solicitudes',
        data: deptData.length ? deptData : [0],
        backgroundColor: '#3b82f6',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 }
        },
        x: {
          ticks: { maxRotation: 45, minRotation: 0, font: { size: 10 } }
        }
      }
    }
  });

  // 2. Conteo por categoría
  const catCounts = {};
  allSolicitudes.forEach(s => {
    catCounts[s.categoria] = (catCounts[s.categoria] || 0) + 1;
  });

  const catLabels = Object.keys(catCounts);
  const catData = Object.values(catCounts);

  const ctxCat = document.getElementById('chartCat').getContext('2d');
  if (chartCatInstance) chartCatInstance.destroy();

  chartCatInstance = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: catLabels.length ? catLabels : ['Sin registros'],
      datasets: [{
        data: catData.length ? catData : [1],
        backgroundColor: [
          '#2563eb', // Hardware
          '#06b6d4', // Software
          '#10b981', // Red
          '#8b5cf6', // Automatización
          '#f59e0b', // Seguridad
          '#ec4899'  // Capacitación
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, font: { size: 10 } }
        }
      }
    }
  });
}

// Renderizar tabla con filtros aplicados
function renderTable() {
  const tableBody = document.getElementById('tableBody');
  const emptyMessage = document.getElementById('emptyMessage');

  const searchText = document.getElementById('searchInput').value.toLowerCase().trim();
  const filterDept = document.getElementById('filterDept').value;
  const filterCat = document.getElementById('filterCat').value;
  const filterPriority = document.getElementById('filterPriority').value;
  const filterStatus = document.getElementById('filterStatus').value;

  const filtered = allSolicitudes.filter(s => {
    const matchSearch = !searchText ||
      (s.nombre && s.nombre.toLowerCase().includes(searchText)) ||
      (s.id && s.id.toLowerCase().includes(searchText)) ||
      (s.titulo && s.titulo.toLowerCase().includes(searchText)) ||
      (s.departamento && s.departamento.toLowerCase().includes(searchText)) ||
      (s.descripcion && s.descripcion.toLowerCase().includes(searchText));

    const matchDept = !filterDept || s.departamento === filterDept;
    const matchCat = !filterCat || s.categoria === filterCat;
    const matchPriority = !filterPriority || s.prioridad === filterPriority;
    const matchStatus = !filterStatus || s.estado === filterStatus;

    return matchSearch && matchDept && matchCat && matchPriority && matchStatus;
  });

  tableBody.innerHTML = '';

  if (filtered.length === 0) {
    emptyMessage.classList.remove('hidden');
    return;
  }
  emptyMessage.classList.add('hidden');

  filtered.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100 cursor-pointer';
    tr.onclick = (e) => {
      // Evitar abrir si clickean un botón de acción
      if (!e.target.closest('button')) {
        openDetailModal(item.id);
      }
    };

    // Formato de fecha
    const fechaObj = new Date(item.fecha);
    const fechaFormat = isNaN(fechaObj.getTime()) ? '-' : fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

    // Badge Prioridad
    const priorityBadge = getPriorityBadge(item.prioridad);
    // Badge Estado
    const statusBadge = getStatusBadge(item.estado);

    tr.innerHTML = `
      <td class="py-3 px-4 font-mono font-bold text-blue-600">${item.id}</td>
      <td class="py-3 px-4 text-slate-500 whitespace-nowrap">${fechaFormat}</td>
      <td class="py-3 px-4">
        <div class="font-semibold text-slate-900">${escapeHtml(item.nombre)}</div>
        <div class="text-[10px] text-slate-400">${escapeHtml(item.puesto || '')}</div>
      </td>
      <td class="py-3 px-4 font-medium text-slate-700">${escapeHtml(item.departamento)}</td>
      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-medium">${escapeHtml(item.categoria)}</span></td>
      <td class="py-3 px-4 max-w-xs truncate font-medium text-slate-900" title="${escapeHtml(item.titulo)}">
        ${escapeHtml(item.titulo)}
      </td>
      <td class="py-3 px-4 whitespace-nowrap">${priorityBadge}</td>
      <td class="py-3 px-4 whitespace-nowrap">${statusBadge}</td>
      <td class="py-3 px-4 text-center whitespace-nowrap">
        <button onclick="openDetailModal('${item.id}')" class="px-2.5 py-1 text-xs rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition">
          Ver / Gestionar
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// Generador de insignias de prioridad
function getPriorityBadge(prioridad) {
  switch (prioridad) {
    case 'Crítica':
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Crítica</span>`;
    case 'Alta':
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800"><span class="w-1.5 h-1.5 rounded-full bg-orange-600"></span>Alta</span>`;
    case 'Media':
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800"><span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>Media</span>`;
    case 'Baja':
    default:
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>Baja</span>`;
  }
}

// Generador de insignias de estado
function getStatusBadge(estado) {
  switch (estado) {
    case 'Resuelto':
      return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Resuelto</span>`;
    case 'En Proceso':
      return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">En Proceso</span>`;
    case 'Aprobado':
      return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Aprobado</span>`;
    case 'En Análisis':
      return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">En Análisis</span>`;
    case 'Rechazado':
      return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Rechazado</span>`;
    case 'Pendiente':
    default:
      return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">Pendiente</span>`;
  }
}

// Abrir modal de detalles y gestión
function openDetailModal(id) {
  const item = allSolicitudes.find(s => s.id === id);
  if (!item) return;

  currentSolicitudId = id;
  document.getElementById('modalFolio').textContent = item.id;
  document.getElementById('modalNombre').textContent = item.nombre || '-';
  document.getElementById('modalDept').textContent = item.departamento || '-';
  document.getElementById('modalPuesto').textContent = item.puesto || '-';
  
  const emailEl = document.getElementById('modalCorreo');
  emailEl.textContent = item.correo || 'No especificado';
  emailEl.href = item.correo ? `mailto:${item.correo}` : '#';

  document.getElementById('modalTelefono').textContent = item.telefono || 'No especificado';

  const fechaObj = new Date(item.fecha);
  document.getElementById('modalFecha').textContent = isNaN(fechaObj.getTime()) ? '-' : fechaObj.toLocaleString('es-ES');

  document.getElementById('modalCategoria').textContent = item.categoria || '-';
  document.getElementById('modalTitulo').textContent = item.titulo || '-';
  document.getElementById('modalDescripcion').textContent = item.descripcion || '-';
  document.getElementById('modalPersonas').textContent = item.personasAfectadas || 'No especificado';
  document.getElementById('modalBeneficio').textContent = item.beneficioEsperado || 'No especificado';

  document.getElementById('modalSelectEstado').value = item.estado || 'Pendiente';
  document.getElementById('modalSelectPrioridad').value = item.prioridad || 'Baja';
  document.getElementById('modalNotasTI').value = item.notasTI || '';

  document.getElementById('detailModal').classList.remove('hidden');
}

// Cerrar modal
function closeDetailModal() {
  document.getElementById('detailModal').classList.add('hidden');
  currentSolicitudId = null;
}

// Guardar cambios en la solicitud actual
async function saveSolicitudChanges() {
  if (!currentSolicitudId) return;

  const nuevoEstado = document.getElementById('modalSelectEstado').value;
  const nuevaPrioridad = document.getElementById('modalSelectPrioridad').value;
  const nuevasNotas = document.getElementById('modalNotasTI').value.trim();

  try {
    const res = await fetch(`/api/solicitudes/${currentSolicitudId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado: nuevoEstado,
        prioridad: nuevaPrioridad,
        notasTI: nuevasNotas
      })
    });

    if (res.ok) {
      // Actualizar en memoria local
      const idx = allSolicitudes.findIndex(s => s.id === currentSolicitudId);
      if (idx !== -1) {
        allSolicitudes[idx].estado = nuevoEstado;
        allSolicitudes[idx].prioridad = nuevaPrioridad;
        allSolicitudes[idx].notasTI = nuevasNotas;
      }
    } else {
      throw new Error('Error al actualizar en servidor');
    }
  } catch (err) {
    console.warn('Actualizando localmente:', err);
    const idx = allSolicitudes.findIndex(s => s.id === currentSolicitudId);
    if (idx !== -1) {
      allSolicitudes[idx].estado = nuevoEstado;
      allSolicitudes[idx].prioridad = nuevaPrioridad;
      allSolicitudes[idx].notasTI = nuevasNotas;
      localStorage.setItem('solicitudes_ti', JSON.stringify(allSolicitudes));
    }
  }

  closeDetailModal();
  updateKPIs();
  updateCharts();
  renderTable();
}

// Eliminar solicitud
async function deleteCurrentSolicitud() {
  if (!currentSolicitudId) return;

  if (!confirm(`¿Estás seguro de que deseas eliminar la solicitud con folio ${currentSolicitudId}? Esta acción no se puede deshacer.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/solicitudes/${currentSolicitudId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error al eliminar en servidor');
  } catch (err) {
    console.warn('Eliminando localmente:', err);
  }

  allSolicitudes = allSolicitudes.filter(s => s.id !== currentSolicitudId);
  localStorage.setItem('solicitudes_ti', JSON.stringify(allSolicitudes));

  closeDetailModal();
  populateDepartmentFilter();
  updateKPIs();
  updateCharts();
  renderTable();
}

// Exportar a Excel utilizando SheetJS
function exportToExcel() {
  if (allSolicitudes.length === 0) {
    alert('No hay solicitudes registradas para exportar.');
    return;
  }

  // Mapear a un formato claro para Excel
  const dataExport = allSolicitudes.map(s => ({
    'Folio': s.id,
    'Fecha': new Date(s.fecha).toLocaleString('es-ES'),
    'Departamento': s.departamento,
    'Solicitante': s.nombre,
    'Contacto (Teléfono / Correo)': s.telefono || s.correo || '',
    'Lo que Necesita el Departamento': s.descripcion || s.titulo || '',
    'Beneficio Esperado / Impacto': s.beneficioEsperado || '',
    'Urgencia': s.prioridad || 'Media',
    'Estado Actual': s.estado || 'Pendiente',
    'Notas y Seguimiento de TI': s.notasTI || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataExport);

  // Autoajuste de ancho de columnas
  const colWidths = Object.keys(dataExport[0]).map(key => ({
    wch: Math.max(key.length + 4, 15)
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Necesidades_Sistemas');

  const fechaActual = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Reporte_Necesidades_TI_${fechaActual}.xlsx`);
}

// Copiar enlace al portapapeles
function copyLinkToClipboard() {
  const urlToCopy = currentShareUrl;
  navigator.clipboard.writeText(urlToCopy).then(() => {
    const copyBtnText = document.getElementById('copyBtnText');
    const originalText = copyBtnText.textContent;
    copyBtnText.textContent = '¡Copiado!';
    setTimeout(() => {
      copyBtnText.textContent = originalText;
    }, 2000);
  }).catch(err => {
    alert('Enlace: ' + urlToCopy);
  });
}

// Configurar escuchadores de eventos
function setupEventListeners() {
  document.getElementById('searchInput').addEventListener('input', renderTable);
  document.getElementById('filterDept').addEventListener('change', renderTable);
  document.getElementById('filterCat').addEventListener('change', renderTable);
  document.getElementById('filterPriority').addEventListener('change', renderTable);
  document.getElementById('filterStatus').addEventListener('change', renderTable);

  document.getElementById('btnRefresh').addEventListener('click', loadSolicitudes);
  document.getElementById('btnExportExcel').addEventListener('click', exportToExcel);
  document.getElementById('btnCopyLink').addEventListener('click', copyLinkToClipboard);

  document.getElementById('btnCloseModal').addEventListener('click', closeDetailModal);
  document.getElementById('btnCancelModal').addEventListener('click', closeDetailModal);
  document.getElementById('btnSaveModal').addEventListener('click', saveSolicitudChanges);
  document.getElementById('btnDeleteSolicitud').addEventListener('click', deleteCurrentSolicitud);
}

// Escape de HTML seguro
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>"']/g, m => map[m]);
}
