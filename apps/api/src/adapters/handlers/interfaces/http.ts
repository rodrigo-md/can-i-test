/* eslint-disable @typescript-eslint/no-explicit-any */
export interface HttpContext {
  queryParams(): { [key: string]: unknown };
  pathParams<T extends { [key: string]: unknown }>(): T;
  status(code: number): void;
  cookie(name: string, value: unknown, config?: unknown): void;
  cookies<T extends object>(): T;
  send(data: unknown): void;
  redirect(path: string): void;
  redirect(status: number, path: string): void;
  next(err?: any): void;
  store(key: string, value: unknown): void;
  retrieveFromStore<T>(key: string): T;
}
