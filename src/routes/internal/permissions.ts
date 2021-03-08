import InternalPermissionMiddleware from '../../middlewares/internal/permissions';
import OPCODE from '../../tools/opcode';
import { PERMISSION } from '../../middlewares/internal';
import Permission from '../../controllers/permission';
import { Router } from 'express';
import Wrapper from '../../tools/wrapper';

export default function getInternalPermissionsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.PERMISSIONS_LIST),
    Wrapper(async (req, res) => {
      const { total, permissions } = await Permission.getPermissions(req.query);
      res.json({ opcode: OPCODE.SUCCESS, permissions, total });
    })
  );

  router.get(
    '/:permissionId',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_VIEW),
    Wrapper(async (req, res) => {
      const { permissionId } = req.params;
      const permission = await Permission.getPermissionOrThrow(permissionId);
      res.json({ opcode: OPCODE.SUCCESS, permission });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_CREATE),
    Wrapper(async (req, res) => {
      const { permissionId } = await Permission.createPermission(req.body);
      res.json({ opcode: OPCODE.SUCCESS, permissionId });
    })
  );

  router.post(
    '/:permissionId',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_MODIFY),
    Wrapper(async (req, res) => {
      const { body, params } = req;
      await Permission.modifyPermission(params.permissionId, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:permissionId',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_DELETE),
    Wrapper(async (req, res) => {
      const { permissionId } = req.params;
      await Permission.deletePermission(permissionId);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
