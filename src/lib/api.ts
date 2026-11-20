import { env } from './env';

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  code?: string;
  constructor(message: string, status = 0, fieldErrors?: Record<string, string>, code?: string) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.code = code;
  }
}

let tokenGetter: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export function configureApi(opts: { getToken: () => string | null; onUnauthorized: () => void }) {
  tokenGetter = opts.getToken;
  onUnauthorized = opts.onUnauthorized;
}

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  form?: FormData;
  auth?: boolean;
  signal?: AbortSignal;
}

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', 'X-Gidi-Client': 'mobile' };
  const token = tokenGetter();
  if (token && opts.auth !== false) headers.Authorization = `Bearer ${token}`;
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }

  // Give up after 25 seconds instead of leaving the screen spinning forever on a bad connection.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  opts.signal?.addEventListener('abort', () => controller.abort());
  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}${path}`, { method: opts.method ?? (body ? 'POST' : 'GET'), headers, body, signal: controller.signal });
  } catch {
    throw new ApiError('The connection is slow or offline. Check your internet and try again.', 0);
  } finally {
    clearTimeout(timer);
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (res.status === 401 && token && opts.auth !== false) onUnauthorized();
    throw new ApiError(
      data?.error || data?.message || (res.status === 429 ? 'Too many attempts. Please wait a bit and try again.' : 'Something went wrong. Please try again.'),
      res.status,
      data?.fieldErrors,
      data?.code
    );
  }
  return data as T;
}
