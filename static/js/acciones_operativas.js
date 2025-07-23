document.addEventListener('DOMContentLoaded', () => {
    // Array temporal para la sección
    let records = [];

    // Selectores
    const addBtn = document.querySelector('.add-btn');
    const formContainer = document.querySelector('.add-form');
    const minimizeBtn = formContainer.querySelector('.minimize-btn');
    const saveBtn = formContainer.querySelector('.save-btn');
    const previewTbody = document.getElementById('preview-acciones');
    const sendBtn = document.querySelector('.send-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const logoutBtn = document.getElementById('logout');

    // Función para cargar parques
    function loadParques(selectId) {
        fetch('/api/parques')
            .then(res => res.json())
            .then(parques => {
                const select = document.getElementById(selectId);
                parques.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = p.nombre;
                    select.appendChild(opt);
                });
            })
            .catch(err => console.error('Error cargando parques:', err));
    }

    loadParques('parque-acciones');

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
        const parque_id = document.getElementById('parque-acciones').value;
        const hora = document.getElementById('hora').value;
        const ente = document.getElementById('ente').value;
        const descripcion = document.getElementById('descripcion').value;

        if (!parque_id || !hora || !ente || !descripcion) {
            alert('Completa todos los campos');
            return;
        }

        const record = { parque_id, hora, ente, descripcion };
        records.push(record);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${parque_id}</td>
            <td>${hora}</td>
            <td>${ente}</td>
            <td>${descripcion}</td>
            <td><button class="delete-btn">Eliminar</button></td>
        `;
        previewTbody.appendChild(row);

        row.querySelector('.delete-btn').addEventListener('click', () => {
            row.remove();
            records = records.filter(r => r !== record);
        });

        document.getElementById('acciones-form').reset();
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
                acciones_operativas: records.map(r => ({ ...r, fecha_id: fechaId }))
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
        window.location.href = '/partes/ens';
    });

    nextBtn.addEventListener('click', () => {
        window.location.href = '/partes/novedades_operativas';
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