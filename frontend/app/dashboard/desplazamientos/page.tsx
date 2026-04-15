'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDisplacements, type Displacement } from '@/hooks/use-displacements';
import { useCatalogs } from '@/hooks/use-catalogs';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/providers/toast-provider';
import { Spinner } from '@/components/ui/spinner';
import { ChevronLeft, ChevronRight, TrendingUp, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function DesplazamientosPage() {
  const { user } = useAuth();
  const [desplazamientos, setDesplazamientos] = useState<Displacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [filterMotivo, setFilterMotivo] = useState<number | ''>('');
  const [filterEstado, setFilterEstado] = useState<number | ''>('');
  const [selectedDisplacementForModal, setSelectedDisplacementForModal] = useState<Displacement | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { getDisplacements } = useDisplacements();
  const { motivos, estados } = useCatalogs();
  const { addToast } = useToast();

  const loadDesplazamientos = async (pageNum: number, motivo?: number, estado?: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDisplacements({
        page: pageNum,
        limit,
        id_motivo: motivo,
        id_estado: estado,
      });
      setDesplazamientos(Array.isArray(res.data) ? res.data : []);
      setTotal(typeof res.total === 'number' ? res.total : 0);
      setPage(pageNum);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading displacements';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesplazamientos(
      1,
      filterMotivo ? Number(filterMotivo) : undefined,
      filterEstado ? Number(filterEstado) : undefined
    );
  }, [filterMotivo, filterEstado]);

  const totalPages = Math.ceil(total / limit);

  const getMotivoLabel = (id: number) => {
    return motivos.find((m) => m.id_motivo === id)?.descripcion || 'Desconocido';
  };

  const getEstadoLabel = (id: number) => {
    return estados.find((e) => e.id_estado === id)?.descripcion || 'Desconocido';
  };

  const getEstadoColor = (id: number) => {
    const estado = estados.find((e) => e.id_estado === id);
    if (!estado) return 'gray';
    if (estado.descripcion.includes('Activo')) return 'green';
    if (estado.descripcion.includes('Completado')) return 'blue';
    if (estado.descripcion.includes('Cancelado')) return 'red';
    return 'gray';
  };

  const chartData = useMemo(() => {
    const stats = desplazamientos.reduce((acc, disp) => {
      const estado = getEstadoLabel(disp.id_estado);
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [desplazamientos, estados]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary" size={28} />
          <h1 className="text-3xl font-bold text-foreground">Mis Desplazamientos</h1>
        </div>
        <p className="text-muted-foreground">
          Revisa tus solicitudes de traslado de bienes, tanto enviadas como recibidas.
        </p>
      </div>

      {/* Chart */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Estadísticas de Desplazamientos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Main Card */}
      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Lista de Desplazamientos</CardTitle>
              <CardDescription>
                {total} registros en total
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Filters */}
          <div className="pt-6 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground uppercase tracking-wide mb-2">
                Filtrar por motivo
              </label>
              <select
                value={filterMotivo}
                onChange={(e) => setFilterMotivo(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 bg-background border border-border/40 rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Todos los motivos</option>
                {motivos.map((m) => (
                  <option key={m.id_motivo} value={m.id_motivo}>
                    {m.descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground uppercase tracking-wide mb-2">
                Filtrar por estado
              </label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 bg-background border border-border/40 rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Todos los estados</option>
                {estados.map((e) => (
                  <option key={e.id_estado} value={e.id_estado}>
                    {e.descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border/40 overflow-hidden bg-background/50">
            {loading && desplazamientos.length === 0 ? (
              <div className="p-12 flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="p-6 text-red-600 text-center text-sm">{error}</div>
            ) : desplazamientos.length === 0 ? (
              <div className="p-12 text-center">
                <TrendingUp size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No hay desplazamientos registrados</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-background border-b border-border/40">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-foreground">
                          Fecha inicio
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-foreground">
                          Fecha fin
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-foreground">
                          Motivo
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-foreground">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right font-semibold text-foreground">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {desplazamientos.map((disp) => (
                        <tr key={disp.id_desplazamiento} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-foreground font-medium">
                            {new Date(disp.fecha_inicio).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-foreground">
                            {disp.fecha_fin
                              ? new Date(disp.fecha_fin).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="px-6 py-4 text-foreground">
                            {getMotivoLabel(disp.id_motivo)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(disp.id_estado) === 'green'
                                  ? 'bg-green-600/15 text-green-600 border-green-600/20'
                                  : getEstadoColor(disp.id_estado) === 'blue'
                                    ? 'bg-blue-600/15 text-blue-600 border-blue-600/20'
                                    : getEstadoColor(disp.id_estado) === 'red'
                                      ? 'bg-red-600/15 text-red-600 border-red-600/20'
                                      : 'bg-gray-600/15 text-gray-600 border-gray-600/20'
                                }`}
                            >
                              {getEstadoLabel(disp.id_estado)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-1">
                            <button
                              onClick={() => {
                                setSelectedDisplacementForModal(disp);
                                setShowModal(true);
                              }}
                              className="inline-flex items-center justify-center p-2 hover:bg-accent/15 text-accent rounded-md transition-colors"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-border/40 flex items-center justify-between text-sm gap-4 flex-wrap">
                  <p className="text-muted-foreground">
                    Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total}{' '}
                    resultados
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        loadDesplazamientos(
                          page - 1,
                          filterMotivo ? Number(filterMotivo) : undefined,
                          filterEstado ? Number(filterEstado) : undefined
                        )
                      }
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
                          onClick={() =>
                            loadDesplazamientos(
                              p,
                              filterMotivo ? Number(filterMotivo) : undefined,
                              filterEstado ? Number(filterEstado) : undefined
                            )
                          }
                          className={`px-3 py-1 rounded-md text-sm transition-colors ${p === page
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-foreground'
                            }`}
                        >
                          {p}
                        </button>
                      ))}
                    <button
                      onClick={() =>
                        loadDesplazamientos(
                          page + 1,
                          filterMotivo ? Number(filterMotivo) : undefined,
                          filterEstado ? Number(filterEstado) : undefined
                        )
                      }
                      disabled={page === totalPages}
                      className="p-2 hover:bg-muted rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
                      title="Página siguiente"
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

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Desplazamiento</DialogTitle>
            <DialogDescription>
              Información completa del desplazamiento seleccionado.
            </DialogDescription>
          </DialogHeader>
          {selectedDisplacementForModal && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    De (Origen)
                  </p>
                  <p className="text-sm font-medium">
                    {(selectedDisplacementForModal as any).origen_nombre || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Para (Destino)
                  </p>
                  <p className="text-sm font-medium">
                    {(selectedDisplacementForModal as any).destino_nombre || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Fecha de Inicio
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(selectedDisplacementForModal.fecha_inicio).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Motivo
                  </p>
                  <p className="text-sm font-medium">{getMotivoLabel(selectedDisplacementForModal.id_motivo)}</p>
                </div>
                {selectedDisplacementForModal.fecha_fin && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Fecha de Fin
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(selectedDisplacementForModal.fecha_fin).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Estado
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(selectedDisplacementForModal.id_estado) === 'green'
                        ? 'bg-green-600/15 text-green-600 border-green-600/20'
                        : getEstadoColor(selectedDisplacementForModal.id_estado) === 'blue'
                          ? 'bg-blue-600/15 text-blue-600 border-blue-600/20'
                          : getEstadoColor(selectedDisplacementForModal.id_estado) === 'red'
                            ? 'bg-red-600/15 text-red-600 border-red-600/20'
                            : 'bg-gray-600/15 text-gray-600 border-gray-600/20'
                      }`}
                  >
                    {getEstadoLabel(selectedDisplacementForModal.id_estado)}
                  </span>
                </div>
              </div>

              {/* Bienes */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-foreground mb-3">Bienes Desplazados</p>
                <div className="space-y-2">
                  {(selectedDisplacementForModal as any).bienes_nombres && (selectedDisplacementForModal as any).bienes_valores ? (
                    <>
                      {(selectedDisplacementForModal as any).bienes_nombres.split(', ').map((name: string, index: number) => {
                        const valores = (selectedDisplacementForModal as any).bienes_valores.split(', ');
                        const valor = parseFloat(valores[index]) || 0;
                        return (
                          <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm">
                            <span className="text-foreground">{name}</span>
                            <span className="font-medium text-primary">${valor.toFixed(2)}</span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between items-center p-3 bg-primary/10 border border-primary/20 rounded-lg mt-3">
                        <span className="font-semibold text-foreground">Total Estimado</span>
                        <span className="text-lg font-bold text-primary">
                          $
                          {(selectedDisplacementForModal as any).bienes_valores
                            .split(', ')
                            .reduce((sum: number, val: string) => sum + (parseFloat(val) || 0), 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">No hay bienes asociados</p>
                  )}
                </div>
              </div>

              {/* Razón */}
              {(selectedDisplacementForModal as any).razon && (
                <div className="border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Razón / Notas
                  </p>
                  <p className="text-sm text-foreground">{(selectedDisplacementForModal as any).razon}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
