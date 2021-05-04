import {
  getInternalAuthorizeRouter,
  getInternalLogsRouter,
  getInternalPermissionGroupsRouter,
  getInternalPermissionsRouter,
  getInternalPlatformsRouter,
} from '.';

import { Router } from 'express';

export * from './authorize';
export * from './logs';
export * from './permissionGroups';
export * from './permissions';
export * from './platforms';

export function getInternalRouter(): Router {
  const router = Router();

  router.use('/platforms', getInternalPlatformsRouter());
  router.use('/permissions', getInternalPermissionsRouter());
  router.use('/permissionGroups', getInternalPermissionGroupsRouter());
  router.use('/authorize', getInternalAuthorizeRouter());
  router.use('/logs', getInternalLogsRouter());

  return router;
}
