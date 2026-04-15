'use client';

import { useState, useEffect } from 'react';
import { useDisplacements, type Displacement } from '@/hooks/use-displacements';
import { useCatalogs } from '@/hooks/use-catalogs';
import { useToast } from '@/components/providers/toast-provider';
import { Spinner } from '@/components/ui/spinner';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Filter, TrendingUp } from 'lucide-react';
import DisplacementForm from '@/components/domain/displacement-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DesplazamientosPage() {
  const [desplazamientos, setDesplazamientos] = useState<Displacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [selectedDisplacement, setSelectedDisplacement] = useState<Displacement | null>(null);
  const [filterMotivo, setFilterMotivo] = useState<number | ''>('');
  const [filterEstado, setFilterEstado] = useState<number | ''>('');

  const { getDisplacements, deleteDisplacement } = useDisplacements();
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

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro que deseas eliminar este desplazamiento?')) return;

    try {
      await deleteDisplacement(id);
      addToast('Desplazamiento eliminado exitosamente', 'success');
      loadDesplazamientos(page, filterMotivo ? Number(filterMotivo) : undefined, filterEstado ? Number(filterEstado) : undefined);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting displacement';
      addToast(message, 'error');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedDisplacement(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadDesplazamientos(page, filterMotivo ? Number(filterMotivo) : undefined, filterEstado ? Number(filterEstado) : undefined);
  };

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary" size={28} />
          <h1 className="text-3xl font-bold text-foreground">Gestión de Desplazamientos</h1>
        </div>
        <p className="text-muted-foreground">
          Registra y controla movimientos de bienes patrimoniales
        </p>
      </div>

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
            <Button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto gap-2 bg-primary hover:bg-orange-700"
            >
              <Plus size={18} />
              Nuevo desplazamiento
            </Button>
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
                <p className="text-muted-foreground mb-3">No hay desplazamientos registrados</p>
                <Button
                  onClick={() => setShowForm(true)}
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  Crear el primer desplazamiento
                </Button>
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
                                setSelectedDisplacement(disp);
                                setShowForm(true);
                              }}
                              className="inline-flex items-center justify-center p-2 hover:bg-accent/15 text-accent rounded-md transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(disp.id_desplazamiento)}
                              className="inline-flex items-center justify-center p-2 hover:bg-destructive/15 text-destructive rounded-md transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
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

      {/* Form Modal */}
      {showForm && (
        <DisplacementForm
          displacement={selectedDisplacement}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
