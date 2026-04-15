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

export interface TipoDocumento {
  id_tipo_documento: number;
  descripcion: string;
}

export interface TipoCargo {
  id_tipo_cargo: number;
  descripcion: string;
}

export interface CatalogsResponse<T> {
  data: T[];
}

export function useCatalogs() {
  const [motivos, setMotivos] = useState<Motivo[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [tiposCargo, setTiposCargo] = useState<TipoCargo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMotivos = useCallback(async (): Promise<Motivo[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await APIClient.get<CatalogsResponse<Motivo>>('/motivos');
      const mapped = data.data.map((item) => ({
        id_motivo: item.id_motivo,
        descripcion: (item as any).nombre || item.descripcion,
      }));
      setMotivos(mapped);
      return mapped;
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
      const mapped = data.data.map((item) => ({
        id_estado: item.id_estado,
        descripcion: (item as any).nombre || item.descripcion,
      }));
      setEstados(mapped);
      return mapped;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching estados';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTiposDocumento = useCallback(async (): Promise<TipoDocumento[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await APIClient.get<CatalogsResponse<TipoDocumento>>('/tipos-documento');
      const mapped = data.data.map((item) => ({
        id_tipo_documento: item.id_tipo_documento,
        descripcion: (item as any).nombre || item.descripcion,
      }));
      setTiposDocumento(mapped);
      return mapped;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching tipos-documento';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTiposCargo = useCallback(async (): Promise<TipoCargo[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await APIClient.get<CatalogsResponse<TipoCargo>>('/tipos-cargo');
      const mapped = data.data.map((item) => ({
        id_tipo_cargo: item.id_tipo_cargo,
        descripcion: (item as any).nombre || item.descripcion,
      }));
      setTiposCargo(mapped);
      return mapped;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching tipos-cargo';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar catálogos al montar el componente
  useEffect(() => {
    Promise.all([getMotivos(), getEstados(), getTiposDocumento(), getTiposCargo()]).catch((err) => {
      console.error('Error loading catalogs:', err);
    });
  }, []);

  return {
    motivos,
    estados,
    tiposDocumento,
    tiposCargo,
    loading,
    error,
    getMotivos,
    getEstados,
    getTiposDocumento,
    getTiposCargo,
  };
}
