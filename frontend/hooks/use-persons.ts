'use client';

import { useState, useCallback } from 'react';
import { APIClient } from '@/lib/api';

export interface Person {
  id_persona: number;
  nombres: string;
  apellidos: string;
  correo?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  estado: boolean;
  fecha_creacion: string;
}

export interface PersonsResponse {
  data: Person[];
  total: number;
  page: number;
  limit: number;
}

export function usePersons() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPersons = useCallback(async (params?: {
    search?: string;
    estado?: string | boolean;
    page?: number;
    limit?: number;
  }): Promise<PersonsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.estado !== undefined) query.append('estado', params.estado.toString());
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());

      const endpoint = `/personas${query.toString() ? '?' + query.toString() : ''}`;
      const data = await APIClient.get<PersonsResponse>(endpoint);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching persons';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPerson = useCallback(async (id: number): Promise<Person> => {
    setLoading(true);
    setError(null);
    try {
      return await APIClient.get<Person>(`/personas/${id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching person';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPerson = useCallback(async (data: Omit<Person, 'id_persona' | 'fecha_creacion' | 'estado'> & { password: string }): Promise<Person> => {
    setLoading(true);
    setError(null);
    try {
      return await APIClient.post<Person>('/personas', data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating person';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePerson = useCallback(async (id: number, data: Partial<Person>): Promise<Person> => {
    setLoading(true);
    setError(null);
    try {
      return await APIClient.put<Person>(`/personas/${id}`, data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating person';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePerson = useCallback(async (id: number): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);
    try {
      return await APIClient.delete<{ message: string }>(`/personas/${id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting person';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getPersons,
    getPerson,
    createPerson,
    updatePerson,
    deletePerson,
  };
}
