# 🖥️ Sistema de Levantamiento de Necesidades de Sistemas / TI

Aplicación web diseñada para que el área de **Sistemas e Informática (TI)** pueda recopilar, diagnosticar y gestionar de forma ordenada las necesidades tecnológicas de todos los departamentos de la empresa.

---

## 🚀 ¿Cómo Iniciar el Sistema?

### Opción 1: Con un solo clic (Recomendado en Windows)
Haz doble clic sobre el archivo:
📁 **`INICIAR_SISTEMA.bat`**

Esto encenderá el servidor y abrirá tu navegador automáticamente.

---

### Opción 2: Desde la consola / terminal
Abre una terminal en esta carpeta y ejecuta:
```bash
node server.js
```

---

## 🔗 Enlaces de Acceso

| Módulo | Enlace | Para quién es |
| :--- | :--- | :--- |
| **Formulario de Necesidades** | `http://localhost:3000` | Para enviar a los jefes de departamento y colaboradores |
| **Panel de Gestión de TI** | `http://localhost:3000/admin.html` | Exclusivo para el equipo de Sistemas / TI |

---

## 📡 ¿Cómo compartir el enlace con los otros departamentos?

### 1. Para que lo abran desde CUALQUIER RED (Celular, Casa, Otra oficina, etc.)
¡Ya tiene el nombre personalizado que solicitaste!
1. Haz doble clic en **`COMPARTIR_POR_INTERNET.bat`**.
2. Tu enlace oficial personalizado es:
   👉 **`https://pendientes-para-sistemas.loca.lt`**
3. Copia ese enlace y envíalo por WhatsApp, correo o Teams. **Cualquier persona en el mundo podrá abrirlo y responder desde su celular con datos o desde su casa.**

### 2. Para red local de oficina solamente
1. Abre el **Panel de TI** (`http://localhost:3000/admin.html`).
2. En la parte superior verás tu IP de oficina (ej. `http://10.162.249.20:3000`).
3. Ese enlace sirve únicamente cuando están conectados al mismo módem o Wi-Fi de la empresa.

---

## 📊 Características del Sistema

### Para los Departamentos:
* 📝 **Formulario intuitivo y claro**: Información del solicitante, departamento y cargo.
* 🏷️ **Categorización con iconos**:
  * 🖥️ Hardware y Equipos (computadoras, impresoras, monitores).
  * 💻 Software y Licencias (Office, sistemas, programas).
  * 🌐 Red e Internet (WiFi, cableado, caídas de señal).
  * ⚙️ Automatización y Sistemas (desarrollo a medida, macros, reportes).
  * 🔒 Seguridad y Accesos (carpetas compartidas, contraseñas, copias de seguridad).
  * 🎓 Capacitación tecnológica.
* 🚦 **Nivel de Urgencia**: Baja, Media, Alta o Crítica.
* 🎟️ **Generación automática de Folio** (ej. `SOL-2026-001`) para seguimiento de cada requerimiento.

### Para el Área de Sistemas (Admin):
* 📈 **Métricas y KPIs en tiempo real** (Total recibidas, Críticas, En proceso, Resueltas).
* 📊 **Gráficas estadísticas automáticas** (por departamento y por categoría de TI).
* 🔍 **Buscador y filtros avanzados** (por departamento, categoría, prioridad y estado).
* 🛠️ **Gestión de ciclo de vida**: cambiar estados (*Pendiente, En Análisis, Aprobado, En Proceso, Resuelto, Rechazado*).
* 📝 **Bitácora / Notas internas de TI** para registrar presupuestos, fechas de entrega o cotizaciones.
* 📥 **Exportación a Excel (.xlsx) con un clic**: Genera una hoja de cálculo completa lista para presentar a Dirección General.
* 💾 **Almacenamiento persistente**: Todos los datos se guardan en `data/solicitudes.json`.
