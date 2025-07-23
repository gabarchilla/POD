document.addEventListener('DOMContentLoaded', () => {
    // Array temporal para la sección
    let records = [];

    // Selectores
    const addBtn = document.querySelector('.add-btn');
    const formContainer = document.querySelector('.add-form');
    const minimizeBtn = formContainer.querySelector('.minimize-btn');
    const saveBtn = formContainer.querySelector('.save-btn');
    const previewTbody = document.getElementById('preview-estado-equipos');
    const sendBtn = document.querySelector('.send-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const logoutBtn = document.getElementById('logout');

    // Desplegar form al click en "+"
    addBtn.addEventListener('click', () => {
        formContainer.style.display = 'block';
        addBtn.style.display = 'none';
    });

    // Minimizar form
    minimizeBtn.addEventListener('click', () => {
        formContainer.style.display = 'none';
        addBtn.style.display = 'block';
    });

    // Guardar y agregar a preview
    saveBtn.addEventListener('click', () => {
        const sistema = document.getElementById('sistema').value;
        const componente = document.getElementById('componente').value;
        const serie = document.getElementById('serie').value;
        const fecha_deteccion = document.getElementById('fecha_deteccion').value;
        const detectado_por = document.getElementById('detectado_por').value;
        const acciones = document.getElementById('acciones').value;
        const detalles = document.getElementById('detalles').value;
        const reclamo = document.getElementById('reclamo').value;

        if (!sistema || !componente || !serie || !fecha_deteccion || !detectado_por || !acciones || !detalles || !reclamo) {
            alert('Completa todos los campos');
            return;
        }

        const record = { sistema, componente, serie, fecha_deteccion, detectado_por, acciones, detalles, reclamo };
        records.push(record);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sistema}</td>
            <td>${componente}</td>
            <td>${serie}</td>
            <td>${fecha_deteccion}</td>
            <td>${detectado_por}</td>
            <td>${acciones}</td>
            <td>${detalles}</td>
            <td>${reclamo}</td>
            <td><button class="delete-btn">Eliminar</button></td>
        `;
        previewTbody.appendChild(row);

        row.querySelector('.delete-btn').addEventListener('click', () => {
            row.remove();
            records = records.filter(r => r !== record);
        });

        document.getElementById('estado-equipos-form').reset();
    });

    // Enviar al backend
    sendBtn.addEventListener('click', () => {
        if (records.length === 0) {
            alert('No hay datos para enviar');
            return;
        }

        const fechaId = localStorage.getItem('selectedFechaId');
        if (!fechaId) {
            alert('No se ha ingresado una fecha');
            return;
        }

        fetch('/api/confirm_save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                estado_equipos: records.map(r => ({ ...r, fecha_id: fechaId }))
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert('Datos enviados exitosamente');
                records = [];
                previewTbody.innerHTML = '';
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(err => alert('Error en el envío: ' + err));
    });

    // Navegación
    prevBtn.addEventListener('click', () => {
        window.location.href = '/partes/mantenimientos';
    });

    nextBtn.addEventListener('click', () => {
        window.location.href = '/partes/eventos_destacados';
    });

    // Cerrar sesión
    logoutBtn.addEventListener('click', () => {
        fetch('/api/logout', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    window.location.href = '/login';
                }
            })
            .catch(err => alert('Error cerrando sesión: ' + err));
    });
});