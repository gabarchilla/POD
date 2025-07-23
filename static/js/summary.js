document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout');
    const prevBtn = document.querySelector('.prev-btn');
    const confirmBtn = document.getElementById('confirm-btn');

    // Función para cargar y mostrar datos de localStorage
    function loadPreview(section, tbodyId, fields) {
        const data = JSON.parse(localStorage.getItem(`${section}_records`)) || [];
        const tbody = document.getElementById(tbodyId);
        tbody.innerHTML = '';
        data.forEach(record => {
            const row = document.createElement('tr');
            let rowHTML = '';
            fields.forEach(field => {
                rowHTML += `<td>${record[field] || ''}</td>`;
            });
            row.innerHTML = rowHTML;
            tbody.appendChild(row);
        });
    }

    // Cargar previews para todas las secciones
    loadPreview('personal_om', 'preview-personal-om', ['apellido_nombre', 'puesto', 'modalidad', 'inicio', 'fin']);
    loadPreview('curvas', 'preview-curvas', ['parque_id', 'tipo', 'curva_path']);
    loadPreview('energia_generada', 'preview-generada', ['parque_id', 'tipo', 'generada_mwh']);
    loadPreview('energia_consumida', 'preview-consumida', ['parque_id', 'tipo', 'consumida_mwh']);
    loadPreview('ens', 'preview-ens', ['parque_id', 'inversor', 'inicio', 'fin', 'ens']);
    loadPreview('acciones_operativas', 'preview-acciones', ['parque_id', 'hora', 'ente', 'descripcion']);
    loadPreview('novedades_operativas', 'preview-novedades', ['parque_id', 'hora', 'codigo', 'descripcion']);
    // Agrega más si hay otras secciones

    // Confirmar y guardar
    confirmBtn.addEventListener('click', () => {
        const allData = {
            personal_om: JSON.parse(localStorage.getItem('personal_om_records')) || [],
            curvas: JSON.parse(localStorage.getItem('curvas_records')) || [],
            energia_generada: JSON.parse(localStorage.getItem('energia_generada_records')) || [],
            energia_consumida: JSON.parse(localStorage.getItem('energia_consumida_records')) || [],
            ens: JSON.parse(localStorage.getItem('ens_records')) || [],
            acciones_operativas: JSON.parse(localStorage.getItem('acciones_operativas_records')) || [],
            novedades_operativas: JSON.parse(localStorage.getItem('novedades_operativas_records')) || []
            // Agrega más
        };

        const fechaId = localStorage.getItem('selectedFechaId');
        if (!fechaId) {
            alert('No se ha ingresado una fecha');
            return;
        }

        Object.keys(allData).forEach(key => {
            allData[key] = allData[key].map(r => ({ ...r, fecha_id: fechaId }));
        });

        fetch('/api/confirm_save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(allData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert('Datos guardados exitosamente');
                // Limpiar localStorage
                Object.keys(allData).forEach(key => localStorage.removeItem(`${key}_records`));
                window.location.href = '/';  // Redirigir a inicio o donde quieras
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(err => alert('Error en el envío: ' + err));
    });

    // Navegación Anterior (a la última página, ej. novedades_operativas)
    prevBtn.addEventListener('click', () => {
        window.location.href = '/partes/novedades_operativas';
    });

    // Cerrar sesión
    logoutBtn.addEventListener('click', () => {
        fetch('/api/logout', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    // Limpiar localStorage al logout
                    localStorage.clear();
                    window.location.href = '/login';
                }
            })
            .catch(err => alert('Error cerrando sesión: ' + err));
    });
});