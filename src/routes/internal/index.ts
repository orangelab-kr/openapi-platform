import { Router } from 'express';
import getInternalAccessKeysRouter from './accessKeys';
import getInternalPermissionGroupsRouter from './permissionGroups';
import getInternalPermissionsRouter from './permissions';
import getInternalPlatformsRouter from './platforms';

export default function getInternalRouter(): Router {
  const router = Router();

  router.use('/platforms', getInternalPlatformsRouter());
  router.use('/permissions', getInternalPermissionsRouter());
  router.use('/permissionGroups', getInternalPermissionGroupsRouter());
  router.use('/accessKeys', getInternalAccessKeysRouter());

  return router;
}
