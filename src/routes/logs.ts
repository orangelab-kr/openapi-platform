import OPCODE from '../tools/opcode';
import PermissionGroup from '../controllers/permissionGroup';
import { Router } from 'express';
import Wrapper from '../tools/wrapper';

export default function getLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { query, platform } = req;
      const {
        total,
        permissionGroups,
      } = await PermissionGroup.getPermissionGroups(query, platform);
      res.json({ opcode: OPCODE.SUCCESS, permissionGroups, total });
    })
  );
  router.get(
    '/:platformLogId',
    Wrapper(async (req, res) => {
      const {
        platform,
        params: { permissionGroupId },
      } = req;
      const permissionGroup = await PermissionGroup.getPermissionGroupOrThrow(
        permissionGroupId,
        platform
      );

      res.json({ opcode: OPCODE.SUCCESS, permissionGroup });
    })
  );

  return router;
}
