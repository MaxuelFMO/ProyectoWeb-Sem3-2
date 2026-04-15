'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/providers/toast-provider';
import { Spinner } from '@/components/ui/spinner';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginDemo, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email.trim()) {
        setError('Por favor ingresa tu correo electrónico');
        setIsLoading(false);
        return;
      }

      if (!password) {
        setError('Por favor ingresa tu contraseña');
        setIsLoading(false);
        return;
      }

      await login(email, password);
      addToast('¡Bienvenido! Iniciando sesión...', 'success');
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión. Verifica tus credenciales.';
      setError(message);
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginDemo();
    addToast('Sesión de prueba iniciada. Funciones de API serán simuladas.', 'info');
    router.push('/dashboard');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block w-14 h-14 rounded-lg bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-lg">SP</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Sistema Patrimonio</h1>
          <p className="text-muted-foreground mt-2">Inicia sesión en tu cuenta</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-4 bg-red-600/10 border border-red-600 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="text-primary-foreground" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>

            {/* Demo Login Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full mt-3 bg-accent/20 hover:bg-accent/30 border border-accent text-accent py-2 px-4 rounded-lg font-semibold transition-colors"
            >
              Saltar a Dashboard (Demo)
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link href="/" className="text-accent hover:text-accent/80 font-semibold transition-colors">
                Volver a inicio
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-card border border-accent/30 rounded-lg text-sm text-muted-foreground text-center">
          <p className="font-semibold text-accent mb-1">Modo Desarrollo</p>
          <p>Usa el botón "Saltar a Dashboard" para pruebas de frontend sin backend, o ingresa credenciales reales del servidor Express.</p>
        </div>
      </div>
    </div>
  );
}
