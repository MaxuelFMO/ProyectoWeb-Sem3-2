'use client';

import { useState, useCallback, useEffect } from 'react';
import { APIClient } from '@/lib/api';

export interface Motivo {
  id_motivo: number;
  descripcion: string;
}

export interface Estado {
  id_estado: number;
  descripcion: string;
}

export interface CatalogsResponse<T> {
  data: T[];
}

export function useCatalogs() {
  const [motivos, setMotivos] = useState<Motivo[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMotivos = useCallback(async (): Promise<Motivo[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await APIClient.get<CatalogsResponse<Motivo>>('/motivos');
      setMotivos(data.data);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching motivos';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEstados = useCallback(async (): Promise<Estado[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await APIClient.get<CatalogsResponse<Estado>>('/estados');
      setEstados(data.data);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching estados';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar catálogos al montar el componente
  useEffect(() => {
    Promise.all([getMotivos(), getEstados()]).catch((err) => {
      console.error('Error loading catalogs:', err);
    });
  }, []);

  return {
    motivos,
    estados,
    loading,
    error,
    getMotivos,
    getEstados,
  };
}
