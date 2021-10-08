import { Router } from 'express';
import { Log, PlatformMiddleware, RESULT, Wrapper } from '..';

export function getLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    PlatformMiddleware({
      permissionIds: ['logs.list'],
      final: true,
    }),
    Wrapper(async (req) => {
      const { query, loggined } = req;
      const { total, platformLogs } = await Log.getLogs(
        query,
        loggined.platform
      );

      throw RESULT.SUCCESS({ details: { platformLogs, total } });
    })
  );

  router.get(
    '/:platformLogId',
    PlatformMiddleware({
      permissionIds: ['logs.view'],
      final: true,
    }),
    Wrapper(async (req) => {
      const {
        loggined: { platform },
        params: { platformLogId },
      } = req;

      const platformLog = await Log.getLogOrThrow(platformLogId, platform);
      throw RESULT.SUCCESS({ details: { platformLog } });
    })
  );

  return router;
}
