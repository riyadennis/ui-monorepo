import type {
  CreatePolicyRequest,
  EvaluateRequest,
  EvaluateResponse,
  Policy,
  UpdatePolicyRequest,
} from './types.ts';

export interface PbacClientOptions {
  /** Base URL for the API. Defaults to `/api` (see the Vite dev proxy). */
  baseUrl?: string;
  /** Override the fetch implementation (useful for tests). */
  fetch?: typeof fetch;
}

/** Thrown when the API responds with a non-2xx status. */
export class PbacApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'PbacApiError';
  }
}

/** Thin, typed client for the pbac policy REST API. */
export class PbacClient {
  private readonly baseUrl: string;
  private readonly doFetch: typeof fetch;

  constructor(options: PbacClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? '/api').replace(/\/$/, '');
    this.doFetch = options.fetch ?? fetch.bind(globalThis);
  }

  listPolicies(): Promise<Policy[]> {
    return this.request('GET', '/policies');
  }

  getPolicy(id: string): Promise<Policy> {
    return this.request('GET', `/policies/${encodeURIComponent(id)}`);
  }

  createPolicy(body: CreatePolicyRequest): Promise<Policy> {
    return this.request('POST', '/policies', body);
  }

  updatePolicy(id: string, body: UpdatePolicyRequest): Promise<Policy> {
    return this.request('PUT', `/policies/${encodeURIComponent(id)}`, body);
  }

  async deletePolicy(id: string): Promise<void> {
    await this.request('DELETE', `/policies/${encodeURIComponent(id)}`);
  }

  evaluate(id: string, body: EvaluateRequest): Promise<EvaluateResponse> {
    return this.request('POST', `/policies/${encodeURIComponent(id)}/evaluate`, body);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await this.doFetch(`${this.baseUrl}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const detail = (await res.text().catch(() => '')).trim();
      throw new PbacApiError(res.status, detail || `${method} ${path} failed (${res.status})`);
    }

    // 204 No Content (e.g. DELETE) has no body to parse.
    if (res.status === 204) {
      return undefined as T;
    }
    return (await res.json()) as T;
  }
}
