import OPCODE from '../../tools/opcode';
import PermissionGroup from '../../controllers/permissionGroup';
import { Router } from 'express';
import Wrapper from '../../tools/wrapper';

export default function getInternalPermissionGroupsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const {
        total,
        permissionGroups,
      } = await PermissionGroup.getPermissionGroups(req.query);
      res.json({ opcode: OPCODE.SUCCESS, permissionGroups, total });
    })
  );

  router.get(
    '/:permissionGroupId',
    Wrapper(async (req, res) => {
      const { permissionGroupId } = req.params;
      const permissionGroup = await PermissionGroup.getPermissionGroupOrThrow(
        permissionGroupId
      );

      res.json({ opcode: OPCODE.SUCCESS, permissionGroup });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const { permissionGroupId } = await PermissionGroup.createPermissionGroup(
        req.body
      );

      res.json({ opcode: OPCODE.SUCCESS, permissionGroupId });
    })
  );

  router.post(
    '/:permissionGroupId',
    Wrapper(async (req, res) => {
      const { body, params } = req;
      await PermissionGroup.modifyPermissionGroup(
        params.permissionGroupId,
        body
      );

      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:permissionGroupId',
    Wrapper(async (req, res) => {
      const { permissionGroupId } = req.params;
      await PermissionGroup.deletePermissionGroup(permissionGroupId);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
