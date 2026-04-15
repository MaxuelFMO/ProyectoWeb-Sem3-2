'use client';

import { useState, useCallback } from 'react';
import { APIClient } from '@/lib/api';

export interface Bien {
  id_bien: number;
  nombre: string;
  descripcion?: string;
  valor?: number;
  id_tipo_bien?: number;
  tipo_bien_nombre?: string;
  estado: boolean;
  fecha_registro: string;
  id_persona?: number;
}

export function useBienes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBienes = useCallback(async (): Promise<Bien[]> => {
    setLoading(true);
    setError(null);
    try {
      return await APIClient.get<Bien[]>('/bienes');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching bienes';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBien = useCallback(async (data: Partial<Bien>): Promise<Bien> => {
    setLoading(true);
    setError(null);
    try {
      return await APIClient.post<Bien>('/bienes', data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating bien';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTiposBien = useCallback(async (): Promise<{ id_tipo_bien: number; nombre: string }[]> => {
    setLoading(true);
    setError(null);
    try {
      return await APIClient.get<{ id_tipo_bien: number; nombre: string }[]>('/bienes/tipos');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching tipos de bien';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBien = useCallback(async (id: number, data: Partial<Bien>): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);
    try {
      return await APIClient.put<{ message: string }>(`/bienes/${id}`, data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating bien';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBien = useCallback(async (id: number): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);
    try {
      return await APIClient.delete<{ message: string }>(`/bienes/${id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting bien';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getBienes,
    getTiposBien,
    createBien,
    updateBien,
    deleteBien,
  };
}
