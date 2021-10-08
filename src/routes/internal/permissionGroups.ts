import { Router } from 'express';
import {
  InternalPermissionMiddleware,
  PERMISSION,
  PermissionGroup,
  RESULT,
  Wrapper,
} from '../..';

export function getInternalPermissionGroupsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_LIST),
    Wrapper(async (req) => {
      const { total, permissionGroups } =
        await PermissionGroup.getPermissionGroups(req.query);
      throw RESULT.SUCCESS({ details: { permissionGroups, total } });
    })
  );

  router.get(
    '/:permissionGroupId',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_VIEW),
    Wrapper(async (req) => {
      const { permissionGroupId } = req.params;
      const permissionGroup = await PermissionGroup.getPermissionGroupOrThrow(
        permissionGroupId
      );

      throw RESULT.SUCCESS({ details: { permissionGroup } });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_CREATE),
    Wrapper(async (req) => {
      const { permissionGroupId } = await PermissionGroup.createPermissionGroup(
        req.body
      );

      throw RESULT.SUCCESS({ details: { permissionGroupId } });
    })
  );

  router.post(
    '/:permissionGroupId',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_MODIFY),
    Wrapper(async (req) => {
      const { body, params } = req;
      await PermissionGroup.modifyPermissionGroup(
        params.permissionGroupId,
        body
      );

      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/:permissionGroupId',
    InternalPermissionMiddleware(PERMISSION.PERMISSION_GROUPS_DELETE),
    Wrapper(async (req) => {
      const { permissionGroupId } = req.params;
      await PermissionGroup.deletePermissionGroup(permissionGroupId);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
