// Lógica del Formulario Simplificado para Departamentos

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('needsForm');
  const btnSubmit = document.getElementById('btnSubmit');
  const successModal = document.getElementById('successModal');
  const ticketFolio = document.getElementById('ticketFolio');
  const btnNuevaSolicitud = document.getElementById('btnNuevaSolicitud');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const departamento = form.departamento.value;
    const contacto = form.contacto.value.trim();
    const descripcion = form.descripcion.value.trim();
    const beneficioEsperado = form.beneficioEsperado.value.trim();
    const prioridad = form.prioridad.value;

    if (!nombre) {
      alert('Por favor ingresa tu nombre.');
      return;
    }

    if (!departamento) {
      alert('Por favor selecciona tu departamento.');
      return;
    }

    if (!descripcion) {
      alert('Por favor describe lo que necesitas o el problema que tienes.');
      return;
    }

    // Extraer correo o teléfono si es posible
    const isEmail = contacto.includes('@');
    const correo = isEmail ? contacto : '';
    const telefono = isEmail ? '' : contacto;

    // Crear resumen / título automático a partir de lo que escribió
    const titulo = descripcion.length > 70 
      ? descripcion.substring(0, 67) + '...' 
      : descripcion;

    const formData = {
      nombre,
      departamento,
      correo,
      telefono: contacto,
      puesto: '',
      categoria: 'General',
      prioridad,
      titulo,
      descripcion,
      personasAfectadas: 'No especificado',
      beneficioEsperado
    };

    // Estado visual de envío
    const originalBtnContent = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i><span>Enviando...</span>`;

    try {
      let savedSolicitud = null;

      try {
        const response = await fetch('/api/solicitudes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const result = await response.json();
          savedSolicitud = result.solicitud;
        } else {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Error en el servidor');
        }
      } catch (netErr) {
        console.warn('Usando almacenamiento local de respaldo:', netErr);
        const localList = JSON.parse(localStorage.getItem('solicitudes_ti') || '[]');
        const year = new Date().getFullYear();
        const nextNum = (localList.length + 1).toString().padStart(3, '0');
        const id = `SOL-${year}-${nextNum}`;

        savedSolicitud = {
          id,
          ...formData,
          estado: 'Pendiente',
          notasTI: '',
          fecha: new Date().toISOString()
        };
        localList.unshift(savedSolicitud);
        localStorage.setItem('solicitudes_ti', JSON.stringify(localList));
      }

      if (savedSolicitud && savedSolicitud.id) {
        ticketFolio.textContent = savedSolicitud.id;
        successModal.classList.remove('hidden');
        form.reset();
      }

    } catch (err) {
      console.error('Error al registrar:', err);
      alert('Ocurrió un error al enviar tu solicitud: ' + (err.message || 'Intente nuevamente.'));
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalBtnContent;
    }
  });

  btnNuevaSolicitud.addEventListener('click', () => {
    successModal.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
