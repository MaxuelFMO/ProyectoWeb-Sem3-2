'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/providers/toast-provider';
import { Spinner } from '@/components/ui/spinner';
import { Clock, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { APIClient } from '@/lib/api';

interface HistorialItem {
  id_historial: number;
  id_persona: number;
  nombre_persona?: string;
  accion: string;
  descripcion?: string;
  fecha_hora: string;
  usuario_registro?: string;
}

export default function HistorialPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { addToast } = useToast();

  // Verificar si es administrador
  useEffect(() => {
    if (user && user.tipo_cargo !== 'Administrador') {
      addToast('Acceso denegado. Solo administradores pueden ver el historial.', 'error');
      router.push('/dashboard');
    }
  }, [user, router, addToast]);

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
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      });

      if (userId) query.append('id_persona', userId);
      if (searchTerm) query.append('search', searchTerm);

      const response = await APIClient.get<any>(`/historial?${query.toString()}`);
      const data = response.data || [];

      setItems(Array.isArray(data) ? data : []);
      setTotal(response.total || 0);
      setPage(pageNum);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error cargando historial';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar cuando cambia el filtro de usuario
  useEffect(() => {
    loadHistorial(1, filterUser || undefined, search || undefined);
  }, [filterUser]);

  // Cargar cuando cambia la búsqueda (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistorial(1, filterUser || undefined, search || undefined);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDownloadPdf = async () => {
    if (!user?.tipo_cargo || user.tipo_cargo !== 'Administrador') {
      addToast('No tienes permiso para descargar reportes', 'error');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const query = new URLSearchParams();
      if (filterUser) query.append('id_persona', filterUser);
      if (search) query.append('search', search);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/historial/export-pdf?${query.toString()}`,
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

  const getActionColor = (accion: string) => {
    if (accion.includes('Creado') || accion.includes('Creada')) return 'bg-green-600/10 text-green-600';
    if (accion.includes('Actualizado') || accion.includes('Actualizada')) return 'bg-blue-600/10 text-blue-600';
    if (accion.includes('Eliminado') || accion.includes('Eliminada')) return 'bg-red-600/10 text-red-600';
    return 'bg-gray-600/10 text-gray-600';
  };

  const totalPages = Math.ceil(total / limit);

  if (user && user.tipo_cargo !== 'Administrador') {
    return (
      <div className="space-y-6">
        <Card className="border-red-600/20">
          <CardContent className="pt-6">
            <p className="text-red-600">No tienes permiso para acceder a esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Clock className="text-primary" size={28} />
          <h1 className="text-3xl font-bold text-foreground">Historial de Movimientos</h1>
        </div>
        <p className="text-muted-foreground">
          Registro completo de todas las acciones del sistema. Solo visible para administradores.
        </p>
      </div>

      {/* Main Card */}
      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Movimientos del Sistema</CardTitle>
              <CardDescription>{total} registros en total</CardDescription>
            </div>
            <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="gap-2">
              <Download size={16} />
              {isGeneratingPdf ? 'Descargando...' : 'Descargar PDF'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Filters */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Buscar</label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Acción, descripción..."
              />
            </div>
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
                          <td className="px-6 py-4 text-muted-foreground text-sm">{item.descripcion || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-border/40 flex items-center justify-between text-sm gap-4 flex-wrap">
                  <p className="text-muted-foreground">
                    Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total} resultados
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => loadHistorial(page - 1, filterUser || undefined, search || undefined)}
                      disabled={page === 1}
                      className="p-2 hover:bg-muted rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, page - 2) + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => loadHistorial(pageNum, filterUser || undefined, search || undefined)}
                          className={`px-3 py-1 rounded-md text-sm transition-colors ${
                            pageNum === page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => loadHistorial(page + 1, filterUser || undefined, search || undefined)}
                      disabled={page === totalPages}
                      className="p-2 hover:bg-muted rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

