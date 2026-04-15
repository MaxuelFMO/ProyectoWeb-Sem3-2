'use client';

import { useState, useEffect } from 'react';
import { usePersons, type Person } from '@/hooks/use-persons';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/providers/toast-provider';
import { Spinner } from '@/components/ui/spinner';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import PersonForm from '@/components/domain/person-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.id_tipo_cargo === 1;
  const { getPersons, deletePerson } = usePersons();
  const { addToast } = useToast();

  const loadPersonas = async (pageNum: number, searchQuery: string, estadoQuery?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPersons({
        page: pageNum,
        limit,
        search: searchQuery || undefined,
        estado: estadoQuery || undefined,
      });
      setPersonas(Array.isArray(res.data) ? res.data : []);
      setTotal(typeof res.total === 'number' ? res.total : 0);
      setPage(pageNum);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading personas';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPersonas(1, search, filterEstado);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterEstado]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro que deseas eliminar esta persona?')) return;

    try {
      await deletePerson(id);
      addToast('Persona eliminada exitosamente', 'success');
      loadPersonas(page, search);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting person';
      addToast(message, 'error');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPerson(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadPersonas(page, search);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Users className="text-primary" size={28} />
          <h1 className="text-3xl font-bold text-foreground">Gestión de Personas</h1>
        </div>
        <p className="text-muted-foreground">
          Administra los usuarios responsables del patrimonio y acceso al sistema
        </p>
      </div>

      {/* Main Card */}
      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Lista de Personas</CardTitle>
              <CardDescription>
                {total} registros en total
              </CardDescription>
            </div>
            {isAdmin && (
              <Button
                onClick={() => setShowForm(true)}
                className="w-full sm:w-auto gap-2 bg-primary hover:bg-orange-700"
              >
                <Plus size={18} />
                Nueva persona
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Search Bar */}
          <div className="pt-6 pb-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Buscar por nombre o apellido..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background border-border/40"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border/40 overflow-hidden bg-background/50">
            {loading && personas.length === 0 ? (
              <div className="p-12 flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="p-6 text-red-600 text-center text-sm">{error}</div>
            ) : personas.length === 0 ? (
              <div className="p-12 text-center">
                <Users size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground mb-3">No hay personas registradas</p>
                {isAdmin && (
                  <Button
                    onClick={() => setShowForm(true)}
                    variant="outline"
                    className="border-primary/50 text-primary hover:bg-primary/10"
                  >
                    Crear la primera persona
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-background border-b border-border/40">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-foreground">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-foreground">
                          Apellido
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-foreground">
                          Dirección
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
                      {personas.map((persona) => (
                        <tr key={persona.id_persona} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-foreground font-medium">{persona.nombres}</td>
                          <td className="px-6 py-4 text-foreground">{persona.apellidos}</td>
                          <td className="px-6 py-4 text-muted-foreground text-sm">
                            {persona.direccion || '-'}
                          </td>
                          <td className="px-6 py-4">
                            {persona.estado ? (
                              <span className="px-2 py-1 bg-green-600/15 text-green-600 rounded-full text-xs font-medium border border-green-600/20">
                                Activo
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-600/15 text-red-600 rounded-full text-xs font-medium border border-red-600/20">
                                Inactivo
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-1">
                            {isAdmin ? (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedPerson(persona);
                                    setShowForm(true);
                                  }}
                                  className="inline-flex items-center justify-center p-2 hover:bg-accent/15 text-accent rounded-md transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(persona.id_persona)}
                                  className="inline-flex items-center justify-center p-2 hover:bg-destructive/15 text-destructive rounded-md transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">Solo lectura</span>
                            )}
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
                      onClick={() => loadPersonas(page - 1, search)}
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
                          onClick={() => loadPersonas(p, search)}
                          className={`px-3 py-1 rounded-md text-sm transition-colors ${p === page
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-foreground'
                            }`}
                        >
                          {p}
                        </button>
                      ))}
                    <button
                      onClick={() => loadPersonas(page + 1, search)}
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
        <PersonForm
          person={selectedPerson}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
