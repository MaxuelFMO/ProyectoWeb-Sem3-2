'use client';

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Database, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function WelcomeBanner() {
  return (
    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/20">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-orange-900/20 rounded-full blur-3xl" />
      
      <CardContent className="relative p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-medium backdrop-blur-sm animate-pulse">
              <Sparkles size={14} />
              <span>Sistema Actualizado v1.0.0</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Bienvenido al Portal de <span className="text-orange-100">Patrimonio</span>
            </h2>
            
            <p className="text-orange-50 max-w-2xl text-lg opacity-90 leading-relaxed">
              Gestione, controle y audite todos los movimientos patrimoniales de su institución con precisión total y seguridad garantizada.
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 shadow-lg shadow-orange-900/10 transition-all hover:scale-105">
                Empezar Ahora
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <div className="flex items-center gap-6 text-sm font-medium text-orange-100">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  <span>Seguro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Database size={16} />
                  <span>Centralizado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={16} />
                  <span>Rápido</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-2xl transform rotate-6 animate-pulse" />
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl space-y-4 w-72 transform hover:-rotate-2 transition-transform duration-500">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="text-[10px] text-white/60 font-mono tracking-widest uppercase">system_log</div>
                </div>
                <div className="space-y-3 font-mono text-[11px] text-orange-100/90 leading-normal">
                  <p className="flex justify-between">
                    <span>{'>'} DB_CONNECTION</span>
                    <span className="text-green-300">ESTABLISHED</span>
                  </p>
                  <p className="flex justify-between">
                    <span>{'>'} AUTH_PROTOCOL</span>
                    <span className="text-green-300">SECURE_JWT</span>
                  </p>
                  <p className="flex justify-between">
                    <span>{'>'} SYNC_STATUS</span>
                    <span className="text-green-300">ACTIVE_NOW</span>
                  </p>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-green-400 w-3/4 animate-[progress_2s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
