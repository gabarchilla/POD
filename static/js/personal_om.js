// static/js/personal_om.js (ya corregido, usa localStorage para fecha_id en envíos)
document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.querySelector('.add-btn');
    const formContainer = document.querySelector('.add-form');
    const minimizeBtn = document.querySelector('.minimize-btn');
    const saveBtn = document.querySelector('.save-btn');
    const previewTbody = document.querySelector('.preview-table tbody');
    const sendBtn = document.querySelector('.send-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const logoutBtn = document.getElementById('logout');

    // Array para almacenar datos temporalmente (para preview y envío final)
    let records = [];

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
        const puesto = document.getElementById('puesto').value;
        const modalidad = document.getElementById('modalidad').value;
        const inicio = document.getElementById('inicio').value;
        const fin = document.getElementById('fin').value;

        if (!apellido_nombre || !puesto || !modalidad || !inicio || !fin) {
            alert('Completa todos los campos');
            return;
        }

        // Agregar a array temporal
        const record = { apellido_nombre, puesto, modalidad, inicio, fin };
        records.push(record);

        // Agregar fila a preview
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${apellido_nombre}</td>
            <td>${puesto}</td>
            <td>${modalidad}</td>
            <td>${inicio}</td>
            <td>${fin}</td>
            <td><button class="delete-btn">Eliminar</button></td>
        `;
        previewTbody.appendChild(row);

        // Evento para eliminar
        row.querySelector('.delete-btn').addEventListener('click', () => {
            row.remove();
            records = records.filter(r => r !== record);  // Remover del array
        });

        // Limpiar form
        document.getElementById('personal-form').reset();

        // Opcional: Minimizar después de guardar
        // minimizeBtn.click();
    });

    // Enviar al backend (al final, confirma y postea)
    sendBtn.addEventListener('click', () => {
        if (records.length === 0) {
            alert('No hay datos para enviar');
            return;
        }

        const fechaId = localStorage.getItem('selectedFechaId');  // Obtener de localStorage
        if (!fechaId) {
            alert('No se ha seleccionado una fecha');
            return;
        }

        // Obtener parqueId de la API de user_info
        fetch('/api/user_info')
            .then(res => res.json())
            .then(userInfo => {
                const parqueId = userInfo.parque_id;
                if (!parqueId) {
                    alert('No se pudo obtener el parque ID');
                    return;
                }

                fetch('/api/confirm_save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        personal_om: records.map(r => ({ ...r, fecha_id: fechaId, parque_id: parqueId }))
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        alert('Datos enviados exitosamente');
                        records = [];  // Limpiar
                        previewTbody.innerHTML = '';
                    } else {
                        alert('Error: ' + data.error);
                    }
                })
                .catch(err => alert('Error en el envío: ' + err));
            })
            .catch(err => alert('Error obteniendo user info: ' + err));
    });

    // Navegación Anterior (a fecha_select)
    prevBtn.addEventListener('click', () => {
        window.location.href = '/partes/fecha_select';
    });

    // Navegación Siguiente (a generacion)
    nextBtn.addEventListener('click', () => {
        window.location.href = '/partes/generacion';
    });

    // Cerrar sesión
    logoutBtn.addEventListener('click', () => {
        fetch('/api/logout', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    localStorage.removeItem('selectedFechaId');  // Limpiar al logout
                    window.location.href = '/login';
                }
            })
            .catch(err => alert('Error cerrando sesión: ' + err));
    });
});