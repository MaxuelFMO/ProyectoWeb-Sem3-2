'use client';

import { useState, useEffect } from 'react';
import { useHistorial, type HistorialMovimiento } from '@/hooks/use-historial';
import { useToast } from '@/components/providers/toast-provider';
import { Spinner } from '@/components/ui/spinner';
<<<<<<< Updated upstream
import { Search, ChevronLeft, ChevronRight, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

=======
import { Clock, Download, ChevronLeft, ChevronRight, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { APIClient } from '@/lib/api';

interface HistorialItem {
  id_historial: number;
  id_persona: number;
  nombre_persona?: string;
  accion: string;
  descripcion?: string;
  fecha_hora: string;
  usuario_registro?: string;
  id_desplazamiento?: number;
}
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  const loadHistorial = async (pageNum: number, query: string) => {
=======
  // Permitir acceso a todos, el filtrado se hace en el backend
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Cargar usuarios para filtro
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await APIClient.get<any[]>('/personas');
        setUsers(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error('Error cargando usuarios:', err);
      }
    };
    if (user?.tipo_cargo === 'Administrador') {
      loadUsers();
    }
  }, [user]);

  const loadHistorial = async (pageNum: number, userId?: string, searchTerm?: string) => {
>>>>>>> Stashed changes
    setLoading(true);
    setError(null);
    try {
      const res = await getHistorial({
        page: pageNum,
        limit,
        // En caso de que el backend soporte búsqueda por descripción o persona
      });
      
      // Filtrar en cliente si la API no lo soporta
      let filtered = Array.isArray(res.data) ? res.data : [];
      if (query) {
        filtered = res.data.filter(
          (m) =>
            m.accion.toLowerCase().includes(query.toLowerCase()) ||
            m.descripcion?.toLowerCase().includes(query.toLowerCase()) ||
            m.nombre_persona?.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      setMovimientos(filtered);
      setTotal(typeof res.total === 'number' ? res.total : 0);
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

<<<<<<< Updated upstream
  const totalPages = Math.ceil(total / limit);
=======
  const handleDownloadPdf = async () => {
    if (!user) {
      addToast('Inicia sesión para descargar reportes', 'error');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const query = new URLSearchParams();
      if (filterUser) query.append('id_persona', filterUser);
      if (search) query.append('search', search);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/historial/export-pdf?${query.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Error descargando PDF');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historial_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      addToast('PDF descargado exitosamente', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error descargando PDF';
      addToast(message, 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };
>>>>>>> Stashed changes

  const getActionColor = (accion: string) => {
    if (accion.includes('Creado') || accion.includes('Creada'))
      return 'bg-green-600/10 text-green-600';
    if (accion.includes('Actualizado') || accion.includes('Actualizada'))
      return 'bg-blue-600/10 text-blue-600';
    if (accion.includes('Eliminado') || accion.includes('Eliminada'))
      return 'bg-red-600/10 text-red-600';
    return 'bg-gray-600/10 text-gray-600';
  };

<<<<<<< Updated upstream
  const getActionIcon = (accion: string) => {
    if (accion.includes('Creado')) return '➕';
    if (accion.includes('Actualizado')) return '✏️';
    if (accion.includes('Eliminado')) return '❌';
    return '📝';
  };
=======
  const totalPages = Math.ceil(total / limit);

  const chartData = useMemo(() => {
    const stats: Record<string, number> = {
      'Creados': 0,
      'Actualizados': 0,
      'Eliminados': 0,
      'Otros': 0,
    };

    items.forEach((item) => {
      if (item.accion.includes('Creado') || item.accion.includes('Creada')) {
        stats['Creados']++;
      } else if (item.accion.includes('Actualizado') || item.accion.includes('Actualizada')) {
        stats['Actualizados']++;
      } else if (item.accion.includes('Eliminado') || item.accion.includes('Eliminada')) {
        stats['Eliminados']++;
      } else {
        stats['Otros']++;
      }
    });

    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [items]);

  // Eliminado el bloqueo de acceso para usuarios normales
>>>>>>> Stashed changes

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Activity className="text-primary" size={28} />
          <h1 className="text-3xl font-bold text-foreground">Historial de Movimientos</h1>
        </div>
        <p className="text-muted-foreground">
<<<<<<< Updated upstream
          Registro de todas las acciones realizadas en el sistema
        </p>
      </div>

=======
          {user?.id_tipo_cargo === 1 
            ? 'Registro completo de todas las acciones del sistema.' 
            : 'Registro de tus movimientos y acciones en el sistema.'}
        </p>
      </div>

      {/* Chart Card - Only for Admins */}
      {user?.id_tipo_cargo === 1 && (
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Estadísticas de Acciones</CardTitle>
            <CardDescription>Distribución de acciones registradas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#0088FE" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
            {user?.id_tipo_cargo === 1 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Filtrar por usuario</label>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border/40 rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="">Todos los usuarios</option>
                  {users.map((u) => (
                    <option key={u.id_persona} value={u.id_persona}>
                      {u.nombres} {u.apellidos}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border/40 overflow-hidden bg-background/50">
            {loading && items.length === 0 ? (
              <div className="p-12 flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="p-6 text-red-600 text-center text-sm">{error}</div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center">
                <Clock size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No hay registros en el historial</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-background border-b border-border/40">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-foreground">Fecha/Hora</th>
                        <th className="px-6 py-3 text-left font-semibold text-foreground">Usuario</th>
                        <th className="px-6 py-3 text-left font-semibold text-foreground">Acción</th>
                        <th className="px-6 py-3 text-left font-semibold text-foreground">Relación</th>
                        <th className="px-6 py-3 text-left font-semibold text-foreground">Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {items.map((item) => (
                        <tr key={item.id_historial} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-foreground text-xs">
                            {new Date(item.fecha_hora).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-foreground">
                            {item.nombre_persona || item.usuario_registro || 'Sistema'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(item.accion)}`}>
                              {item.accion}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {item.id_desplazamiento ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 px-2 text-[10px] gap-1"
                                onClick={() => router.push(`/dashboard/desplazamientos`)}
                              >
                                <TrendingUp size={10} />
                                Ver Despl.
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-sm">{item.descripcion || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
>>>>>>> Stashed changes

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
