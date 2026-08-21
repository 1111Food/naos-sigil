import { QueryClient } from '@tanstack/react-query';
import { getAsyncAuthHeaders } from './api';

/**
 * NAOS QueryClient — Configuración central de caché
 * 
 * staleTime: 5 min → Los datos se consideran frescos durante 5 minutos.
 *   Si el mismo endpoint se pide de nuevo en ese tiempo, se devuelve del caché SIN red.
 * 
 * gcTime: 15 min → Los datos inactivos permanecen en memoria 15 minutos.
 *   Si el usuario regresa a una vista en ese tiempo, ve datos instantáneamente.
 * 
 * refetchOnWindowFocus: false → Crítico para móvil. En iOS, al regresar de otra app
 *   o del home screen, el browser dispara 'focus'. Sin esto, todos los endpoints
 *   se re-fetchearían al mismo tiempo → spike de CPU y batería.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutos frescos
      gcTime: 1000 * 60 * 15,        // 15 minutos en memoria
      retry: 2,
      refetchOnWindowFocus: false,   // No re-fetch al regresar del home screen
      refetchOnReconnect: true,      // Sí re-fetch al reconectar red (importante en móvil)
    },
    mutations: {
      retry: 0, // Mutations no se reintentan automáticamente (pueden tener efectos secundarios)
    }
  },
});

/**
 * Helper para queries autenticadas de NAOS.
 * Encapsula el patrón de auth headers + fetch + json parsing.
 * 
 * Uso:
 *   queryFn: () => naosQueryFn(endpoints.subscription)
 */
export async function naosQueryFn<T>(url: string): Promise<T> {
  const headers = await getAsyncAuthHeaders('GET');
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const error = new Error(`NAOS API Error: ${res.status} ${res.statusText} — ${url}`);
    (error as any).status = res.status;
    throw error;
  }

  return res.json() as Promise<T>;
}

/**
 * Helper para mutations autenticadas (POST/PUT/DELETE).
 * 
 * Uso:
 *   mutationFn: (body) => naosQueryMutate(endpoints.upgrade, 'POST', body)
 */
export async function naosQueryMutate<T>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
  body?: unknown
): Promise<T> {
  const headers = await getAsyncAuthHeaders(method);
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = new Error(`NAOS Mutation Error: ${res.status} ${res.statusText} — ${url}`);
    (error as any).status = res.status;
    throw error;
  }

  // Handle 204 No Content gracefully
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}
