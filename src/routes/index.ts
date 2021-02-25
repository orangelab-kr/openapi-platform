import { InternalError, OPCODE, Wrapper } from '../tools';
import { InternalMiddleware, PlatformMiddleware } from '../middlewares';
import express, { Application } from 'express';

import getAccessKeysRouter from './accessKeys';
import getInternalRouter from './internal';
import getPermissionGroupsRouter from './permissionGroups';
import getUserRouter from './users';
import logger from '../tools/logger';
import morgan from 'morgan';
import os from 'os';

export default function getRouter(): Application {
  const router = express();
  const hostname = os.hostname();
  const logging = morgan('common', {
    stream: { write: (str: string) => logger.info(`${str.trim()}`) },
  });

  router.use(logging);
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));
  router.use('/internal', InternalMiddleware(), getInternalRouter());
  router.use('/users', PlatformMiddleware(), getUserRouter());
  router.use('/accessKeys', PlatformMiddleware(), getAccessKeysRouter());
  router.use(
    '/permissionGroups',
    PlatformMiddleware(),
    getPermissionGroupsRouter()
  );

  router.get(
    '/',
    Wrapper(async (_req, res) => {
      res.json({
        opcode: OPCODE.SUCCESS,
        name: process.env.AWS_LAMBDA_FUNCTION_NAME,
        mode: process.env.NODE_ENV,
        cluster: hostname,
      });
    })
  );

  router.all(
    '*',
    Wrapper(async () => {
      throw new InternalError('Invalid API');
    })
  );

  return router;
}
