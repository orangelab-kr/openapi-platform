import {
  InternalPermissionMiddleware,
  OPCODE,
  PERMISSION,
  PermissionGroup,
  Wrapper,
} from '../..';

import { Router } from 'express';

export function getInternalPermissionGroupsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_LIST),
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
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_VIEW),
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
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_CREATE),
    Wrapper(async (req, res) => {
      const { permissionGroupId } = await PermissionGroup.createPermissionGroup(
        req.body
      );

      res.json({ opcode: OPCODE.SUCCESS, permissionGroupId });
    })
  );

  router.post(
    '/:permissionGroupId',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_MODIFY),
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
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_DELETE),
    Wrapper(async (req, res) => {
      const { permissionGroupId } = req.params;
      await PermissionGroup.deletePermissionGroup(permissionGroupId);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
