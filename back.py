from flask import Flask, jsonify, request, render_template, session, redirect, url_for
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import uuid

app = Flask(__name__, template_folder='templates')
app.secret_key = 'your_secret_key_here'  # Cambia esto por una clave segura en producción

# Configuración de la conexión a PostgreSQL
DB_CONFIG = {
    'dbname': 'pod.v1.0',
    'user': 'postgres',
    'password': '200996',
    'host': 'localhost',
    'port': '5432'
}

# Carpeta para guardar imágenes
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except psycopg2.Error as e:
        print(f"Error de conexión: {e}")
        return None

@app.route('/')
def index():
    if 'usuario' not in session:
        return redirect(url_for('login'))
    return redirect(url_for('partes', vista='fecha_select'))  # Redirigir a selector de fecha

@app.route('/login', methods=['GET'])
def login():
    return render_template('login.html')

@app.route('/partes/<vista>')
def partes(vista):
    if 'usuario' not in session:
        return redirect(url_for('login'))
    
    vistas_validas = [
        'fecha_select', 'personal_om', 'generacion', 'ens', 'acciones_operativas',
        'novedades_operativas', 'mantenimientos', 'estado_equipos',
        'eventos_destacados', 'personal_ajeno'
    ]
    if vista not in vistas_validas:
        return jsonify({"error": "Vista no encontrada"}), 404

    # Lógica para vistas limitadas por usuario (cog solo ve ciertas vistas)
    vistas_limitadas_cog = ['fecha_select', 'generacion', 'ens', 'acciones_operativas', 'novedades_operativas']
    if session['usuario'] == 'cog' and vista not in vistas_limitadas_cog:
        return jsonify({"error": "Acceso denegado para este usuario"}), 403

    return render_template(f'partes/{vista}.html', usuario=session.get('usuario', 'Invitado'))  # Pasa usuario al template

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    usuario = data.get('usuario')
    contrasena = data.get('contrasena')
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM usuarios WHERE usuario = %s AND contrasena = %s", (usuario, contrasena))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        session['usuario'] = user['usuario']
        session['predio_id'] = user['predio_id']
        session['es_admin'] = user['es_admin']
        return jsonify({"message": "Login exitoso", "usuario": user['usuario']}), 200
    else:
        return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('usuario', None)
    session.pop('predio_id', None)
    session.pop('es_admin', None)
    return jsonify({"message": "Sesión cerrada"}), 200

@app.route('/api/user_info', methods=['GET'])
def get_user_info():
    if 'usuario' not in session:
        return jsonify({"error": "No autenticado"}), 401
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT nombre FROM parques WHERE predio_id = %s", (session['predio_id'],))
    parque = cursor.fetchone()
    conn.close()
    return jsonify({
        "es_admin": session['es_admin'],
        "parque_id": session['predio_id'],
        "parque_nombre": parque['nombre'] if parque else "Todos los parques"
    })

@app.route('/api/create_fecha', methods=['POST'])
def create_fecha():
    if 'usuario' not in session:
        return jsonify({"error": "No autenticado"}), 401
    data = request.json
    fecha = data.get('fecha')
    if not fecha:
        return jsonify({"error": "Fecha requerida"}), 400
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Verificar si ya existe
    cursor.execute("SELECT id FROM fechas WHERE fecha = %s", (fecha,))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        return jsonify({"id": existing['id']}), 200
    
    # Insertar nueva
    cursor.execute("INSERT INTO fechas (fecha) VALUES (%s) RETURNING id", (fecha,))
    new_id = cursor.fetchone()['id']
    conn.commit()
    conn.close()
    return jsonify({"id": new_id}), 200

@app.route('/api/parques', methods=['GET'])
def get_parques():
    if 'usuario' not in session:
        return jsonify({"error": "No autenticado"}), 401
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    if session.get('es_admin'):
        cursor.execute("SELECT id, nombre FROM parques")
    else:
        cursor.execute("SELECT id, nombre FROM parques WHERE predio_id = %s", (session['predio_id'],))
    
    parques = cursor.fetchall()
    conn.close()
    return jsonify(parques)

@app.route('/api/personal', methods=['GET'])
def get_personal():
    if 'usuario' not in session:
        return jsonify({"error": "No autenticado"}), 401
    parque_id = request.args.get('parque_id')
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("""
        SELECT DISTINCT apellido_nombre, parque_id 
        FROM ajeno_om 
        WHERE parque_id = %s
    """, (parque_id,))
    personal = cursor.fetchall()
    conn.close()
    return jsonify(personal)

@app.route('/api/personal_ps', methods=['GET'])
def get_personal_ps():
    if 'usuario' not in session:
        return jsonify({"error": "No autenticado"}), 401
    parque_id = request.args.get('parque_id')
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("""
        SELECT id, apellido_nombre, puesto, modalidad, inicio, fin 
        FROM personal_ps 
        WHERE parque_id = %s
    """, (parque_id,))
    personal = cursor.fetchall()
    conn.close()
    return jsonify(personal)

@app.route('/api/upload_curva', methods=['POST'])
def upload_curva():
    if 'usuario' not in session:
        return jsonify({"error": "No autenticado"}), 401
    if 'file' not in request.files:
        return jsonify({"error": "No se proporcionó archivo"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nombre de archivo vacío"}), 400
    if file and file.filename.endswith('.png'):
        filename = f"curva_{uuid.uuid4()}.png"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        return jsonify({"curva_path": file_path}), 200
    return jsonify({"error": "Solo se permiten archivos PNG"}), 400

@app.route('/api/confirm_save', methods=['POST'])
def confirm_save():
    if 'usuario' not in session:
        return jsonify({"error": "No autenticado"}), 401
    data = request.json
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conn.cursor()
    try:
        # Aquí van las inserciones para todas las secciones, como en versiones anteriores
        # Por ejemplo, para personal_om:
        for record in data.get('personal_om', []):
            cursor.execute("""
                INSERT INTO personal_ps (parque_id, fecha_id, apellido_nombre, puesto, modalidad, inicio, fin)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                record.get('parque_id'),
                record.get('fecha_id'),
                record.get('apellido_nombre'),
                record.get('puesto'),
                record.get('modalidad'),
                record.get('inicio'),
                record.get('fin')
            ))
        # Agrega más para otras secciones...
        conn.commit()
        return jsonify({"message": "Datos confirmados y guardados exitosamente"}), 200
    except psycopg2.Error as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/puestos', methods=['GET'])
def get_puestos():
    if 'usuario' not in session:
        return jsonify({"error": "No autenticado"}), 401
    return jsonify([
        "Operador",
        "Técnico de mantenimiento",
        "Gestor administrativo",
        "Técnico SSOyA",
        "Supervisor",
        "Jefe de parque"
    ])

@app.route('/api/delete_personal_ps/<int:id>', methods=['DELETE'])
def delete_personal_ps(id):
    if 'usuario' not in session:
        return jsonify({"error": "No autenticado"}), 401
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM personal_ps WHERE id = %s", (id,))
        conn.commit()
        return jsonify({"message": "Registro eliminado exitosamente"}), 200
    except psycopg2.Error as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)