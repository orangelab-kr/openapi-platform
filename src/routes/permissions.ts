import { Router } from 'express';
import { Permission, PlatformMiddleware, RESULT, Wrapper } from '..';

export function getPermissionsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    PlatformMiddleware({ permissionIds: ['permissions.list'], final: true }),
    Wrapper(async (req) => {
      const { total, permissions } = await Permission.getPermissions(req.query);
      throw RESULT.SUCCESS({ details: { permissions, total } });
    })
  );

  router.get(
    '/:permissionId',
    PlatformMiddleware({ permissionIds: ['permissions.view'], final: true }),
    Wrapper(async (req) => {
      const { permissionId } = req.params;
      const permission = await Permission.getPermissionOrThrow(permissionId);
      throw RESULT.SUCCESS({ details: { permission } });
    })
  );

  return router;
}
