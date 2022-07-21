import * as express from 'express';
import * as cors from 'cors';
import routes from './app/router';
import { HttpError } from './adapters/handlers/http-errors';
import Router from 'express-promise-router';
import type { Request, Response, NextFunction } from 'express';

const app = express();
const router = Router();

app.use(router);

if (process.env.NODE_ENV !== 'production') {
  // This is needed for creating the cookies CORS
  router.use(cors({ origin: 'http://localhost:4200', credentials: true }));
}


app.get(`${process.env.API_BASE_URL}/`, function (req, res) {
  res.send({ message: 'Testing UI/API integration' });
});

routes(router);

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if(err instanceof HttpError) {
    const { statusCode, message } = err;

    res.status(statusCode).send({ message });
  }else {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
