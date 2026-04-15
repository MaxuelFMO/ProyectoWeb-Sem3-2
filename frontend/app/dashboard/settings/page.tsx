'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { APIClient } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/providers/toast-provider';
import { useCatalogs } from '@/hooks/use-catalogs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Shield, MapPin, Calendar, Mail, FileDigit } from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser, token } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const { tiposDocumento, tiposCargo, loading: catalogsLoading } = useCatalogs();

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
    id_tipo_documento: '',
    numero_documento: '',
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
          fecha_nacimiento: profile.fecha_nacimiento ? profile.fecha_nacimiento.split('T')[0] : '',
          direccion: profile.direccion || '',
          id_tipo_documento: profile.id_tipo_documento?.toString() || '',
          numero_documento: profile.numero_documento || '',
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

    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!user?.id_persona) {
      addToast('Usuario no encontrado en sesión', 'error');
      return;
    }

    if (!currentPassword) {
      addToast('Ingresa tu contraseña actual para confirmar', 'warning');
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
        id_tipo_documento: formData.id_tipo_documento ? Number(formData.id_tipo_documento) : null,
        numero_documento: formData.numero_documento || null,
        currentPassword,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await APIClient.put(`/users/${user.id_persona}`, payload);

      addToast('Perfil actualizado correctamente', 'success');

      const updatedUser = {
        ...user,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo,
      };

      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));

      setConfirmOpen(false);
      setCurrentPassword('');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error actualizando perfil';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentCargoName = useMemo(() => {
    return tiposCargo.find(c => c.id_tipo_cargo === user?.id_tipo_cargo)?.descripcion || 'Usuario';
  }, [tiposCargo, user]);

  if (loading || catalogsLoading) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-sm">
            <User size={32} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Ajustes de Cuenta
          </h1>
        </div>
        <p className="text-muted-foreground text-lg ml-1">
          Administra tu perfil, documentos oficiales y seguridad en un solo lugar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/40 shadow-sm md:col-span-2">
            <CardHeader className="border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-2">
                <User size={18} className="text-primary" />
                <CardTitle className="text-lg">Información del Perfil</CardTitle>
              </div>
              <CardDescription>Datos básicos y contacto principal.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Nombres</label>
                <Input
                  value={formData.nombres}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  placeholder="Tus nombres"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Apellidos</label>
                <Input
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  placeholder="Tus apellidos"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <Mail size={14} className="text-muted-foreground" />
                  Correo Electrónico
                </label>
                <Input
                  type="email"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5 text-muted-foreground">
                  <Shield size={14} />
                  Rol del Sistema (Lectura)
                </label>
                <div className="px-3 py-2 rounded-md bg-muted border border-border/40 text-sm font-medium text-muted-foreground">
                  {currentCargoName}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Identity & Location */}
          <Card className="border-border/40 shadow-sm md:col-span-2">
            <CardHeader className="border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-2">
                <FileDigit size={18} className="text-primary" />
                <CardTitle className="text-lg">Identidad y Ubicación</CardTitle>
              </div>
              <CardDescription>Documentación oficial para trámites de bienes.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Tipo de Documento</label>
                <select
                  value={formData.id_tipo_documento}
                  onChange={(e) => setFormData({ ...formData, id_tipo_documento: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Selecciona un tipo</option>
                  {tiposDocumento.map(t => (
                    <option key={t.id_tipo_documento} value={t.id_tipo_documento}>
                      {t.descripcion}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Número de Documento</label>
                <Input
                  value={formData.numero_documento}
                  onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                  placeholder="Ej: 12345678"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <Calendar size={14} className="text-muted-foreground" />
                  Fecha de Nacimiento
                </label>
                <Input
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <MapPin size={14} className="text-muted-foreground" />
                  Dirección de Residencia
                </label>
                <Input
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Calle, ciudad, provincia..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-border/40 shadow-sm md:col-span-2">
            <CardHeader className="border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-rose-500" />
                <CardTitle className="text-lg">Seguridad de la Cuenta</CardTitle>
              </div>
              <CardDescription>Opcional: Cambia tu contraseña de acceso.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Nueva Contraseña</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="********"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Confirmar Contraseña</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="********"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
          >
            Volver
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="px-10 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all font-bold"
          >
            {saving ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Aplicando Cambios...
              </>
            ) : 'Actualizar Perfil Completo'}
          </Button>
        </div>
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Shield className="text-rose-500" />
              Verificación
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Para validar los cambios, introduce tu <strong>contraseña actual</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Input
              type="password"
              placeholder="Contraseña de confirmación"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-12 text-lg text-center"
              autoFocus
            />
          </div>
          <DialogFooter className="sm:justify-between gap-4">
            <DialogClose asChild>
              <Button variant="ghost" className="flex-1">Ignorar</Button>
            </DialogClose>
            <Button 
              onClick={handleConfirmSave} 
              disabled={saving || !currentPassword} 
              className="flex-1 h-12 text-lg font-bold"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
