import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'bi-house-door-fill' },
  { to: '/personas', label: 'Personas', icon: 'bi-people-fill' },
  { to: '/bienes', label: 'Bienes', icon: 'bi-box-seam' },
  { to: '/historial', label: 'Historial', icon: 'bi-clock-history' },
]

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <aside className="hidden lg:flex lg:w-[320px] flex-col justify-between border-r border-white/10 bg-[var(--bg-card)] text-[var(--text-main)] shadow-[0_0_30px_rgba(5,10,25,0.3)]">
        <div className="p-8 space-y-8">
          <div>
            <span className="inline-flex items-center justify-center rounded-3xl px-3 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-xs uppercase tracking-[0.35em] font-bold text-black shadow-sm">
              Zenda
            </span>

            <h2 className="mt-6 text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
              Panel de Control
            </h2>
            <p className="mt-3 text-[13px] text-[var(--text-muted)] leading-6">
              Accede a Personas, Bienes e Historial con un diseño moderno y responsive.
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-white/10 text-white shadow-lg shadow-cyan-500/10'
                      : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-white'
                  }`
                }
                onClick={onClose}
              >
                <i className={`bi ${item.icon} text-lg`} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-8 border-t border-white/10">
          <div className="text-[var(--text-muted)] text-sm leading-6">
            Navegación creada con Tailwind y colores de global.css.
          </div>
        </div>
      </aside>

      <div className={`fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose} />

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform overflow-y-auto border-r border-white/10 bg-[var(--bg-card)] px-6 py-8 text-[var(--text-main)] shadow-2xl transition-transform duration-300 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-3 py-2 text-xs uppercase tracking-[0.35em] font-bold text-black shadow-sm">
              Zenda
            </span>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20">
            Cerrar
          </button>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Panel</h2>
            <p className="mt-3 text-[var(--text-muted)] leading-6">Navega entre las secciones disponibles.</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-white/10 text-white shadow-lg shadow-cyan-500/10'
                      : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-white'
                  }`
                }
                onClick={onClose}
              >
                <i className={`bi ${item.icon} text-lg`} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar;
