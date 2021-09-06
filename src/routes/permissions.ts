import { Router } from 'express';
import { OPCODE, Permission, PlatformMiddleware, Wrapper } from '..';

export function getPermissionsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    PlatformMiddleware({ permissionIds: ['permissions.list'], final: true }),
    Wrapper(async (req, res) => {
      const { total, permissions } = await Permission.getPermissions(req.query);
      res.json({ opcode: OPCODE.SUCCESS, permissions, total });
    })
  );

  router.get(
    '/:permissionId',
    PlatformMiddleware({ permissionIds: ['permissions.view'], final: true }),
    Wrapper(async (req, res) => {
      const { permissionId } = req.params;
      const permission = await Permission.getPermissionOrThrow(permissionId);
      res.json({ opcode: OPCODE.SUCCESS, permission });
    })
  );

  return router;
}
