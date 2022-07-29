import type { Request, Response, NextFunction } from 'express';
import type { HttpContext } from './handlers/interfaces/http';

export default (handler: (args: HttpContext) => Promise<void> | never) =>
  (req: Request, res: Response, next: NextFunction) => {
    const httpContext: HttpContext = {
      queryParams: () => Object.freeze(req.query),
      pathParams: <T>() => Object.freeze(req.params) as unknown as T,
      status: res.status.bind(res),
      cookie: res.cookie.bind(res),
      cookies: () => Object.freeze(req.cookies ?? {}),
      send: res.send.bind(res),
      redirect: res.redirect.bind(res),
      store: (key: string, value: unknown) => (res.locals[key] = value),
      retrieveFromStore: (key: string) => res.locals[key],
      next,
    };

    return handler(httpContext);
  };
