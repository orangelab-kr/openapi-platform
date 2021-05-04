import {
  getInternalAccessKeysRouter,
  getInternalLogsRouter,
  getInternalPermissionGroupsRouter,
  getInternalPermissionsRouter,
  getInternalPlatformsRouter,
} from '.';

import { Router } from 'express';

export * from './accessKeys';
export * from './logs';
export * from './permissionGroups';
export * from './permissions';
export * from './platforms';

export function getInternalRouter(): Router {
  const router = Router();

  router.use('/platforms', getInternalPlatformsRouter());
  router.use('/permissions', getInternalPermissionsRouter());
  router.use('/permissionGroups', getInternalPermissionGroupsRouter());
  router.use('/accessKeys', getInternalAccessKeysRouter());
  router.use('/logs', getInternalLogsRouter());

  return router;
}
