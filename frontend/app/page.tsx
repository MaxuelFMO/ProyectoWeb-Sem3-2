'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Database, History, Users, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">SP</span>
            </div>
            <span className="text-xl font-bold text-foreground">Sistema Patrimonio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-foreground hover:text-primary transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/dashboard" className="bg-primary hover:bg-orange-700 text-primary-foreground px-4 py-2 rounded-lg transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-3 py-1 bg-accent/10 border border-accent rounded-full text-sm text-accent">
            Gestión inteligente de patrimonio
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-text-balance">
            Control y Trazabilidad de Movimientos Patrimoniales
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema integral para el seguimiento, control y auditoría de movimientos de bienes en instituciones. Acceso seguro con autenticación JWT y registro detallado de todas las operaciones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-orange-700 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Iniciar sesión
              <ArrowRight size={20} />
            </Link>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 bg-card border border-border hover:bg-muted text-foreground px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Ver funcionalidades
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Beneficios principales</h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Implementa un control centralizado y eficiente de tu patrimonio institucional
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-background border border-border rounded-2xl hover:border-accent transition-colors">
              <div className="w-14 h-14 bg-primary/10 border border-primary rounded-lg flex items-center justify-center mb-4">
                <Users className="text-primary" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Control centralizado de responsables</h3>
              <p className="text-muted-foreground mb-4">
                Gestión completa de personas responsables del patrimonio. Registro, actualización y seguimiento del estado de cada responsable en el sistema.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  Registro y edición de usuarios
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  Control de estado activo/inactivo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  Información de contacto y residencia
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-background border border-border rounded-2xl hover:border-accent transition-colors">
              <div className="w-14 h-14 bg-primary/10 border border-primary rounded-lg flex items-center justify-center mb-4">
                <Database className="text-primary" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Registro de desplazamientos</h3>
              <p className="text-muted-foreground mb-4">
                Documentación completa de movimientos de bienes. Registro de fechas, motivos, estados y responsables con capacidad de búsqueda y filtrado avanzado.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  Fechas de inicio y finalización
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  Clasificación por motivo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  Seguimiento de estado
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-background border border-border rounded-2xl hover:border-accent transition-colors">
              <div className="w-14 h-14 bg-primary/10 border border-primary rounded-lg flex items-center justify-center mb-4">
                <History className="text-primary" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Historial de auditoría</h3>
              <p className="text-muted-foreground mb-4">
                Registro detallado de todas las operaciones realizadas. Trazabilidad completa con fecha, hora, usuario y descripción de cada acción.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  Registro de todas las acciones
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  Timestamp automático
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  Usuario y descripción de cambios
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-background border border-border rounded-2xl hover:border-accent transition-colors">
              <div className="w-14 h-14 bg-primary/10 border border-primary rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-primary" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Acceso seguro al sistema</h3>
              <p className="text-muted-foreground mb-4">
                Autenticación robusta con JWT (JSON Web Token). Sesiones seguras con validación de usuario y protección de rutas en el backend.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  Login con usuario y contraseña
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  Tokens JWT con expiración
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  Protección de rutas privadas
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Comienza a gestionar tu patrimonio</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Accede al sistema con tus credenciales y comienza a registrar, seguir y auditar movimientos de bienes de manera segura y eficiente.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-orange-700 text-primary-foreground px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
          >
            Acceder al sistema
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Sistema Patrimonio</h3>
              <p className="text-sm text-muted-foreground">
                Control y trazabilidad de movimientos patrimoniales institucionales.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Funcionalidades</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Gestión de personas</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Desplazamientos</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Historial</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Seguridad</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Autenticación JWT</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Auditoría</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Política privacidad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contacto</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2024 Sistema de Patrimonio. Todos los derechos reservados.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">Términos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
