document.addEventListener('DOMContentLoaded', () => {
    // Arreglos temporales para cada sección
    let curvasRecords = [];
    let generadaRecords = [];
    let consumidaRecords = [];

    // Selectores comunes
    const logoutBtn = document.getElementById('logout');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const sendBtn = document.querySelector('.send-btn');

    // Función para cargar parques en selects
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

    // Cargar parques para todos los selects
    loadParques('parque-curvas');
    loadParques('parque-generada');
    loadParques('parque-consumida');

    // --- Sección Curvas ---
    const addBtnCurvas = document.querySelectorAll('.add-btn')[0];  // Primero +
    const formContainerCurvas = document.querySelectorAll('.add-form')[0];
    const minimizeBtnCurvas = formContainerCurvas.querySelector('.minimize-btn');
    const saveBtnCurvas = formContainerCurvas.querySelector('.save-btn');
    const previewCurvas = document.getElementById('preview-curvas');

    addBtnCurvas.addEventListener('click', () => {
        formContainerCurvas.style.display = 'block';
        addBtnCurvas.style.display = 'none';
    });

    minimizeBtnCurvas.addEventListener('click', () => {
        formContainerCurvas.style.display = 'none';
        addBtnCurvas.style.display = 'block';
    });

    saveBtnCurvas.addEventListener('click', () => {
        const parque_id = document.getElementById('parque-curvas').value;
        const tipo = document.getElementById('tipo-curvas').value;
        const file = document.getElementById('curva-file').files[0];

        if (!parque_id || !tipo || !file) {
            alert('Completa todos los campos para Curvas');
            return;
        }

        // Subir archivo PNG
        const formData = new FormData();
        formData.append('file', file);
        fetch('/api/upload_curva', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.curva_path) {
                const record = { parque_id, tipo, curva_path: data.curva_path };
                curvasRecords.push(record);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${parque_id}</td>
                    <td>${tipo}</td>
                    <td>${data.curva_path}</td>
                    <td><button class="delete-btn">Eliminar</button></td>
                `;
                previewCurvas.appendChild(row);

                row.querySelector('.delete-btn').addEventListener('click', () => {
                    row.remove();
                    curvasRecords = curvasRecords.filter(r => r !== record);
                });

                document.getElementById('curvas-form').reset();
            } else {
                alert('Error subiendo curva: ' + data.error);
            }
        })
        .catch(err => alert('Error subiendo curva: ' + err));
    });

    // --- Sección Energía Generada --- (similar, sin file)
    const addBtnGenerada = document.querySelectorAll('.add-btn')[1];  // Segundo +
    const formContainerGenerada = document.querySelectorAll('.add-form')[1];
    const minimizeBtnGenerada = formContainerGenerada.querySelector('.minimize-btn');
    const saveBtnGenerada = formContainerGenerada.querySelector('.save-btn');
    const previewGenerada = document.getElementById('preview-generada');

    addBtnGenerada.addEventListener('click', () => {
        formContainerGenerada.style.display = 'block';
        addBtnGenerada.style.display = 'none';
    });

    minimizeBtnGenerada.addEventListener('click', () => {
        formContainerGenerada.style.display = 'none';
        addBtnGenerada.style.display = 'block';
    });

    saveBtnGenerada.addEventListener('click', () => {
        const parque_id = document.getElementById('parque-generada').value;
        const tipo = document.getElementById('tipo-generada').value;
        const generada_mwh = document.getElementById('generada-mwh').value;

        if (!parque_id || !tipo || !generada_mwh) {
            alert('Completa todos los campos para Energía Generada');
            return;
        }

        const record = { parque_id, tipo, generada_mwh };
        generadaRecords.push(record);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${parque_id}</td>
            <td>${tipo}</td>
            <td>${generada_mwh}</td>
            <td><button class="delete-btn">Eliminar</button></td>
        `;
        previewGenerada.appendChild(row);

        row.querySelector('.delete-btn').addEventListener('click', () => {
            row.remove();
            generadaRecords = generadaRecords.filter(r => r !== record);
        });

        document.getElementById('generada-form').reset();
    });

    // --- Sección Energía Consumida --- (similar)
    const addBtnConsumida = document.querySelectorAll('.add-btn')[2];  // Tercero +
    const formContainerConsumida = document.querySelectorAll('.add-form')[2];
    const minimizeBtnConsumida = formContainerConsumida.querySelector('.minimize-btn');
    const saveBtnConsumida = formContainerConsumida.querySelector('.save-btn');
    const previewConsumida = document.getElementById('preview-consumida');

    addBtnConsumida.addEventListener('click', () => {
        formContainerConsumida.style.display = 'block';
        addBtnConsumida.style.display = 'none';
    });

    minimizeBtnConsumida.addEventListener('click', () => {
        formContainerConsumida.style.display = 'none';
        addBtnConsumida.style.display = 'block';
    });

    saveBtnConsumida.addEventListener('click', () => {
        const parque_id = document.getElementById('parque-consumida').value;
        const tipo = document.getElementById('tipo-consumida').value;
        const consumida_mwh = document.getElementById('consumida-mwh').value;

        if (!parque_id || !tipo || !consumida_mwh) {
            alert('Completa todos los campos para Energía Consumida');
            return;
        }

        const record = { parque_id, tipo, consumida_mwh };
        consumidaRecords.push(record);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${parque_id}</td>
            <td>${tipo}</td>
            <td>${consumida_mwh}</td>
            <td><button class="delete-btn">Eliminar</button></td>
        `;
        previewConsumida.appendChild(row);

        row.querySelector('.delete-btn').addEventListener('click', () => {
            row.remove();
            consumidaRecords = consumidaRecords.filter(r => r !== record);
        });

        document.getElementById('consumida-form').reset();
    });

    // Enviar todo
    sendBtn.addEventListener('click', () => {
        if (curvasRecords.length === 0 && generadaRecords.length === 0 && consumidaRecords.length === 0) {
            alert('No hay datos para enviar');
            return;
        }

        const fechaId = localStorage.getItem('selectedFechaId');
        if (!fechaId) {
            alert('No se ha ingresado una fecha');
            return;
        }

        fetch('/api/user_info')
            .then(res => res.json())
            .then(userInfo => {
                const parqueId = userInfo.parque_id;  // Si es admin, quizás manejar múltiple, pero asumimos single por ahora

                fetch('/api/confirm_save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        curvas: curvasRecords.map(r => ({ ...r, fecha_id: fechaId })),
                        energia_generada: generadaRecords.map(r => ({ ...r, fecha_id: fechaId })),
                        energia_consumida: consumidaRecords.map(r => ({ ...r, fecha_id: fechaId }))
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        alert('Datos enviados exitosamente');
                        curvasRecords = []; generadaRecords = []; consumidaRecords = [];
                        previewCurvas.innerHTML = ''; previewGenerada.innerHTML = ''; previewConsumida.innerHTML = '';
                    } else {
                        alert('Error: ' + data.error);
                    }
                });
            });
    });

    // Navegación
    prevBtn.addEventListener('click', () => {
        window.location.href = '/partes/personal_om';
    });

    nextBtn.addEventListener('click', () => {
        window.location.href = '/partes/ens';
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