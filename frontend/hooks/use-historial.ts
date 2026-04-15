'use client';

import { useState, useCallback } from 'react';
import { APIClient } from '@/lib/api';

export interface HistorialMovimiento {
  id_historial: number;
  id_persona: number;
  nombre_persona?: string;
  id_desplazamiento: number;
  accion: string;
  descripcion?: string;
  fecha_hora: string;
  usuario_registro?: string;
}

export interface HistorialResponse {
  data: HistorialMovimiento[];
  total: number;
  page: number;
  limit: number;
}

export function useHistorial() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHistorial = useCallback(async (params?: {
    id_persona?: number;
    id_desplazamiento?: number;
    accion?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    page?: number;
    limit?: number;
  }): Promise<HistorialResponse> => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params?.id_persona) query.append('id_persona', params.id_persona.toString());
      if (params?.id_desplazamiento) query.append('id_desplazamiento', params.id_desplazamiento.toString());
      if (params?.accion) query.append('accion', params.accion);
      if (params?.fecha_desde) query.append('fecha_desde', params.fecha_desde);
      if (params?.fecha_hasta) query.append('fecha_hasta', params.fecha_hasta);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());

      const endpoint = `/historial${query.toString() ? '?' + query.toString() : ''}`;
      const data = await APIClient.get<HistorialResponse>(endpoint);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching historial';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistorialByPersona = useCallback(async (id_persona: number, page = 1): Promise<HistorialResponse> => {
    return getHistorial({ id_persona, page });
  }, [getHistorial]);

  const getHistorialByDesplazamiento = useCallback(async (id_desplazamiento: number, page = 1): Promise<HistorialResponse> => {
    return getHistorial({ id_desplazamiento, page });
  }, [getHistorial]);

  const recordMovimiento = useCallback(async (data: Omit<HistorialMovimiento, 'id_historial' | 'fecha_hora' | 'usuario_registro'>): Promise<HistorialMovimiento> => {
    setLoading(true);
    setError(null);
    try {
      return await APIClient.post<HistorialMovimiento>('/historial', data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error recording movimiento';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getHistorial,
    getHistorialByPersona,
    getHistorialByDesplazamiento,
    recordMovimiento,
  };
}
