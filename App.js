import React, { useState, useEffect } from 'react';
import './App.css';
import loginImage from './login.png';
import fpImage from './FP.png';
// Importa la imagen que quieras usar para la sección de denuncias
// import denunciaImage from './denuncia.png'; // Descomenta y ajusta el nombre de tu imagen

const API_URL = 'http://localhost:3000';

const barrios = [
  'Bajo Cañada', 'Bengala', 'Bilbao', 'Camelias', 'Cañada Sur', 'Carmen', 'Cascajal', 'Cerro Azul',
  'Colombari', 'Colonia Kennedy', 'Domingo Savio', 'Guacayama', 'Hogar Propio', 'Jazmín', 'López Mateo',
  'Luna Park', 'Magnolias', 'Mojados', 'Monguito', 'Monte Azul', 'Musmani', 'Paso Ancho', 'Presidentes',
  'San Martín', 'San Sebastián', 'Santa Rosa', 'Seminario', 'Zorobarú'
];

const tiposDenuncia = [
  'Falta de acceso a educación de calidad',
  'Acceso limitado a servicios de salud',
  'Discriminación o exclusión de grupos vulnerables',
  'Viviendas en condiciones precarias o falta de vivienda digna',
  'Servicios básicos deficientes en zonas pobres',
  'Falta de seguridad en barrios marginados',
  'Niñez expuesta a riesgos sociales',
  'Desempleo y falta de oportunidades laborales'
];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [formAuth, setFormAuth] = useState({
    cedula: '', nombre: '', papellido: '', sapellido: '',
    barrio: barrios[0], email: '', telefono: '', password: '',
  });

  const [instituciones, setInstituciones] = useState([]);
  const [formDenuncia, setFormDenuncia] = useState({
    tipo_denuncia: tiposDenuncia[0],
    descripcion: '',
    barrio: barrios[0],
  });

  const [pagina, setPagina] = useState('denuncias'); 

  const handleChangeAuth = e => setFormAuth({ ...formAuth, [e.target.name]: e.target.value });
  const handleChangeDenuncia = e => setFormDenuncia({ ...formDenuncia, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formAuth),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error en registro');
      alert('Registro exitoso! Ahora inicia sesión');
      setIsRegister(false);
      setFormAuth({ cedula: '', nombre: '', papellido: '', sapellido: '', barrio: barrios[0], email: '', telefono: '', password: '' });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await fetch(`${API_URL}/usuarios`);
      const usuarios = await resp.json();
      const usuario = usuarios.find(u => u.email === formAuth.email && u.password === formAuth.password);
      if (!usuario) throw new Error('Usuario o contraseña incorrectos');
      setUser(usuario);
      setPagina('denuncias');  
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setPagina('denuncias'); 
  };

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/instituciones`)
        .then(res => res.json())
        .then(data => setInstituciones(data))
        .catch(console.error);
    }
  }, [user]);

  const handleEnviarDenuncia = async (e) => {
    e.preventDefault();
    if (!formDenuncia.descripcion) {
      alert('Por favor escribe una descripción');
      return;
    }
    try {
      const resp = await fetch(`${API_URL}/denuncias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          tipo_denuncia: formDenuncia.tipo_denuncia,
          descripcion: formDenuncia.descripcion,
          barrio: formDenuncia.barrio,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error enviando denuncia');
      alert('Denuncia enviada con éxito');
      setFormDenuncia({ tipo_denuncia: tiposDenuncia[0], descripcion: '', barrio: barrios[0] });
    } catch (err) {
      alert(err.message);
    }
  };

  /* ========================
     LOGIN / REGISTRO
     ======================== */
  if (!user) {
    return (
      <div className="auth-page light">
        <div className="login-card">
          <div className="login-left">
            <div className="brand-row">
              <div className="brand-marker" aria-hidden="true"></div>
              <div className="brand-name">DenunciasCR</div>
            </div>

            <h2 className="login-heading">Únete a nosotros</h2>
            <p className="login-sub">
              Reporta problemas en tu comunidad y conéctate con las instituciones responsables. 
              Tu denuncia llega centralizada y con seguimiento.
            </p>

            <form onSubmit={isRegister ? handleRegister : handleLogin} className="login-form">
              {isRegister && (
                <>
                  <div className="input-group">
                    <input
                      className="input-style"
                      name="cedula"
                      placeholder="Cédula"
                      value={formAuth.cedula}
                      onChange={handleChangeAuth}
                      required
                    />
                  </div>
                  <div className="input-row">
                    <input
                      className="input-style"
                      name="nombre"
                      placeholder="Nombre"
                      value={formAuth.nombre}
                      onChange={handleChangeAuth}
                      required
                    />
                    <input
                      className="input-style"
                      name="papellido"
                      placeholder="Primer Apellido"
                      value={formAuth.papellido}
                      onChange={handleChangeAuth}
                      required
                    />
                  </div>
                  <div className="input-row">
                    <input
                      className="input-style"
                      name="sapellido"
                      placeholder="Segundo Apellido"
                      value={formAuth.sapellido}
                      onChange={handleChangeAuth}
                    />
                    <select
                      className="input-style"
                      name="barrio"
                      value={formAuth.barrio}
                      onChange={handleChangeAuth}
                    >
                      {barrios.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <input
                      className="input-style"
                      name="telefono"
                      placeholder="Teléfono"
                      value={formAuth.telefono}
                      onChange={handleChangeAuth}
                    />
                  </div>
                </>
              )}

              <div className="input-group">
                <input
                  className="input-style"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formAuth.email}
                  onChange={handleChangeAuth}
                  required
                />
              </div>

              <div className="input-group">
                <input
                  className="input-style"
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  value={formAuth.password}
                  onChange={handleChangeAuth}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="button-style primary"
              >
                {loading ? 'Procesando...' : (isRegister ? 'Registrar' : 'Iniciar Sesión')}
              </button>

              <p className="error-message">{error}</p>
            </form>

            <p className="switch-text">
              {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
              <button
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="link-button-style"
              >
                {isRegister ? 'Iniciar Sesión' : 'Registrarse'}
              </button>
            </p>
          </div>

          <div className="login-right" aria-hidden="true">
            <div className="right-bg-shape"></div>
            <div className="hero-frame">
              <img src={loginImage} alt="Imagen de login" />
            </div>
            <div className="right-small-decor"></div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================
     APP PRINCIPAL
     ======================== */
  return (
    <div className="app-container light">
      {/* Navbar horizontal */}
      <nav className="navbar-horizontal">
        <h3 className="nav-title">DenunciasCR</h3>
        <ul className="nav-list-horizontal">
          <li
            onClick={() => setPagina('instituciones')}
            className={pagina === 'instituciones' ? 'active' : ''}
          >
            Contacto
          </li>
          <li
            onClick={() => setPagina('denuncias')}
            className={pagina === 'denuncias' ? 'active' : ''}
          >
            Denuncias
          </li>
        </ul>
        <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
      </nav>

      <main className="main-content">
        <header className="header">
          <h2 className="welcome">Bienvenido, {user.nombre}!</h2>
        </header>

        <div 
          className="parallax-section" 
          style={{
            backgroundImage: `url(${fpImage})`,
            backgroundAttachment: 'fixed',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.5rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
          }}
        >
          <div className="parallax-text">
            Reporta problemas en tu comunidad y conéctate con las instituciones responsables.
            Tu denuncia llega centralizada y con seguimiento.
          </div>
        </div>

        {pagina === 'instituciones' && (
          <section className="section-style">
            <h3 style={{ marginBottom: 20 }}>Instituciones</h3>
            <ul style={{ paddingLeft: 20 }}>
              {instituciones.map(i => (
                <li key={i.id} style={{ marginBottom: 14, fontSize: 16 }}>
                  <b>{i.nombre}</b> — {i.email || 'Sin email'} — {i.telefono || 'Sin teléfono'} — {i.sitio_web || 'Sin sitio web'}
                </li>
              ))}
            </ul>
          </section>
        )}

        {pagina === 'denuncias' && (
          <section className="section-style">
            <h3 style={{ marginBottom: 30 }}>Enviar denuncia</h3>
            
            {/* Contenedor de dos columnas */}
            <div className="denuncia-container">
              {/* Columna del formulario */}
              <div className="denuncia-form-column">
                <form onSubmit={handleEnviarDenuncia}>
                  <label className="label-style">
                    Tipo de denuncia:
                    <select
                      name="tipo_denuncia"
                      value={formDenuncia.tipo_denuncia}
                      onChange={handleChangeDenuncia}
                      className="input-style"
                    >
                      {tiposDenuncia.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>

                  <label className="label-style">
                    Barrio:
                    <select
                      name="barrio"
                      value={formDenuncia.barrio}
                      onChange={handleChangeDenuncia}
                      className="input-style"
                    >
                      {barrios.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </label>

                  <label className="label-style">
                    Descripción:
                    <textarea
                      name="descripcion"
                      value={formDenuncia.descripcion}
                      onChange={handleChangeDenuncia}
                      rows={5}
                      className="input-style"
                      style={{ resize: 'vertical' }}
                      required
                    />
                  </label>

                  <button type="submit" className="button-style">Enviar denuncia</button>
                </form>
              </div>

              {/* Columna de la imagen */}
              <div className="denuncia-image-column">
                <div className="denuncia-image-container">
                  {/* Cambia 'fpImage' por tu imagen de denuncia o usa una imagen placeholder */}
                  <img 
                    src={fpImage} // Cambia esto por: denunciaImage
                    alt="Ilustración sobre denuncias ciudadanas" 
                    className="denuncia-image"
                  />
                  <div className="image-overlay">
                    <h4>Tu voz importa</h4>
                    <p>Cada denuncia contribuye a mejorar nuestra comunidad. Reporta de manera segura y confidencial.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;