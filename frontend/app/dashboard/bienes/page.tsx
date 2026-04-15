'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit2, Trash2, CheckCircle2, XCircle, Users, Club, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/providers/toast-provider';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { APIClient } from '@/lib/api';
import { useCatalogs, type Motivo } from '@/hooks/use-catalogs';
import { usePersons, type Person } from '@/hooks/use-persons';
import { useBienes, type Bien } from '@/hooks/use-bienes';

const initialFormState = {
  nombre: '',
  descripcion: '',
  valor: '',
  id_tipo_bien: '',
};

export default function BienesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { getBienes, getTiposBien, createBien, updateBien, deleteBien, loading: bienesLoading } = useBienes();
  const { getPersons } = usePersons();
  const { motivos } = useCatalogs();

  const [bienes, setBienes] = useState<Bien[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingBien, setEditingBien] = useState<Bien | null>(null);
  const [recipients, setRecipients] = useState<Person[]>([]);
  const [recipientId, setRecipientId] = useState<number | null>(null);
  const [transferMotivo, setTransferMotivo] = useState<number | null>(null);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [loadingIncoming, setLoadingIncoming] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [tiposBien, setTiposBien] = useState<{ id_tipo_bien: number; nombre: string }[]>([]);
  const [searchRecipients, setSearchRecipients] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');

  const hasSelection = selectedIds.length > 0;

  const loadBienes = async () => {
    try {
      const data = await getBienes();
      setBienes(data);
    } catch (error) {
      addToast('No se pudo cargar bienes', 'error');
    }
  };

  const loadTiposBien = async () => {
    try {
      const data = await getTiposBien();
      setTiposBien(data);
    } catch (error) {
      addToast('No se pudo cargar los tipos de bien', 'error');
    }
  };

  const loadRecipients = async () => {
    try {
      const response = await getPersons({ page: 1, limit: 100, search: searchRecipients });
      const filtered = response.data.filter((person) => person.id_persona !== user?.id_persona);
      setRecipients(filtered);
    } catch (error) {
      addToast('No se pudo cargar las personas', 'error');
    }
  };

  const loadIncoming = async () => {
    setLoadingIncoming(true);
    try {
      const data = await APIClient.get<any[]>('/desplazamientos');
      setIncoming(data.filter((item) => item.id_persona_destino === user?.id_persona && item.id_estado === 2));
      setOutgoing(data.filter((item) => item.id_persona_origen === user?.id_persona && item.id_estado === 2));
    } catch (error) {
      addToast('No se pudieron cargar las solicitudes entrantes', 'error');
    } finally {
      setLoadingIncoming(false);
    }
  };

  useEffect(() => {
    loadBienes();
    loadTiposBien();
    loadRecipients();
    loadIncoming();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRecipients();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchRecipients]);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (bien: Bien) => {
    setEditingBien(bien);
    setFormData({
      nombre: bien.nombre,
      descripcion: bien.descripcion || '',
      valor: bien.valor?.toString() || '',
      id_tipo_bien: bien.id_tipo_bien?.toString() || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingBien(null);
    setFormData(initialFormState);
  };

  const handleSaveBien = async () => {
    if (!formData.nombre.trim()) {
      addToast('El nombre del bien es obligatorio', 'error');
      return;
    }

    setLoadingForm(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        valor: formData.valor ? Number(formData.valor) : null,
        id_tipo_bien: formData.id_tipo_bien ? Number(formData.id_tipo_bien) : null,
        estado: true,
      };

      if (editingBien) {
        await updateBien(editingBien.id_bien, payload);
        addToast('Bien actualizado', 'success');
      } else {
        await createBien(payload);
        addToast('Bien creado', 'success');
      }

      setFormData(initialFormState);
      setEditingBien(null);
      loadBienes();
      loadIncoming();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error guardando bien';
      addToast(message, 'error');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleClearForm = () => {
    if (editingBien) return;
    setFormData(initialFormState);
  };

  const handleDelete = async (bien: Bien) => {
    if (!confirm(`¿Eliminar bien ${bien.nombre}?`)) return;
    try {
      await deleteBien(bien.id_bien);
      addToast('Bien eliminado', 'success');
      loadBienes();
      setSelectedIds((prev) => prev.filter((id) => id !== bien.id_bien));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error eliminando bien';
      addToast(message, 'error');
    }
  };

  const filteredBienes = useMemo(() => {
    return bienes.filter((bien) => {
      const query = searchQuery.trim().toLowerCase();
      const value = typeof bien.valor === 'number' ? bien.valor : bien.valor != null && bien.valor !== '' ? Number(bien.valor) : NaN;
      const stateLabel = selectedIds.includes(bien.id_bien) ? 'traslado' : bien.estado ? 'activo' : 'inactivo';
      const typeLabel = bien.tipo_bien_nombre?.toLowerCase() || '';
      const textToSearch = `${bien.nombre} ${bien.descripcion || ''} ${stateLabel} ${typeLabel}`.toLowerCase();

      const matchesSearch = query === '' || textToSearch.includes(query);
      const matchesMin = minValue ? value >= Number(minValue) : true;
      const matchesMax = maxValue ? value <= Number(maxValue) : true;
      return matchesSearch && matchesMin && matchesMax;
    });
  }, [bienes, searchQuery, minValue, maxValue, selectedIds]);

  const filteredBienIds = useMemo(() => filteredBienes.map((bien) => bien.id_bien), [filteredBienes]);
  const allVisibleSelected = filteredBienIds.length > 0 && filteredBienIds.every((id) => selectedIds.includes(id));

  const handleToggleSelect = (bienId: number) => {
    setSelectedIds((prev) =>
      prev.includes(bienId) ? prev.filter((id) => id !== bienId) : [...prev, bienId]
    );
  };

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredBienIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredBienIds])));
    }
  };

  const handleSubmitTransfer = async () => {
    if (!hasSelection) {
      addToast('Selecciona al menos un bien', 'error');
      return;
    }
    if (!recipientId) {
      addToast('Selecciona el destinatario', 'error');
      return;
    }
    if (!transferMotivo) {
      addToast('Selecciona un motivo de traslado', 'error');
      return;
    }

    try {
      await APIClient.post('/desplazamientos', {
        id_persona_destino: recipientId,
        id_motivo: transferMotivo,
        bienes_ids: selectedIds,
      });
      addToast('Solicitud de desplazamiento generada', 'success');
      setSelectedIds([]);
      setTransferMotivo(null);
      loadIncoming();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error creando solicitud';
      addToast(message, 'error');
    }
  };

  const handleIncomingAction = async (id: number, approve: boolean) => {
    try {
      await APIClient.put(`/desplazamientos/${id}/status`, {
        id_estado: approve ? 3 : 1,
      });
      addToast(approve ? 'Solicitud aceptada' : 'Solicitud rechazada', 'success');
      loadBienes();
      loadIncoming();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error actualizando solicitud';
      addToast(message, 'error');
    }
  };

  const handleCancelOutgoing = async (id: number) => {
    if (!confirm('¿Cancelar esta solicitud de traslado?')) return;
    try {
      await APIClient.put(`/desplazamientos/${id}/cancel`);
      addToast('Solicitud cancelada', 'success');
      loadIncoming();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error cancelando solicitud';
      addToast(message, 'error');
    }
  };

  const selectedBienNames = useMemo(() => {
    return bienes.filter((bien) => selectedIds.includes(bien.id_bien)).map((bien) => bien.nombre).join(', ');
  }, [bienes, selectedIds]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Club className="text-primary" size={28} />
          <h1 className="text-3xl font-bold text-foreground">Bienes</h1>
        </div>
        <p className="text-muted-foreground">
          Gestiona tus bienes, solicita desplazamientos y revisa solicitudes entrantes.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="border-border/40">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Mis bienes</CardTitle>
                <CardDescription>{bienes.length} bienes encontrados</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-foreground">Buscar bienes</label>
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Nombre, descripción, tipo o estado"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Valor mínimo</label>
                <Input
                  value={minValue}
                  onChange={(event) => setMinValue(event.target.value)}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Valor máximo</label>
                <Input
                  value={maxValue}
                  onChange={(event) => setMaxValue(event.target.value)}
                  placeholder="99999"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>
            {bienesLoading ? (
              <div className="p-12 flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : filteredBienes.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">No hay bienes registrados. Crea el primero.</div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-border/40">
                  <div className="max-h-[560px] overflow-y-auto">
                    <table className="w-full text-sm whitespace-nowrap">
                      <thead className="bg-background border-b border-border/40 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-foreground w-12">
                            <input
                              type="checkbox"
                              checked={allVisibleSelected}
                              onChange={handleToggleSelectAll}
                              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                            />
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">Nombre</th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">Descripción</th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">Tipo</th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">Valor</th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">Estado</th>
                          <th className="px-4 py-3 text-right font-semibold text-foreground">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {filteredBienes.map((bien) => {
                          const valor = typeof bien.valor === 'number' ? bien.valor : bien.valor != null && bien.valor !== '' ? Number(bien.valor) : NaN;
                          const isTransfer = selectedIds.includes(bien.id_bien) && bien.estado;
                          const stateLabel = isTransfer ? 'Traslado' : bien.estado ? 'Activo' : 'Inactivo';
                          const stateClasses = isTransfer
                            ? 'bg-sky-600/10 text-sky-700'
                            : bien.estado
                            ? 'bg-emerald-600/10 text-emerald-700'
                            : 'bg-rose-600/10 text-rose-700';

                          return (
                            <tr key={bien.id_bien} className="hover:bg-muted/10 transition-colors">
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(bien.id_bien)}
                                  onChange={() => handleToggleSelect(bien.id_bien)}
                                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                                />
                              </td>
                              <td className="px-4 py-3 font-medium text-foreground">{bien.nombre}</td>
                              <td className="px-4 py-3 text-muted-foreground">{bien.descripcion || '-'}</td>
                              <td className="px-4 py-3 text-muted-foreground">{bien.tipo_bien_nombre || '-'}</td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {Number.isFinite(valor) ? `$ ${valor.toFixed(2)}` : '-'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${stateClasses}`}>
                                  {stateLabel}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right space-x-1">
                                <Button variant="secondary" size="sm" onClick={() => handleEdit(bien)}>
                                  <Edit2 size={16} />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(bien)}>
                                  <Trash2 size={16} />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">Seleccionados: {selectedIds.length}</div>
            <Button asChild disabled={!hasSelection}>
              <a href="#solicitud-de-traslado">
                <ArrowRight size={16} /> Solicitar traslado
              </a>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-lg">Formulario de Bien</CardTitle>
            <CardDescription>
              {editingBien ? 'Edita el bien seleccionado' : 'Registra un nuevo bien a tu inventario'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Nombre</label>
                <Input
                  value={formData.nombre}
                  onChange={(event) => handleFormChange('nombre', event.target.value)}
                  placeholder="Nombre del bien"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Descripción</label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(event) => handleFormChange('descripcion', event.target.value)}
                  placeholder="Descripción opcional"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Valor</label>
                  <Input
                    value={formData.valor}
                    onChange={(event) => handleFormChange('valor', event.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Tipo de bien</label>
                  <select
                    value={formData.id_tipo_bien}
                    onChange={(event) => handleFormChange('id_tipo_bien', event.target.value)}
                    className="mt-2 block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-ring"
                  >
                    <option value="">Selecciona un tipo de bien</option>
                    {tiposBien.map((tipo) => (
                      <option key={tipo.id_tipo_bien} value={tipo.id_tipo_bien}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Importar desde Excel</label>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={async (event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (!file) return;
                    setLoadingFile(true);
                    try {
                      const data = new FormData();
                      data.append('file', file);
                      await APIClient.postForm('/bienes/import', data);
                      addToast('Archivo importado correctamente', 'success');
                      loadBienes();
                    } catch (error) {
                      const message = error instanceof Error ? error.message : 'Error importando el archivo';
                      addToast(message, 'error');
                    } finally {
                      setLoadingFile(false);
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button onClick={handleSaveBien} disabled={loadingForm}>
              {editingBien ? 'Guardar cambios' : 'Crear bien'}
            </Button>
            <Button variant="secondary" onClick={handleClearForm} disabled={!!editingBien || loadingForm}>
              Limpiar formulario
            </Button>
            <Button variant="outline" onClick={async () => {
              try {
                const token = APIClient.getToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/bienes/template`, {
                  method: 'GET',
                  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                if (!response.ok) {
                  throw new Error('Error al descargar la plantilla');
                }
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'plantilla_bienes.xlsx';
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (error) {
                const message = error instanceof Error ? error.message : 'Error descargando plantilla';
                addToast(message, 'error');
              }
            }}>
              Descargar plantilla
            </Button>
            {editingBien && (
              <Button variant="secondary" onClick={handleCancelEdit}>
                Cancelar
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <Card id="solicitud-de-traslado" className="border-border/40">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-lg">Solicitud de traslado</CardTitle>
          <CardDescription>
            Envía los bienes seleccionados a otro usuario con el motivo de desplazamiento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">Bienes seleccionados</label>
              <div className="min-h-[3rem] rounded-md border border-border/40 bg-background p-3 text-sm text-muted-foreground">
                {hasSelection ? selectedBienNames : 'Marca los bienes en la lista para trasladarlos.'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Destinatario</label>
              <select
                value={recipientId ?? ''}
                onChange={(event) => setRecipientId(event.target.value ? Number(event.target.value) : null)}
                className="mt-2 block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-ring"
              >
                <option value="">Selecciona una persona</option>
                {recipients.map((person) => (
                  <option key={person.id_persona} value={person.id_persona}>
                    {person.nombres} {person.apellidos}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">Motivo de traslado</label>
              <select
                value={transferMotivo ?? ''}
                onChange={(event) => setTransferMotivo(event.target.value ? Number(event.target.value) : null)}
                className="mt-2 block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-ring"
              >
                <option value="">Selecciona un motivo</option>
                {motivos.map((motivo) => (
                  <option key={motivo.id_motivo} value={motivo.id_motivo}>
                    {motivo.descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={handleSubmitTransfer} disabled={!hasSelection}>
            <ArrowRight size={16} /> Enviar solicitud
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-lg">Solicitudes entrantes</CardTitle>
          <CardDescription>Revisa los bienes que otros usuarios te han enviado y acepta o rechaza.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingIncoming ? (
            <div className="p-8 flex justify-center"><Spinner size="lg" /></div>
          ) : incoming.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No tienes solicitudes pendientes.</div>
          ) : (
            <div className="space-y-3">
              {incoming.map((request) => (
                <div key={request.id_desplazamiento} className="rounded-xl border border-border/40 bg-background p-4 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">De: {request.origen_nombre}</p>
                      <p className="text-sm">{request.razon || 'Sin motivo especificado'}</p>
                      <p className="text-sm text-muted-foreground">Bienes: {request.bienes_nombres || 'No disponible'}</p>
                      <p className="text-sm text-muted-foreground">Fecha solicitada: {new Date(request.fecha_inicio).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleIncomingAction(request.id_desplazamiento, false)}>
                        <XCircle size={16} /> Rechazar
                      </Button>
                      <Button onClick={() => handleIncomingAction(request.id_desplazamiento, true)}>
                        <CheckCircle2 size={16} /> Aceptar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-lg">Solicitudes salientes</CardTitle>
          <CardDescription>Ver tus solicitudes en proceso hacia otros usuarios.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingIncoming ? (
            <div className="p-8 flex justify-center"><Spinner size="lg" /></div>
          ) : outgoing.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No tienes solicitudes salientes en proceso.</div>
          ) : (
            <div className="space-y-3">
              {outgoing.map((request) => (
                <div key={request.id_desplazamiento} className="rounded-xl border border-border/40 bg-background p-4 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Para: {request.destino_nombre}</p>
                      <p className="text-sm">Motivo: {request.motivo || 'Sin motivo especificado'}</p>
                      <p className="text-sm text-muted-foreground">Bienes: {request.bienes_nombres || 'No disponible'}</p>
                      <p className="text-sm text-muted-foreground">Estado: {request.id_estado === 2 ? 'En Proceso' : request.id_estado === 3 ? 'Completado' : request.id_estado === 4 ? 'Cancelado' : 'Rechazado'}</p>
                    </div>
                    {request.id_estado === 2 && (
                      <Button variant="destructive" size="sm" onClick={() => handleCancelOutgoing(request.id_desplazamiento)}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
