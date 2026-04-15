'use client';

import { useState, useCallback } from 'react';
import { APIClient } from '@/lib/api';

export interface Displacement {
  id_desplazamiento: number;
  fecha_inicio: string;
  fecha_fin?: string;
  id_motivo: number;
  motivo?: string;
  id_estado: number;
  estado?: string;
  fecha_registro: string;
  id_persona?: number;
}

export interface DisplacementsResponse {
  data: Displacement[];
  total: number;
  page: number;
  limit: number;
}

export function useDisplacements() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDisplacements = useCallback(async (params?: {
    id_motivo?: number;
    id_estado?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    page?: number;
    limit?: number;
  }): Promise<DisplacementsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params?.id_motivo) query.append('id_motivo', params.id_motivo.toString());
      if (params?.id_estado) query.append('id_estado', params.id_estado.toString());
      if (params?.fecha_inicio) query.append('fecha_inicio', params.fecha_inicio);
      if (params?.fecha_fin) query.append('fecha_fin', params.fecha_fin);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());

      const endpoint = `/desplazamientos${query.toString() ? '?' + query.toString() : ''}`;
      const data = await APIClient.get<DisplacementsResponse>(endpoint);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching displacements';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDisplacement = useCallback(async (id: number): Promise<Displacement> => {
    setLoading(true);
    setError(null);
    try {
      return await APIClient.get<Displacement>(`/desplazamientos/${id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching displacement';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDisplacement = useCallback(async (data: Omit<Displacement, 'id_desplazamiento' | 'fecha_registro'>): Promise<Displacement> => {
    setLoading(true);
    setError(null);
    try {
      return await APIClient.post<Displacement>('/desplazamientos', data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating displacement';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDisplacement = useCallback(async (id: number, data: Partial<Displacement>): Promise<Displacement> => {
    setLoading(true);
    setError(null);
    try {
      return await APIClient.put<Displacement>(`/desplazamientos/${id}`, data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating displacement';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDisplacement = useCallback(async (id: number): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);
    try {
      return await APIClient.delete<{ message: string }>(`/desplazamientos/${id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting displacement';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getDisplacements,
    getDisplacement,
    createDisplacement,
    updateDisplacement,
    deleteDisplacement,
  };
}
