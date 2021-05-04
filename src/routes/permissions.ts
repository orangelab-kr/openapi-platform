import { OPCODE, Permission, Wrapper } from '..';

import { Router } from 'express';

export function getPermissionsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { total, permissions } = await Permission.getPermissions(req.query);
      res.json({ opcode: OPCODE.SUCCESS, permissions, total });
    })
  );

  router.get(
    '/:permissionId',
    Wrapper(async (req, res) => {
      const { permissionId } = req.params;
      const permission = await Permission.getPermissionOrThrow(permissionId);
      res.json({ opcode: OPCODE.SUCCESS, permission });
    })
  );

  return router;
}
