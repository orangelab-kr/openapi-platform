import OPCODE from '../../tools/opcode';
import Permission from '../../controllers/permission';
import { Router } from 'express';
import Wrapper from '../../tools/wrapper';

export default function getInternalPermissionsRouter(): Router {
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

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const { permissionId } = await Permission.createPermission(req.body);
      res.json({ opcode: OPCODE.SUCCESS, permissionId });
    })
  );

  router.post(
    '/:permissionId',
    Wrapper(async (req, res) => {
      const { body, params } = req;
      await Permission.modifyPermission(params.permissionId, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:permissionId',
    Wrapper(async (req, res) => {
      const { permissionId } = req.params;
      await Permission.deletePermission(permissionId);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
