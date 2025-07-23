document.addEventListener('DOMContentLoaded', () => {
    // Array temporal para la sección
    let records = [];

    // Selectores
    const addBtn = document.querySelector('.add-btn');
    const formContainer = document.querySelector('.add-form');
    const minimizeBtn = formContainer.querySelector('.minimize-btn');
    const saveBtn = formContainer.querySelector('.save-btn');
    const previewTbody = document.getElementById('preview-ens');
    const sendBtn = document.querySelector('.send-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const logoutBtn = document.getElementById('logout');

    const inicioInput = document.getElementById('inicio');
    const finInput = document.getElementById('fin');
    const duracionInput = document.getElementById('duracion');
    const fechaAveriaContainer = document.getElementById('fecha-averia-container');

    // Calcular duración automáticamente
    function calculateDuracion() {
        const inicio = inicioInput.value;
        const fin = finInput.value;
        if (inicio && fin) {
            const inicioTime = new Date(`2000-01-01T${inicio}`);
            const finTime = new Date(`2000-01-01T${fin}`);
            let duracionMs = finTime - inicioTime;
            if (duracionMs < 0) duracionMs += 24 * 60 * 60 * 1000;  // Si fin es antes, asumir siguiente día
            const duracionHours = duracionMs / (1000 * 60 * 60);
            duracionInput.value = duracionHours.toFixed(2);
        } else {
            duracionInput.value = '';
        }
    }

    inicioInput.addEventListener('change', calculateDuracion);
    finInput.addEventListener('change', calculateDuracion);

    // Mostrar/ocultar fecha de avería basado en selección
    document.querySelectorAll('input[name="hoy"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const selectedValue = document.querySelector('input[name="hoy"]:checked').value;
            if (selectedValue === 'false') {
                fechaAveriaContainer.style.display = 'block';
            } else {
                fechaAveriaContainer.style.display = 'none';
                document.getElementById('fecha_averia').value = ''; // Limpiar valor si se oculta
            }
        });
    });

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

    loadParques('parque-ens');

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
        const parque_id = document.getElementById('parque-ens').value;
        const inversor = document.getElementById('inversor').value;
        const inicio = document.getElementById('inicio').value;
        const fin = document.getElementById('fin').value;
        const duracion = document.getElementById('duracion').value;
        const ens = document.getElementById('ens').value;
        const limitacion = document.getElementById('limitacion').value;
        const id_falla = document.getElementById('id_falla').value;
        const descripcion = document.getElementById('descripcion').value;
        const motivo = document.getElementById('motivo').value;
        const factor_parada = document.getElementById('factor_parada').value;
        const tipo_factor = document.getElementById('tipo_factor').value;
        const hoy = document.querySelector('input[name="hoy"]:checked')?.value === 'true';
        let averia_id = document.getElementById('fecha_averia').value;  // Asumiendo averia_id es la fecha, ajustar si es ID numérico

        if (!parque_id || !inversor || !inicio || !fin || !duracion || !ens || !limitacion || !id_falla || !descripcion || !motivo || !factor_parada || !tipo_factor || document.querySelector('input[name="hoy"]:checked') === null) {
            alert('Completa todos los campos');
            return;
        }

        if (!hoy && !averia_id) {
            alert('Completa la fecha de avería');
            return;
        }

        if (hoy) {
            averia_id = null; // O '' si no se necesita cuando es hoy
        }

        const record = { parque_id, inversor, inicio, fin, duracion, ens, limitacion, id_falla, descripcion, motivo, factor_parada, tipo_factor, hoy, averia_id };
        records.push(record);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${parque_id}</td>
            <td>${inversor}</td>
            <td>${inicio}</td>
            <td>${fin}</td>
            <td>${ens}</td>
            <td><button class="delete-btn">Eliminar</button></td>
        `;
        previewTbody.appendChild(row);

        row.querySelector('.delete-btn').addEventListener('click', () => {
            row.remove();
            records = records.filter(r => r !== record);
        });

        document.getElementById('ens-form').reset();
        duracionInput.value = '';  // Limpiar duración calculada
        fechaAveriaContainer.style.display = 'none'; // Resetear visibilidad
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
                ens: records.map(r => ({ ...r, fecha_id: fechaId }))
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
        window.location.href = '/partes/generacion';
    });

    nextBtn.addEventListener('click', () => {
        window.location.href = '/partes/acciones_operativas';
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