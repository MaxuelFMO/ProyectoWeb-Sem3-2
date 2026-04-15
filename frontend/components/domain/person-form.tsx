'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePersons, type Person } from '@/hooks/use-persons';
import { useToast } from '@/components/providers/toast-provider';
import { Spinner } from '@/components/ui/spinner';

interface PersonFormProps {
  person?: Person | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PersonForm({ person, onClose, onSuccess }: PersonFormProps) {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    fecha_nacimiento: '',
    direccion: '',
    password: '',
    estado: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createPerson, updatePerson } = usePersons();
  const { addToast } = useToast();

  useEffect(() => {
    if (person) {
      setFormData({
        nombres: person.nombres,
        apellidos: person.apellidos,
        correo: person.correo || '',
        fecha_nacimiento: person.fecha_nacimiento || '',
        direccion: person.direccion || '',
        password: '',
        estado: person.estado,
      });
    }
  }, [person]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'El nombre es requerido';
    }
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'El apellido es requerido';
    }
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    }
    if (!person && !formData.password) {
      newErrors.password = 'La contraseña es requerida para nueva persona';
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
      if (person) {
        await updatePerson(person.id_persona, {
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          correo: formData.correo,
          fecha_nacimiento: formData.fecha_nacimiento,
          direccion: formData.direccion,
          estado: formData.estado,
        } as any);
        addToast('Persona actualizada exitosamente', 'success');
      } else {
        await createPerson({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          correo: formData.correo,
          fecha_nacimiento: formData.fecha_nacimiento,
          direccion: formData.direccion,
          password: formData.password,
        } as any);
        addToast('Persona creada exitosamente', 'success');
      }
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error saving person';
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
            {person ? 'Editar Persona' : 'Nueva Persona'}
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
          {/* Nombres */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombres *
            </label>
            <input
              type="text"
              value={formData.nombres}
              onChange={(e) =>
                setFormData({ ...formData, nombres: e.target.value })
              }
              className={`w-full px-4 py-2 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                errors.nombres ? 'border-red-600 focus:ring-red-600' : 'border-border focus:ring-primary'
              }`}
              placeholder="Juan"
              disabled={loading}
            />
            {errors.nombres && (
              <p className="text-xs text-red-600 mt-1">{errors.nombres}</p>
            )}
          </div>

          {/* Apellidos */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Apellidos *
            </label>
            <input
              type="text"
              value={formData.apellidos}
              onChange={(e) =>
                setFormData({ ...formData, apellidos: e.target.value })
              }
              className={`w-full px-4 py-2 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                errors.apellidos ? 'border-red-600 focus:ring-red-600' : 'border-border focus:ring-primary'
              }`}
              placeholder="Pérez"
              disabled={loading}
            />
            {errors.apellidos && (
              <p className="text-xs text-red-600 mt-1">{errors.apellidos}</p>
            )}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Correo *
            </label>
            <input
              type="email"
              value={formData.correo}
              onChange={(e) =>
                setFormData({ ...formData, correo: e.target.value })
              }
              className={`w-full px-4 py-2 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                errors.correo ? 'border-red-600 focus:ring-red-600' : 'border-border focus:ring-primary'
              }`}
              placeholder="usuario@ejemplo.com"
              disabled={loading}
            />
            {errors.correo && (
              <p className="text-xs text-red-600 mt-1">{errors.correo}</p>
            )}
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) =>
                setFormData({ ...formData, fecha_nacimiento: e.target.value })
              }
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              disabled={loading}
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Calle 123"
              disabled={loading}
            />
          </div>

          {/* Password - Solo para nuevas personas */}
          {!person && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`w-full px-4 py-2 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                  errors.password ? 'border-red-600 focus:ring-red-600' : 'border-border focus:ring-primary'
                }`}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
              )}
            </div>
          )}

          {/* Estado */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.checked })
                }
                className="w-4 h-4 rounded border-border bg-background cursor-pointer"
                disabled={loading}
              />
              <span className="text-sm font-medium text-foreground">
                Estado Activo
              </span>
            </label>
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
              {person ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
