'use client';

import { useState, useEffect } from 'react';
import { useHistorial, type HistorialMovimiento } from '@/hooks/use-historial';
import { useToast } from '@/components/providers/toast-provider';
import { Spinner } from '@/components/ui/spinner';
import { Search, ChevronLeft, ChevronRight, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function HistorialPage() {
  const [movimientos, setMovimientos] = useState<HistorialMovimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(15);

  const { getHistorial } = useHistorial();
  const { addToast } = useToast();

  const loadHistorial = async (pageNum: number, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHistorial({
        page: pageNum,
        limit,
        // En caso de que el backend soporte búsqueda por descripción o persona
      });
      
      // Filtrar en cliente si la API no lo soporta
      let filtered = res.data;
      if (query) {
        filtered = res.data.filter(
          (m) =>
            m.accion.toLowerCase().includes(query.toLowerCase()) ||
            m.descripcion?.toLowerCase().includes(query.toLowerCase()) ||
            m.nombre_persona?.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      setMovimientos(filtered);
      setTotal(res.total);
      setPage(pageNum);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading historial';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistorial(1, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const totalPages = Math.ceil(total / limit);

  const getActionColor = (accion: string) => {
    if (accion.includes('Creado') || accion.includes('Creada'))
      return 'bg-green-600/10 text-green-600';
    if (accion.includes('Actualizado') || accion.includes('Actualizada'))
      return 'bg-blue-600/10 text-blue-600';
    if (accion.includes('Eliminado') || accion.includes('Eliminada'))
      return 'bg-red-600/10 text-red-600';
    return 'bg-gray-600/10 text-gray-600';
  };

  const getActionIcon = (accion: string) => {
    if (accion.includes('Creado')) return '➕';
    if (accion.includes('Actualizado')) return '✏️';
    if (accion.includes('Eliminado')) return '❌';
    return '📝';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Activity className="text-primary" size={28} />
          <h1 className="text-3xl font-bold text-foreground">Historial de Movimientos</h1>
        </div>
        <p className="text-muted-foreground">
          Registro de todas las acciones realizadas en el sistema
        </p>
      </div>

      {/* Main Card */}
      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-lg">Auditoría de Sistema</CardTitle>
          <CardDescription>
            {total} registros en total
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Search Bar */}
          <div className="pt-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Buscar por acción, descripción o usuario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background border-border/40"
              />
            </div>
          </div>

          {/* Timeline */}
          {loading && movimientos.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-center text-sm">
              {error}
            </div>
          ) : movimientos.length === 0 ? (
            <div className="p-12 text-center">
              <Activity size={32} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No hay movimientos registrados</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {movimientos.map((movimiento, index) => (
                  <div
                    key={movimiento.id_historial}
                    className="flex gap-4 p-4 rounded-lg border border-border/40 hover:border-accent/50 hover:bg-muted/20 transition-all"
                  >
                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`w-9 h-9 rounded-full border-2 border-border/40 flex items-center justify-center text-sm font-semibold flex-shrink-0 ${getActionColor(
                          movimiento.accion
                        )}`}
                      >
                        {getActionIcon(movimiento.accion)}
                      </div>
                      {index < movimientos.length - 1 && (
                        <div className="w-0.5 h-10 bg-border/40 mt-1"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">{movimiento.accion}</h3>
                          <p className="text-xs text-muted-foreground">
                            {movimiento.nombre_persona || 'Usuario'}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap border ${
                            getActionColor(movimiento.accion).includes('green')
                              ? 'border-green-600/20'
                              : getActionColor(movimiento.accion).includes('blue')
                              ? 'border-blue-600/20'
                              : getActionColor(movimiento.accion).includes('red')
                              ? 'border-red-600/20'
                              : 'border-gray-600/20'
                          } ${getActionColor(movimiento.accion).replace('bg-', 'bg-').replace('/10', '/15')}`}
                        >
                          {movimiento.accion}
                        </span>
                      </div>

                      {movimiento.descripcion && (
                        <p className="text-sm text-foreground/80 mb-2">
                          {movimiento.descripcion}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <Clock size={13} />
                          {new Date(movimiento.fecha_hora).toLocaleString()}
                        </div>
                        {movimiento.usuario_registro && (
                          <div>Registrado por: <span className="text-foreground/60">{movimiento.usuario_registro}</span></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between text-sm gap-4 flex-wrap">
                  <p className="text-muted-foreground">
                    Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de{' '}
                    {total} resultados
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => loadHistorial(page - 1, search)}
                      disabled={page === 1}
                      className="p-2 hover:bg-muted rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
                      title="Página anterior"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))
                      .map((p) => (
                        <button
                          key={p}
                          onClick={() => loadHistorial(p, search)}
                          className={`px-3 py-1 rounded-md text-sm transition-colors ${
                            p === page
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    <button
                      onClick={() => loadHistorial(page + 1, search)}
                      disabled={page === totalPages}
                      className="p-2 hover:bg-muted rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
                      title="Página siguiente"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
