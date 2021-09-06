import { PlatformLogType } from '@prisma/client';
import { Router } from 'express';
import { Log, OPCODE, PermissionGroup, PlatformMiddleware, Wrapper } from '..';

export function getPermissionGroupsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    PlatformMiddleware({
      permissionIds: ['permissionGroups.list'],
      final: true,
    }),
    Wrapper(async (req, res) => {
      const { query, loggined } = req;
      const { total, permissionGroups } =
        await PermissionGroup.getPermissionGroups(query, loggined.platform);
      res.json({ opcode: OPCODE.SUCCESS, permissionGroups, total });
    })
  );

  router.get(
    '/:permissionGroupId',
    PlatformMiddleware({
      permissionIds: ['permissionGroups.view'],
      final: true,
    }),

    Wrapper(async (req, res) => {
      const {
        loggined: { platform },
        params: { permissionGroupId },
      } = req;
      const permissionGroup = await PermissionGroup.getPermissionGroupOrThrow(
        permissionGroupId,
        platform
      );

      res.json({ opcode: OPCODE.SUCCESS, permissionGroup });
    })
  );

  router.post(
    '/',
    PlatformMiddleware({
      permissionIds: ['permissionGroups.create'],
      final: true,
    }),
    Wrapper(async (req, res) => {
      const { loggined, body } = req;
      const { permissionGroupId } = await PermissionGroup.createPermissionGroup(
        body,
        loggined.platform
      );

      Log.createRequestLog(
        req,
        PlatformLogType.PERMISSION_GROUP_CREATE,
        `${permissionGroupId} 권한 그룹을 생성하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS, permissionGroupId });
    })
  );

  router.post(
    '/:permissionGroupId',
    PlatformMiddleware({
      permissionIds: ['permissionGroups.update'],
      final: true,
    }),
    Wrapper(async (req, res) => {
      const {
        body,
        loggined: { platform },
        params: { permissionGroupId },
      } = req;
      await PermissionGroup.modifyPermissionGroup(
        permissionGroupId,
        body,
        platform
      );

      Log.createRequestLog(
        req,
        PlatformLogType.PERMISSION_GROUP_MODIFY,
        `${permissionGroupId} 권한 그룹을 수정하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:permissionGroupId',
    PlatformMiddleware({
      permissionIds: ['permissionGroups.delete'],
      final: true,
    }),
    Wrapper(async (req, res) => {
      const {
        loggined: { platform },
        params: { permissionGroupId },
      } = req;
      await PermissionGroup.deletePermissionGroup(permissionGroupId, platform);
      Log.createRequestLog(
        req,
        PlatformLogType.PERMISSION_GROUP_DELETE,
        `${permissionGroupId} 권한 그룹을 삭제하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
