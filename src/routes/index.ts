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
  RESULT,
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
  router.use('/logs', getLogsRouter());
  router.use('/users', getUserRouter());
  router.use('/accessKeys', getAccessKeysRouter());
  router.use('/permissions', getPermissionsRouter());
  router.use('/permissionGroups', getPermissionGroupsRouter());

  router.get(
    '/',
    Wrapper(async () => {
      throw RESULT.SUCCESS({ details: clusterInfo });
    })
  );

  return router;
}
