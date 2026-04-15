'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useHistorial, type HistorialMovimiento } from '@/hooks/use-historial';
import { useToast } from '@/components/providers/toast-provider';
import { Spinner } from '@/components/ui/spinner';
import { Search, ChevronLeft, ChevronRight, Clock, Activity, Download, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { APIClient } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function HistorialPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [movimientos, setMovimientos] = useState<HistorialMovimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(15);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [filterUser, setFilterUser] = useState('');

  const { getHistorial } = useHistorial();
  const { addToast } = useToast();

  // Cargar usuarios para filtro (solo admins)
  useEffect(() => {
    const loadUsers = async () => {
      if (user?.id_tipo_cargo !== 1) return;
      try {
        const response = await APIClient.get<any[]>('/personas');
        setUsers(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error('Error cargando usuarios:', err);
      }
    };
    loadUsers();
  }, [user]);

  const loadHistorial = async (pageNum: number, userId?: string, searchTerm?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHistorial({
        page: pageNum,
        limit,
        id_persona: userId || undefined,
        search: searchTerm || undefined
      });
      
      setMovimientos(Array.isArray(res.data) ? res.data : []);
      setTotal(typeof res.total === 'number' ? res.total : 0);
      setPage(pageNum);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error cargando historial';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistorial(1, filterUser, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterUser]);

  const handleDownloadPdf = async () => {
    if (!user) {
      addToast('Inicia sesión para descargar reportes', 'error');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterUser) queryParams.append('id_persona', filterUser);
      if (search) queryParams.append('search', search);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/historial/export-pdf?${queryParams.toString()}`,
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
      
      // Recargar para ver el log de exportación
      loadHistorial(1, filterUser, search);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error descargando PDF';
      addToast(message, 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getActionColor = (accion: string) => {
    if (accion.includes('Creado') || accion.includes('Creada'))
      return 'bg-green-600/10 text-green-600 border-green-600/20';
    if (accion.includes('Actualizado') || accion.includes('Actualizada') || accion.includes('Actualización'))
      return 'bg-blue-600/10 text-blue-600 border-blue-600/20';
    if (accion.includes('Eliminado') || accion.includes('Eliminada'))
      return 'bg-red-600/10 text-red-600 border-red-600/20';
    if (accion.includes('Reporte') || accion.includes('Exportado'))
      return 'bg-purple-600/10 text-purple-600 border-purple-600/20';
    return 'bg-gray-600/10 text-gray-600 border-gray-600/20';
  };

  const totalPages = Math.ceil(total / limit);

  const chartData = useMemo(() => {
    const stats: Record<string, number> = {
      'Creados': 0,
      'Actualizados': 0,
      'Eliminados': 0,
      'Otros': 0,
    };

    movimientos.forEach((item) => {
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
  }, [movimientos]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Activity className="text-primary" size={28} />
            <h1 className="text-3xl font-bold text-foreground">Historial de Movimientos</h1>
          </div>
          <p className="text-muted-foreground">
            {user?.id_tipo_cargo === 1 
              ? 'Registro completo de todas las acciones del sistema.' 
              : 'Registro de tus movimientos y acciones en el sistema.'}
          </p>
        </div>
        <Button 
          onClick={handleDownloadPdf} 
          disabled={isGeneratingPdf || loading}
          className="shadow-md hover:shadow-lg transition-all"
        >
          {isGeneratingPdf ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <Download size={18} className="mr-2" />
          )}
          Exportar PDF
        </Button>
      </div>

      {/* Chart Card - Only for Admins */}
      {user?.id_tipo_cargo === 1 && movimientos.length > 0 && (
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Distribución de Acciones</CardTitle>
            <CardDescription>Resumen de actividades en la página actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Buscar por acción, descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            {user?.id_tipo_cargo === 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Persona:</span>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Todos</option>
                  {users.map(u => (
                    <option key={u.id_persona} value={u.id_persona}>
                      {u.nombres} {u.apellidos}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border/40">
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Fecha y Hora</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Usuario</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Acción</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Descripción</th>
                  <th className="px-6 py-4 text-right font-semibold text-foreground">Relación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading && movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Spinner size="lg" />
                        <span className="text-muted-foreground">Cargando registros...</span>
                      </div>
                    </td>
                  </tr>
                ) : movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-muted-foreground">
                      <Activity size={40} className="mx-auto mb-4 opacity-20" />
                      No se encontraron movimientos registrados.
                    </td>
                  </tr>
                ) : (
                  movimientos.map((mov) => (
                    <tr key={mov.id_historial} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium">{new Date(mov.fecha_hora).toLocaleDateString()}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(mov.fecha_hora).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {(mov.nombre_persona || mov.usuario_registro || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{mov.nombre_persona || 'Desconocido'}</span>
                            <span className="text-[10px] text-muted-foreground">{mov.usuario_registro}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getActionColor(mov.accion)}`}>
                          {mov.accion}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <p className="line-clamp-2 text-foreground/80">{mov.descripcion || '-'}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {mov.id_desplazamiento ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-primary hover:bg-primary/10"
                            onClick={() => router.push('/dashboard/desplazamientos')}
                          >
                            <TrendingUp size={14} className="mr-1.5" />
                            Ver Ref.
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t border-border/40">
              <p className="text-sm text-muted-foreground">
                Mostrando <span className="font-medium">{(page - 1) * limit + 1}</span> a <span className="font-medium">{Math.min(page * limit, total)}</span> de <span className="font-medium">{total}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadHistorial(page - 1, filterUser, search)}
                  disabled={page === 1}
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = page;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        className="w-9 h-9"
                        onClick={() => loadHistorial(pageNum, filterUser, search)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadHistorial(page + 1, filterUser, search)}
                  disabled={page === totalPages}
                >
                  Siguiente
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
