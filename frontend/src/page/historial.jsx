function Historial() {
  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--text-muted)]">Historial</p>
            <h2 className="mt-3 text-3xl font-black text-white">Registro de acciones</h2>
          </div>
          <button className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            <i className="bi bi-clock-history text-lg" />
            Ver todos
          </button>
        </div>
        <p className="mt-6 max-w-2xl text-[var(--text-muted)]">
          Mantén un seguimiento preciso con un diseño concentrado en la información más relevante.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-6 text-white">
          <div className="flex items-center gap-3 text-violet-300">
            <i className="bi bi-journal-text text-2xl" />
            <span className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Eventos</span>
          </div>
          <p className="mt-5 text-4xl font-black">512</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-6 text-white">
          <div className="flex items-center gap-3 text-cyan-300">
            <i className="bi bi-graph-up text-2xl" />
            <span className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Tendencia</span>
          </div>
          <p className="mt-5 text-4xl font-black">+18%</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-6 text-white">
          <div className="flex items-center gap-3 text-orange-300">
            <i className="bi bi-shield-lock-fill text-2xl" />
            <span className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Alertas</span>
          </div>
          <p className="mt-5 text-4xl font-black">12</p>
        </div>
      </div>
    </section>
  );
}

export default Historial;
