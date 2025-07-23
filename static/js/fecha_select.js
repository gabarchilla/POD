document.addEventListener('DOMContentLoaded', () => {
    const fechaInput = document.getElementById('fecha-input');
    const previewFecha = document.getElementById('preview-fecha');
    const nextBtn = document.querySelector('.next-btn');
    const logoutBtn = document.getElementById('logout');

    console.log('JS cargado correctamente en fecha_select.html');

    // Persistir: Cargar última fecha de localStorage
    const lastFecha = localStorage.getItem('lastFecha');
    if (lastFecha) {
        fechaInput.value = lastFecha;
        previewFecha.textContent = `Fecha seleccionada: ${lastFecha}`;
        console.log('Fecha persistida cargada:', lastFecha);
    } else {
        console.log('No hay fecha persistida en localStorage');
    }

    // Actualizar preview al cambiar input
    fechaInput.addEventListener('change', () => {
        const fecha = fechaInput.value;
        previewFecha.textContent = `Fecha seleccionada: ${fecha || 'Ninguna'}`;
        console.log('Fecha cambiada en input:', fecha);
    });

    // Ingresar fecha nueva y POST para crear/obtener ID
    nextBtn.addEventListener('click', () => {
        const fecha = fechaInput.value;
        if (!fecha) {
            alert('Ingresa una fecha');
            console.error('No se ingresó fecha');
            return;
        }

        // Guardar en localStorage para persistencia
        localStorage.setItem('lastFecha', fecha);
        console.log('Fecha guardada en localStorage:', fecha);

        fetch('/api/create_fecha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fecha })
        })
        .then(res => {
            console.log('Respuesta de /api/create_fecha:', res.status);
            return res.json();
        })
        .then(data => {
            if (data.id) {
                localStorage.setItem('selectedFechaId', data.id);
                console.log('ID de fecha creado/obtenido:', data.id);
                window.location.href = '/partes/personal_om';
            } else {
                alert('Error: ' + data.error);
                console.error('Error en data de create_fecha:', data.error);
            }
        })
        .catch(err => {
            alert('Error creando fecha: ' + err);
            console.error('Error en fetch create_fecha:', err);
        });
    });

    // Cerrar sesión
    logoutBtn.addEventListener('click', () => {
        console.log('Click en Cerrar Sesión');
        fetch('/api/logout', { method: 'POST' })
            .then(res => {
                console.log('Respuesta de /api/logout:', res.status);
                return res.json();
            })
            .then(data => {
                if (data.message) {
                    localStorage.removeItem('selectedFechaId');  // Limpiar al logout
                    localStorage.removeItem('lastFecha');  // Limpiar persistencia de fecha
                    console.log('Sesión cerrada, localStorage limpiado');
                    window.location.href = '/login';
                } else {
                    alert('Error: ' + data.error);
                    console.error('Error en data de logout:', data.error);
                }
            })
            .catch(err => {
                alert('Error cerrando sesión: ' + err);
                console.error('Error en fetch logout:', err);
            });
    });
});