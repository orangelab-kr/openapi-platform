import { Router } from 'express';
import {
  InternalPermissionMiddleware,
  PERMISSION,
  Permission,
  RESULT,
  Wrapper,
} from '../..';

export function getInternalPermissionsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.PERMISSIONS_LIST),
    Wrapper(async (req) => {
      const { total, permissions } = await Permission.getPermissions(req.query);
      throw RESULT.SUCCESS({ details: { permissions, total } });
    })
  );

  router.get(
    '/:permissionId',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_VIEW),
    Wrapper(async (req) => {
      const { permissionId } = req.params;
      const permission = await Permission.getPermissionOrThrow(permissionId);
      throw RESULT.SUCCESS({ details: { permission } });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_CREATE),
    Wrapper(async (req) => {
      const { permissionId } = await Permission.createPermission(req.body);
      throw RESULT.SUCCESS({ details: { permissionId } });
    })
  );

  router.post(
    '/:permissionId',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_MODIFY),
    Wrapper(async (req) => {
      const { body, params } = req;
      await Permission.modifyPermission(params.permissionId, body);
      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/:permissionId',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_DELETE),
    Wrapper(async (req) => {
      const { permissionId } = req.params;
      await Permission.deletePermission(permissionId);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
