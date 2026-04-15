'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useDisplacements, type Displacement } from '@/hooks/use-displacements';
import { useCatalogs } from '@/hooks/use-catalogs';
import { useToast } from '@/components/providers/toast-provider';
import { Spinner } from '@/components/ui/spinner';

interface DisplacementFormProps {
  displacement?: Displacement | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DisplacementForm({
  displacement,
  onClose,
  onSuccess,
}: DisplacementFormProps) {
  const [formData, setFormData] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    id_motivo: 0,
    id_estado: 0,
    id_persona: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createDisplacement, updateDisplacement } = useDisplacements();
  const { motivos, estados } = useCatalogs();
  const { addToast } = useToast();

  useEffect(() => {
    if (displacement) {
      setFormData({
        fecha_inicio: displacement.fecha_inicio.split('T')[0],
        fecha_fin: displacement.fecha_fin ? displacement.fecha_fin.split('T')[0] : '',
        id_motivo: displacement.id_motivo,
        id_estado: displacement.id_estado,
        id_persona: displacement.id_persona || 0,
      });
    }
  }, [displacement]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }
    if (!formData.id_motivo) {
      newErrors.id_motivo = 'El motivo es requerido';
    }
    if (!formData.id_estado) {
      newErrors.id_estado = 'El estado es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
        fecha_fin: formData.fecha_fin
          ? new Date(formData.fecha_fin).toISOString()
          : undefined,
        id_motivo: formData.id_motivo,
        id_estado: formData.id_estado,
        id_persona: formData.id_persona || undefined,
      };

      if (displacement) {
        await updateDisplacement(displacement.id_desplazamiento, payload as any);
        addToast('Desplazamiento actualizado exitosamente', 'success');
      } else {
        await createDisplacement(payload as any);
        addToast('Desplazamiento creado exitosamente', 'success');
      }
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error saving displacement';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
          <h2 className="text-xl font-bold text-foreground">
            {displacement ? 'Editar Desplazamiento' : 'Nuevo Desplazamiento'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              value={formData.fecha_inicio}
              onChange={(e) =>
                setFormData({ ...formData, fecha_inicio: e.target.value })
              }
              className={`w-full px-4 py-2 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all ${
                errors.fecha_inicio
                  ? 'border-red-600 focus:ring-red-600'
                  : 'border-border focus:ring-primary'
              }`}
              disabled={loading}
            />
            {errors.fecha_inicio && (
              <p className="text-xs text-red-600 mt-1">{errors.fecha_inicio}</p>
            )}
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Fecha de Fin
            </label>
            <input
              type="date"
              value={formData.fecha_fin}
              onChange={(e) =>
                setFormData({ ...formData, fecha_fin: e.target.value })
              }
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              disabled={loading}
            />
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Motivo *
            </label>
            <select
              value={formData.id_motivo}
              onChange={(e) =>
                setFormData({ ...formData, id_motivo: Number(e.target.value) })
              }
              className={`w-full px-4 py-2 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all ${
                errors.id_motivo
                  ? 'border-red-600 focus:ring-red-600'
                  : 'border-border focus:ring-primary'
              }`}
              disabled={loading}
            >
              <option value={0}>Selecciona un motivo</option>
              {motivos.map((m) => (
                <option key={m.id_motivo} value={m.id_motivo}>
                  {m.descripcion}
                </option>
              ))}
            </select>
            {errors.id_motivo && (
              <p className="text-xs text-red-600 mt-1">{errors.id_motivo}</p>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Estado *
            </label>
            <select
              value={formData.id_estado}
              onChange={(e) =>
                setFormData({ ...formData, id_estado: Number(e.target.value) })
              }
              className={`w-full px-4 py-2 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all ${
                errors.id_estado
                  ? 'border-red-600 focus:ring-red-600'
                  : 'border-border focus:ring-primary'
              }`}
              disabled={loading}
            >
              <option value={0}>Selecciona un estado</option>
              {estados.map((e) => (
                <option key={e.id_estado} value={e.id_estado}>
                  {e.descripcion}
                </option>
              ))}
            </select>
            {errors.id_estado && (
              <p className="text-xs text-red-600 mt-1">{errors.id_estado}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 disabled:opacity-50 text-foreground rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary hover:bg-orange-700 disabled:opacity-50 text-primary-foreground rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Spinner size="sm" className="text-primary-foreground" />}
              {displacement ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
