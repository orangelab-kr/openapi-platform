import express from 'express';
import serverless from 'serverless-http';
import { getRouter, InternalError, LoggerMiddleware, OPCODE, Wrapper } from '.';

export * from './middlewares';
export * from './controllers';
export * from './routes';
export * from './tools';

const app = express();
InternalError.registerSentry(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(LoggerMiddleware());
app.use('/', getRouter());
app.all(
  '*',
  Wrapper(async () => {
    throw new InternalError('Invalid API', OPCODE.ERROR);
  })
);

const options = { basePath: '/v1/platform' };
export const handler = serverless(app, options);
