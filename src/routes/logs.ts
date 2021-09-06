import { Router } from 'express';
import { Log, OPCODE, PlatformMiddleware, Wrapper } from '..';

export function getLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    PlatformMiddleware({
      permissionIds: ['logs.list'],
      final: true,
    }),
    Wrapper(async (req, res) => {
      const { query, loggined } = req;
      const { total, platformLogs } = await Log.getLogs(
        query,
        loggined.platform
      );

      res.json({ opcode: OPCODE.SUCCESS, platformLogs, total });
    })
  );

  router.get(
    '/:platformLogId',
    PlatformMiddleware({
      permissionIds: ['logs.view'],
      final: true,
    }),
    Wrapper(async (req, res) => {
      const {
        loggined: { platform },
        params: { platformLogId },
      } = req;

      const platformLog = await Log.getLogOrThrow(platformLogId, platform);
      res.json({ opcode: OPCODE.SUCCESS, platformLog });
    })
  );

  return router;
}
