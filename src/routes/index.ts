import { InternalError, OPCODE, Wrapper } from '../tools';
import { InternalMiddleware, PlatformMiddleware } from '../middlewares';
import express, { Application } from 'express';

import getAccessKeysRouter from './accessKeys';
import getAuthRouter from './auth';
import getInternalRouter from './internal';
import getLogsRouter from './logs';
import getPermissionGroupsRouter from './permissionGroups';
import getPermissionsRouter from './permissions';
import getUserRouter from './users';
import logger from '../tools/logger';
import morgan from 'morgan';
import os from 'os';
import cors from 'cors';

export default function getRouter(): Application {
  const router = express();
  InternalError.registerSentry(router);

  const hostname = os.hostname();
  const logging = morgan('common', {
    stream: { write: (str: string) => logger.info(`${str.trim()}`) },
  });

  router.use(cors());
  router.use(logging);
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));
  router.use('/internal', InternalMiddleware(), getInternalRouter());
  router.use('/auth', getAuthRouter());
  router.use('/logs', PlatformMiddleware(), getLogsRouter());
  router.use('/users', PlatformMiddleware(), getUserRouter());
  router.use('/accessKeys', PlatformMiddleware(), getAccessKeysRouter());
  router.use('/permissions', PlatformMiddleware(), getPermissionsRouter());
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
