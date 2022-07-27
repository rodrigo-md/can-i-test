import type { Request, Response } from 'express';
import type { HttpContext } from './handlers/interfaces/http';

export default (handler: (args: HttpContext) => Promise<void> | never) =>
  (req: Request, res: Response) => {
    const httpContext: HttpContext = {
      queryParams: () => req.query,
      status: res.status.bind(res),
      cookie: res.cookie.bind(res),
      cookies: () => Object.freeze(req.cookies),
      send: res.send.bind(res),
      redirect: res.redirect.bind(res),
    };

    return handler(httpContext);
  };
