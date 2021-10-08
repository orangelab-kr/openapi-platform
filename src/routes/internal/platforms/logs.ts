import { Router } from 'express';
import {
  InternalPermissionMiddleware,
  Log,
  PERMISSION,
  RESULT,
  Wrapper,
} from '../../..';

export function getInternalPlatformsLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.LOGS_LIST),
    Wrapper(async (req) => {
      const {
        query,
        internal: { platform },
      } = req;

      const { total, platformLogs } = await Log.getLogs(query, platform);
      throw RESULT.SUCCESS({ details: { platformLogs, total } });
    })
  );

  router.get(
    '/:platformLogId',
    InternalPermissionMiddleware(PERMISSION.LOGS_VIEW),
    Wrapper(async (req) => {
      const {
        internal: { platform },
        params: { platformLogId },
      } = req;

      const platformLog = await Log.getLogOrThrow(platformLogId, platform);
      throw RESULT.SUCCESS({ details: { platformLog } });
    })
  );

  return router;
}
