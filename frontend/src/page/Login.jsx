import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nombre, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar token y usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nombre, password, apellidos: '' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      setError('');
      setNombre('');
      setPassword('');
      alert('Usuario registrado. Ahora inicia sesión.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'demo', password: 'demo' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al acceder con demo');
      }

      // Guardar token y usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/');
    } catch (err) {
      setError('No se pudo acceder con demo. ¿Backend está corriendo en 3000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <i className="bi bi-box-seam text-4xl text-indigo-500" />
              <h1 className="text-3xl font-black text-white">Zenda</h1>
            </div>
            <p className="text-[var(--text-muted)] text-sm">Sistema de gestión patrimonial</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Usuario</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre de usuario"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 transition disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#111827] text-[var(--text-muted)]">O</span>
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Crear nuevo usuario'}
          </button>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mt-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <i className="bi bi-play-circle-fill" />
            {loading ? 'Cargando...' : 'Acceso Demo (demo/demo)'}
          </button>

          <p className="text-xs text-[var(--text-muted)] text-center mt-6">
            Sistema seguro con autenticación JWT
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
