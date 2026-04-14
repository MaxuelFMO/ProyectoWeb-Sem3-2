import { useState } from "react";

function Bienes() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleImportExcel = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setImportResult(null);

    const formData = new FormData(event.target);
    
    try {
      const response = await fetch("/bien/importar-excel", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setImportResult({
          type: "success",
          message: result.message,
          total: result.totalProcesados,
          errores: result.errores || []
        });
      } else {
        setImportResult({
          type: "error",
          message: result.error || "Error al importar",
          errores: result.errores || []
        });
      }
    } catch (error) {
      setImportResult({
        type: "error",
        message: "Error de conexión",
        errores: []
      });
    } finally {
      setIsLoading(false);
    }
  };
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
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827]/95 border border-white/10 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center">
                  <i className="bi bi-file-earmark-spreadsheet text-sky-300 text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Importar desde Excel</h3>
                  <p className="text-sm text-[var(--text-muted)]">Carga masiva de bienes patrimoniales</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-white/70 hover:text-white p-2 -m-2 rounded-2xl hover:bg-white/10 transition"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleImportExcel} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Archivo Excel (.xlsx)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="archivo_excel"
                    accept=".xlsx,.xls"
                    className="w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-500 file:text-white file:cursor-pointer bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Formato: codigo_patrimonial | nombre | descripcion | estado | persona_asignada
                </p>
              </div>

              <div className="bg-gradient-to-r from-sky-500/10 to-emerald-500/10 border border-white/10 rounded-2xl p-4">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <i className="bi bi-info-circle text-sky-400" />
                  Formato esperado
                </h4>
                <div className="text-xs text-[var(--text-muted)] space-y-1">
                  <div className="flex items-center gap-4 p-2 bg-white/5 rounded-xl">
                    <span>CP0001</span>
                    <span>CPU Dell</span>
                    <span>Computadora</span>
                    <span>ACTIVO</span>
                    <span>Juan Pérez</span>
                  </div>
                </div>
              </div>

              {/* Resultado de importación */}
              {importResult && (
                <div className={`p-4 rounded-2xl border ${
                  importResult.type === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/30" 
                    : "bg-orange-500/10 border-orange-500/30"
                }`}>
                  <div className="flex items-start gap-3">
                    <i className={`bi text-xl mt-0.5 ${
                      importResult.type === "success" ? "bi-check-circle text-emerald-400" : "bi-exclamation-triangle text-orange-400"
                    }`} />
                    <div>
                      <p className="font-semibold text-white">{importResult.message}</p>
                      {importResult.errores && importResult.errores.length > 0 && (
                        <ul className="mt-2 text-xs text-[var(--text-muted)] space-y-1 max-h-32 overflow-y-auto">
                          {importResult.errores.map((error, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <i className="bi bi-circle-fill text-xs text-orange-400" />
                              {error}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-600/50 text-white font-semibold py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <i className="bi bi-hourglass-split animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload" />
                      Importar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-6 py-3 border border-white/20 bg-white/5 text-white font-semibold rounded-2xl hover:bg-white/10 transition"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Bienes;
