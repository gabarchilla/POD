document.addEventListener('DOMContentLoaded', () => {
    // Array temporal para la sección
    let records = [];

    // Selectores
    const addBtn = document.querySelector('.add-btn');
    const formContainer = document.querySelector('.add-form');
    const minimizeBtn = formContainer.querySelector('.minimize-btn');
    const saveBtn = formContainer.querySelector('.save-btn');
    const previewTbody = document.getElementById('preview-eventos-destacados');
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
        const evento = document.getElementById('evento').value;
        const tipo = document.getElementById('tipo').value;
        const descripcion = document.getElementById('descripcion').value;

        if (!evento || !tipo || !descripcion) {
            alert('Completa todos los campos');
            return;
        }

        const record = { evento, tipo, descripcion };
        records.push(record);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${evento}</td>
            <td>${tipo}</td>
            <td>${descripcion}</td>
            <td><button class="delete-btn">Eliminar</button></td>
        `;
        previewTbody.appendChild(row);

        row.querySelector('.delete-btn').addEventListener('click', () => {
            row.remove();
            records = records.filter(r => r !== record);
        });

        document.getElementById('eventos-destacados-form').reset();
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
                eventos_destacados: records.map(r => ({ ...r, fecha_id: fechaId }))
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
        window.location.href = '/partes/estado_equipos';
    });

    nextBtn.addEventListener('click', () => {
        window.location.href = '/partes/personal_ajeno';
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