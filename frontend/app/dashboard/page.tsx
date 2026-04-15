'use client';

import { useState, useEffect } from 'react';
import { Users, FileText, Clock, TrendingUp, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePersons } from '@/hooks/use-persons';
import { useDisplacements } from '@/hooks/use-displacements';
import { useHistorial } from '@/hooks/use-historial';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  link: string;
  color: 'orange' | 'blue' | 'cyan' | 'green';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  const { getPersons } = usePersons();
  const { getDisplacements } = useDisplacements();
  const { getHistorial } = useHistorial();

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoadingStats(true);
        
        const [personsRes, displacementsRes, historialRes] = await Promise.all([
          getPersons({ limit: 1 }),
          getDisplacements({ limit: 1 }),
          getHistorial({ limit: 1 }),
        ]);

        setStats([
          {
            title: 'Total de Personas',
            value: personsRes.total || 0,
            icon: <Users size={24} />,
            link: '/dashboard/personas',
            color: 'orange',
          },
          {
            title: 'Desplazamientos Activos',
            value: displacementsRes.total || 0,
            icon: <FileText size={24} />,
            link: '/dashboard/desplazamientos',
            color: 'blue',
          },
          {
            title: 'Movimientos Registrados',
            value: historialRes.total || 0,
            icon: <Clock size={24} />,
            link: '/dashboard/historial',
            color: 'cyan',
          },
          {
            title: 'Tasa de Actividad',
            value: '98%',
            icon: <TrendingUp size={24} />,
            link: '/dashboard',
            color: 'green',
          },
        ]);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  const getColorClasses = (color: string) => {
    const colors = {
      orange: 'bg-orange-600/10 border-orange-600 text-orange-600',
      blue: 'bg-blue-600/10 border-blue-600 text-blue-600',
      cyan: 'bg-cyan-500/10 border-cyan-500 text-cyan-500',
      green: 'bg-green-600/10 border-green-600 text-green-600',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner with New Features */}
      <WelcomeBanner />

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de las estadísticas principales del Sistema de Patrimonio
        </p>
      </div>

      {/* Stats Grid */}
      {isLoadingStats ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Link key={index} href={stat.link}>
              <Card className="h-full border-border/40 hover:border-accent/50 hover:shadow-md transition-all group cursor-pointer">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div
                      className={`w-10 h-10 rounded-md border flex items-center justify-center group-hover:scale-110 transition-transform ${getColorClasses(
                        stat.color
                      )}`}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <p className="text-xs text-accent group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Ver detalles <ArrowRight size={14} />
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions & System Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions Card */}
        <Card className="lg:col-span-2 border-border/40">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap size={20} className="text-primary" />
              Acciones rápidas
            </CardTitle>
            <CardDescription>Accesos directos a las funciones principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/dashboard/personas">
                <Button variant="outline" className="w-full justify-between border-border/40 hover:border-accent/50">
                  Gestionar personas
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/dashboard/desplazamientos">
                <Button variant="outline" className="w-full justify-between border-border/40 hover:border-accent/50">
                  Registrar desplazamiento
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/dashboard/historial">
                <Button variant="outline" className="w-full justify-between border-border/40 hover:border-accent/50">
                  Ver historial
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Info Card */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 size={20} className="text-green-600" />
              Sistema
            </CardTitle>
            <CardDescription>Información de configuración</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Estado:</dt>
                <dd className="flex items-center gap-1.5 text-foreground font-medium">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  Activo
                </dd>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <dt className="text-muted-foreground">Versión:</dt>
                <dd className="text-foreground font-medium">1.0.0</dd>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <dt className="text-muted-foreground">Autenticación:</dt>
                <dd className="text-foreground font-medium">JWT</dd>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <dt className="text-muted-foreground">Base de datos:</dt>
                <dd className="text-foreground font-medium">MySQL</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview Card */}
      <Card className="border-accent/40 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="text-lg">Control centralizado de patrimonio</CardTitle>
          <CardDescription>
            Sistema integral para el seguimiento y trazabilidad de movimientos patrimoniales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground mb-4">
            Registra, controla y audita todos los movimientos de bienes dentro de tu institución de manera segura y transparente.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-background/50 border border-border/40">
              <h4 className="font-semibold text-sm text-foreground mb-1">Gestión de personas</h4>
              <p className="text-xs text-muted-foreground">Administra usuarios responsables</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border/40">
              <h4 className="font-semibold text-sm text-foreground mb-1">Registro de desplazamientos</h4>
              <p className="text-xs text-muted-foreground">Documenta movimientos de bienes</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border/40">
              <h4 className="font-semibold text-sm text-foreground mb-1">Auditoría completa</h4>
              <p className="text-xs text-muted-foreground">Historial de todas las operaciones</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
