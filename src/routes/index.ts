import { Router } from 'express';
import {
  clusterInfo,
  getAccessKeysRouter,
  getAuthRouter,
  getInternalRouter,
  getLogsRouter,
  getPermissionGroupsRouter,
  getPermissionsRouter,
  getUserRouter,
  InternalMiddleware,
  OPCODE,
  PlatformMiddleware,
  Wrapper,
} from '..';

export * from './accessKeys';
export * from './auth';
export * from './internal';
export * from './logs';
export * from './permissionGroups';
export * from './permissions';
export * from './users';

export function getRouter(): Router {
  const router = Router();

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
    Wrapper(async (req, res) => {
      res.json({ opcode: OPCODE.SUCCESS, ...clusterInfo });
    })
  );

  return router;
}
