import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-main)]">
      <div className="flex min-h-screen">
        <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

        <main className="flex-1">
          <div className="border-b border-white/10 bg-[#0f172a]/90 px-6 py-5 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Administrador</p>
                <h1 className="text-2xl font-black text-white">Panel móvil</h1>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="inline-flex items-center gap-2 rounded-3xl bg-[var(--bg-card)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-white/10"
              >
                <i className="bi bi-list text-lg" />
                <span>Menu</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 lg:p-10">
            <div className="mx-auto max-w-6xl space-y-6">
              <header className="rounded-[36px] border border-white/10 bg-[#111827]/70 p-8 shadow-[0_30px_80px_rgba(8,12,29,0.45)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-[var(--text-muted)]">Administrador</p>
                    <h1 className="mt-4 text-4xl font-black text-white tracking-tight">Dashboard minimalista</h1>
                    <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
                      Sistema moderno para gestores. Navega fácil, revisa estadísticas y accede a tu contenido con claridad.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
                    <button className="inline-flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:border-cyan-400/40 hover:bg-white/10">
                      <i className="bi bi-bar-chart-fill text-lg text-cyan-300" />
                      Analizar
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-cyan-500/20 transition hover:opacity-95">
                      <i className="bi bi-speedometer2 text-lg" />
                      Actualizar
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center gap-2 rounded-3xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 transition hover:bg-red-500/20"
                    >
                      <i className="bi bi-box-arrow-right text-lg" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </header>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout;
