import {
  InternalPermissionMiddleware,
  Log,
  OPCODE,
  PERMISSION,
  Wrapper,
} from '../../..';

import { Router } from 'express';

export function getInternalPlatformsLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.LOGS_LIST),
    Wrapper(async (req, res) => {
      const {
        query,
        internal: { platform },
      } = req;

      const { total, platformLogs } = await Log.getLogs(query, platform);
      res.json({ opcode: OPCODE.SUCCESS, platformLogs, total });
    })
  );

  router.get(
    '/:platformLogId',
    InternalPermissionMiddleware(PERMISSION.LOGS_VIEW),
    Wrapper(async (req, res) => {
      const {
        internal: { platform },
        params: { platformLogId },
      } = req;

      const platformLog = await Log.getLogOrThrow(platformLogId, platform);
      res.json({ opcode: OPCODE.SUCCESS, platformLog });
    })
  );

  return router;
}
