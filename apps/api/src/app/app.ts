import * as express from 'express';
import * as cors from 'cors';
import routes from './router';
import { HttpError } from '../adapters/handlers/http-errors';
import Router from 'express-promise-router';
import * as cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';

const app = express();
const router = Router();

app.use(cookieParser());
app.use(router);

if (process.env.NODE_ENV !== 'production') {
  // This is needed for creating the cookies CORS
  router.use(cors({ origin: 'http://localhost:4200', credentials: true }));
}

app.get(`${process.env.API_BASE_URL}/`, function (req, res) {
  res.send({ message: 'Testing UI/API integration' });
});

routes(router);

app.use((req, res) => {
  res.status(404).json({
    message:
      'Ohh you are lost, read the API documentation to find your way back home :)',
  });
});

// eslint-disable-next-line
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    const { statusCode, message } = err;

    res.status(statusCode).send({ message });
  } else {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

export default app;
