export interface GithubConfig {
  clientId: string;
  clientSecret: string;
}

export interface HttpClient {
  get<T>(url: string, config?: unknown): Promise<{ status: number; data: T }>;
  post<T>(
    url: string,
    data: unknown,
    config?: unknown
  ): Promise<{ status: number; data: T }>;
}
