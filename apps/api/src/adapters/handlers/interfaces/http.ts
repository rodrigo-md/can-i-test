export interface HttpContext {
  queryParams(): { [key: string]: unknown };
  status(code: number): void;
  cookie(name: string, value: unknown, config?: unknown): void;
  send(data: unknown): void;
  redirect(path: string): void;
  redirect(status: number, path: string): void;
}
