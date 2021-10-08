import {
  InternalPermissionMiddleware,
  Log,
  RESULT,
  PERMISSION,
  Wrapper,
} from '../..';

import { Router } from 'express';

export function getInternalLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.LOGS_LIST),
    Wrapper(async (req) => {
      const { query } = req;
      const { total, platformLogs } = await Log.getLogs(query);
      throw RESULT.SUCCESS({ details: { platformLogs, total } });
    })
  );

  router.get(
    '/:platformLogId',
    InternalPermissionMiddleware(PERMISSION.LOGS_VIEW),
    Wrapper(async (req) => {
      const {
        params: { platformLogId },
      } = req;

      const platformLog = await Log.getLogOrThrow(platformLogId);
      throw RESULT.SUCCESS({ details: { platformLog } });
    })
  );

  return router;
}
