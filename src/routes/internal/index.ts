import { Router } from 'express';
import getInternalAccessKeysRouter from './accessKeys';
import getInternalLogsRouter from './logs';
import getInternalPermissionGroupsRouter from './permissionGroups';
import getInternalPermissionsRouter from './permissions';
import getInternalPlatformsRouter from './platforms';

export default function getInternalRouter(): Router {
  const router = Router();

  router.use('/platforms', getInternalPlatformsRouter());
  router.use('/permissions', getInternalPermissionsRouter());
  router.use('/permissionGroups', getInternalPermissionGroupsRouter());
  router.use('/accessKeys', getInternalAccessKeysRouter());
  router.use('/logs', getInternalLogsRouter());

  return router;
}
