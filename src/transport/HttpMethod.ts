export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const satisfies Record<string, HttpMethod>;
