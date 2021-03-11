import { Log } from '../controllers';
import OPCODE from '../tools/opcode';
import PermissionGroup from '../controllers/permissionGroup';
import { PlatformLogType } from '@prisma/client';
import { Router } from 'express';
import Wrapper from '../tools/wrapper';

export default function getPermissionGroupsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { query, loggined } = req;
      const {
        total,
        permissionGroups,
      } = await PermissionGroup.getPermissionGroups(query, loggined.platform);
      res.json({ opcode: OPCODE.SUCCESS, permissionGroups, total });
    })
  );

  router.get(
    '/:permissionGroupId',
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
