import { useEffect, useState } from 'react';
import { BienAPI } from '../api/apiService';

function Bienes() {
  const [bienes, setBienes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBienes();
  }, []);

  const fetchBienes = async () => {
    try {
      const data = await BienAPI.getAll();
      setBienes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando bienes:', error);
      setBienes([]);
    } finally {
      setLoading(false);
    }
  };

  const buenosEstado = bienes.filter(b => b.estado === 1).length;
  const atencion = bienes.filter(b => b.estado === 0).length;

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--text-muted)]">Bienes</p>
            <h2 className="mt-3 text-3xl font-black text-white">Inventario</h2>
          </div>
          <button className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            <i className="bi bi-plus-square-fill text-lg" />
            Nuevo activo
          </button>
        </div>
        <p className="mt-6 max-w-2xl text-[var(--text-muted)]">
          Un sistema minimalista y directo para gestionar bienes con claridad y rendimiento.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-6 text-white">
          <div className="flex items-center gap-3 text-sky-300">
            <i className="bi bi-box-fill text-2xl" />
            <span className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Total</span>
          </div>
          <p className="mt-5 text-4xl font-black">{loading ? '...' : bienes.length}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-6 text-white">
          <div className="flex items-center gap-3 text-emerald-300">
            <i className="bi bi-check2-circle text-2xl" />
            <span className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Salud</span>
          </div>
          <p className="mt-5 text-4xl font-black">{loading ? '...' : buenosEstado}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-6 text-white">
          <div className="flex items-center gap-3 text-orange-300">
            <i className="bi bi-exclamation-triangle-fill text-2xl" />
            <span className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Atención</span>
          </div>
          <p className="mt-5 text-4xl font-black">{loading ? '...' : atencion}</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
        <h3 className="text-xl font-black text-white mb-6">Listado de activos</h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {bienes.map((bien) => (
            <div key={bien.id_bien} className="rounded-2xl border border-white/10 bg-[#0f172a]/80 p-4 hover:bg-white/5 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold text-white">{bien.nombre}</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">{bien.descripcion}</p>
                  <div className="mt-3 flex gap-4">
                    <span className="text-xs bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full">${bien.valor}</span>
                    <span className={`text-xs px-3 py-1 rounded-full ${bien.estado ? 'bg-emerald-500/20 text-emerald-300' : 'bg-orange-500/20 text-orange-300'}`}>
                      {bien.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Bienes;
