document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');

    loginBtn.addEventListener('click', () => {
        const usuario = document.getElementById('usuario').value;
        const contrasena = document.getElementById('contrasena').value;

        if (!usuario || !contrasena) {
            alert('Completa todos los campos');
            return;
        }

        fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, contrasena })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                window.location.href = '/partes/fecha_select';  // Redirigir a selector de fecha después de login
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(err => alert('Error en el login: ' + err));
    });
});