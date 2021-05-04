import {
  InternalError,
  InternalMiddleware,
  OPCODE,
  PlatformMiddleware,
  Wrapper,
  getAccessKeysRouter,
  getAuthRouter,
  getInternalRouter,
  getLogsRouter,
  getPermissionGroupsRouter,
  getPermissionsRouter,
  getUserRouter,
  logger,
} from '..';
import express, { Application } from 'express';

import cors from 'cors';
import morgan from 'morgan';
import os from 'os';

export * from './accessKeys';
export * from './auth';
export * from './internal';
export * from './logs';
export * from './permissionGroups';
export * from './permissions';
export * from './users';

export function getRouter(): Application {
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
