import { useEffect, useState } from 'react';
import { UserAPI, ProductAPI } from '../api/apiService';
import ProductManagement from '../components/ProductManagement';
import UserManagement from '../components/UserManagement';

function Administrador() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [userData, productData] = await Promise.all([UserAPI.getAll(), ProductAPI.getAll()]);
      setUsers(Array.isArray(userData) ? userData : []);
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setUsers([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--text-muted)]">Resumen rápido</p>
              <h2 className="mt-3 text-3xl font-black text-white">Estado del sistema</h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-cyan-500/20">
              <i className="bi bi-speedometer2 text-lg" />
              En vivo
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-6 text-white">
              <div className="flex items-center gap-3 text-sky-300">
                <i className="bi bi-people-fill text-2xl" />
                <span className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Personas</span>
              </div>
              <p className="mt-5 text-4xl font-black">{loading ? '...' : users.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-6 text-white">
              <div className="flex items-center gap-3 text-emerald-300">
                <i className="bi bi-box-seam text-2xl" />
                <span className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Bienes</span>
              </div>
              <p className="mt-5 text-4xl font-black">{loading ? '...' : products.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-6 text-white">
              <div className="flex items-center gap-3 text-amber-300">
                <i className="bi bi-graph-up text-2xl" />
                <span className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Crecimiento</span>
              </div>
              <p className="mt-5 text-4xl font-black">+12%</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-6 text-white">
              <div className="flex items-center gap-3 text-[var(--text-muted)]">
                <i className="bi bi-shield-fill-check text-lg text-emerald-300" />
                <span className="font-semibold text-white">Seguridad</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
                Revisa accesos recientes y mantén los datos protegidos.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-6 text-white">
              <div className="flex items-center gap-3 text-[var(--text-muted)]">
                <i className="bi bi-lightning-charge-fill text-lg text-yellow-400" />
                <span className="font-semibold text-white">Rendimiento</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
                Gestiona flujos con un rendimiento óptimo y tiempos reducidos.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[var(--text-muted)]">Atajos</p>
                <h3 className="mt-3 text-2xl font-black text-white">Operaciones rápidas</h3>
              </div>
              <i className="bi bi-lightning-charge-fill text-3xl text-yellow-400" />
            </div>
            <div className="mt-6 space-y-3">
              <button className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm text-white transition hover:bg-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Personas populares</p>
                    <span className="text-[var(--text-muted)]">Ver registros recientes</span>
                  </div>
                  <i className="bi bi-chevron-right text-lg" />
                </div>
              </button>
              <button className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm text-white transition hover:bg-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Inventario crítico</p>
                    <span className="text-[var(--text-muted)]">Revisar activos con alerta</span>
                  </div>
                  <i className="bi bi-chevron-right text-lg" />
                </div>
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--text-muted)]">Nota</p>
            <div className="mt-5 space-y-4 rounded-[28px] bg-[#0f172a]/90 p-5">
              <p className="text-sm leading-6 text-[var(--text-muted)]">Mantén actualizados los perfiles y verifica el historial antes de cerrar el día.</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">Un dashboard minimalista ayuda a reducir distracciones y acelerar decisiones.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <UserManagement users={users} onUpdate={fetchData} />
        <ProductManagement products={products} onUpdate={fetchData} />
      </div>
    </section>
  );
}

export default Administrador;
