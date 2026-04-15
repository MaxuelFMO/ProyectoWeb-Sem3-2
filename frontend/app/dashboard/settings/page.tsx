'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APIClient } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SettingsPage() {
  const { user, setUser, token } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    fecha_nacimiento: '',
    direccion: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    const loadProfile = async () => {
      try {
        const profile = await APIClient.get<any>('/auth/me');
        setFormData({
          nombres: profile.nombres || '',
          apellidos: profile.apellidos || '',
          correo: profile.correo || '',
          fecha_nacimiento: profile.fecha_nacimiento || '',
          direccion: profile.direccion || '',
          password: '',
          confirmPassword: '',
        });
      setCurrentPassword('');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo cargar el perfil';
        addToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token, router, addToast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.nombres.trim() || !formData.apellidos.trim() || !formData.correo.trim()) {
      addToast('Nombres, apellidos y correo son obligatorios', 'warning');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      addToast('La contraseña y su confirmación no coinciden', 'error');
      return;
    }

    if (!currentPassword) {
      addToast('Ingresa tu contraseña actual para confirmar los cambios', 'warning');
      return;
    }

    if (!user?.id_persona) {
      addToast('Usuario no encontrado en sesión', 'error');
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!user?.id_persona) {
      addToast('Usuario no encontrado en sesión', 'error');
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        direccion: formData.direccion || '',
        currentPassword,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await APIClient.put(`/personas/${user.id_persona}`, payload);
      addToast('Perfil actualizado correctamente', 'success');
      setUser({
        ...user,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo,
      });
      localStorage.setItem('authUser', JSON.stringify({
        ...user,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo,
      }));
      setConfirmOpen(false);
      setCurrentPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error actualizando perfil';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Ajustes de cuenta</h1>
        <p className="text-muted-foreground">Actualiza tus datos de usuario y seguridad.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-2xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="nombres" className="block text-sm font-medium text-foreground mb-2">Nombres</label>
            <Input
              id="nombres"
              value={formData.nombres}
              onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
              placeholder="Nombres"
            />
          </div>
          <div>
            <label htmlFor="apellidos" className="block text-sm font-medium text-foreground mb-2">Apellidos</label>
            <Input
              id="apellidos"
              value={formData.apellidos}
              onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
              placeholder="Apellidos"
            />
          </div>
        </div>

        <div>
          <label htmlFor="correo" className="block text-sm font-medium text-foreground mb-2">Correo electrónico</label>
          <Input
            id="correo"
            type="email"
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            placeholder="usuario@ejemplo.com"
          />
        </div>

        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-foreground mb-2">Dirección</label>
          <Input
            id="direccion"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            placeholder="Calle, ciudad, país"
          />
        </div>

        <div>
          <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-foreground mb-2">Fecha de nacimiento</label>
          <Input
            id="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">Nueva contraseña</label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Dejar en blanco para no cambiar"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">Confirmar contraseña</label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirmar contraseña"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cambios</DialogTitle>
            <DialogDescription>
              Para guardar los cambios en tu cuenta, ingresa tu contraseña actual.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-2">
                Contraseña actual
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button onClick={handleConfirmSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Confirmar y guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
