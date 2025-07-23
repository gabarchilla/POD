document.addEventListener('DOMContentLoaded', () => {
    // Array temporal para la sección
    let records = JSON.parse(localStorage.getItem('personal_ajeno_records')) || [];

    // Selectores
    const addBtn = document.querySelector('.add-btn');
    const formContainer = document.querySelector('.add-form');
    const minimizeBtn = formContainer.querySelector('.minimize-btn');
    const saveBtn = formContainer.querySelector('.save-btn');
    const previewTbody = document.getElementById('preview-personal-ajeno');
    const sendBtn = document.querySelector('.send-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const logoutBtn = document.getElementById('logout');
    const previewAllBtn = document.querySelector('.preview-all-btn');

    // Función para actualizar el almacenamiento local
    function updateLocalStorage() {
        localStorage.setItem('personal_ajeno_records', JSON.stringify(records));
    }

    // Función para renderizar la vista previa desde records
    function renderPreview() {
        previewTbody.innerHTML = '';
        records.forEach((record, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.apellido_nombre}</td>
                <td>${record.empresa}</td>
                <td>${record.motivo}</td>
                <td>${record.hora_ingreso}</td>
                <td>${record.hora_egreso}</td>
                <td><button class="delete-btn" data-index="${index}">Eliminar</button></td>
            `;
            previewTbody.appendChild(row);
        });

        // Agregar listeners a los botones de eliminar
        previewTbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                records.splice(index, 1);
                updateLocalStorage();
                renderPreview();
            });
        });
    }

    renderPreview(); // Renderizar al cargar la página

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
        const apellido_nombre = document.getElementById('apellido_nombre').value;
        const empresa = document.getElementById('empresa').value;
        const motivo = document.getElementById('motivo').value;
        const hora_ingreso = document.getElementById('hora_ingreso').value;
        const hora_egreso = document.getElementById('hora_egreso').value;

        if (!apellido_nombre || !empresa || !motivo || !hora_ingreso || !hora_egreso) {
            alert('Completa todos los campos');
            return;
        }

        const record = { apellido_nombre, empresa, motivo, hora_ingreso, hora_egreso };
        records.push(record);
        updateLocalStorage();
        renderPreview();

        document.getElementById('personal-ajeno-form').reset();
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
                personal_ajeno: records.map(r => ({ ...r, fecha_id: fechaId }))
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert('Datos enviados exitosamente');
                records = [];
                localStorage.removeItem('personal_ajeno_records');
                renderPreview();
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(err => alert('Error en el envío: ' + err));
    });

    // Navegación
    prevBtn.addEventListener('click', () => {
        window.location.href = '/partes/eventos_destacados';
    });

    nextBtn.addEventListener('click', () => {
        // Ajustar según la siguiente sección si existe, o dejar vacío
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

    // Vista previa general en una pestaña aparte
    previewAllBtn.addEventListener('click', () => {
        const sections = ['ens', 'acciones_operativas', 'novedades_operativas', 'mantenimientos', 'estado_equipos', 'eventos_destacados', 'personal_ajeno'];
        let previewWindow = window.open('', '_blank');
        previewWindow.document.write('<html><head><title>Vista Previa General</title><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 8px; text-align: left; } h2 { margin-top: 20px; }</style></head><body>');
        
        const fechaId = localStorage.getItem('selectedFechaId');
        previewWindow.document.write(`<h1>Vista Previa - Fecha ID: ${fechaId || 'No seleccionada'}</h1>`);

        sections.forEach(section => {
            const key = `${section}_records`;
            const stored = localStorage.getItem(key);
            if (stored) {
                const records = JSON.parse(stored);
                if (records.length > 0) {
                    previewWindow.document.write(`<h2>${section.charAt(0).toUpperCase() + section.slice(1).replace('_', ' ')}</h2>`);
                    previewWindow.document.write('<table><thead><tr>');
                    const headers = Object.keys(records[0]);
                    headers.forEach(h => {
                        previewWindow.document.write(`<th>${h.charAt(0).toUpperCase() + h.slice(1).replace('_', ' ')}</th>`);
                    });
                    previewWindow.document.write('</tr></thead><tbody>');
                    records.forEach(r => {
                        previewWindow.document.write('<tr>');
                        headers.forEach(h => {
                            previewWindow.document.write(`<td>${r[h] || ''}</td>`);
                        });
                        previewWindow.document.write('</tr>');
                    });
                    previewWindow.document.write('</tbody></table>');
                }
            }
        });

        previewWindow.document.write('</body></html>');
        previewWindow.document.close();
    });
});