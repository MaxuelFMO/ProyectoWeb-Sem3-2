'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LogOut, Home, Users, Database, History, ChevronRight, BarChart3 } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-14 h-14 rounded-lg bg-primary/20 border border-primary/30 animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const mainNav = [
    { href: '/dashboard', label: 'Inicio', icon: Home },
  ];

  const modulesNav = [
    { href: '/dashboard/personas', label: 'Personas', icon: Users },
    { href: '/dashboard/desplazamientos', label: 'Desplazamientos', icon: Database },
    { href: '/dashboard/historial', label: 'Historial', icon: History },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    return [
      { label: 'Dashboard', href: '/dashboard' },
      ...parts.slice(1).map((part, index) => ({
        label:
          part.charAt(0).toUpperCase() +
          part.slice(1).replace('-', ' '),
        href: '/' + parts.slice(0, index + 2).join('/'),
      })),
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border/40">
        <SidebarHeader className="border-b border-border/40 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <BarChart3 size={18} className="text-primary" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-foreground">Patrimonio</h1>
              <p className="text-xs text-muted-foreground">Sistema</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarMenu>
              {mainNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={item.href} className="flex items-center gap-2">
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          {/* Modules Section */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2 mb-3">
              Módulos
            </SidebarGroupLabel>
            <SidebarMenu>
              {modulesNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={item.href} className="flex items-center gap-2">
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* User Footer */}
        <SidebarFooter className="border-t border-border/40 py-4">
          <div className="space-y-3">
            <div className="px-2 py-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Usuario actual</p>
              <p className="text-sm font-medium text-foreground">
                {user?.nombres} {user?.apellidos}
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-md transition-colors font-medium"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur-sm px-4 sm:px-6 py-3 gap-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-6" />
            
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-1">
                  <Link
                    href={crumb.href}
                    className={`${
                      index === breadcrumbs.length - 1
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    } transition-colors px-1`}
                  >
                    {crumb.label}
                  </Link>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight size={14} className="text-muted-foreground/50" />
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* User Info - Desktop Only */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.nombres}</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold text-xs">
                {user?.nombres?.[0]}{user?.apellidos?.[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
