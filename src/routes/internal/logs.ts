import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

import { Log } from '../../controllers';
import { Router } from 'express';

export default function getInternalLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.LOGS_LIST),
    Wrapper(async (req, res) => {
      const { query } = req;
      const { total, platformLogs } = await Log.getLogs(query);
      res.json({ opcode: OPCODE.SUCCESS, platformLogs, total });
    })
  );

  router.get(
    '/:platformLogId',
    InternalPermissionMiddleware(PERMISSION.LOGS_VIEW),
    Wrapper(async (req, res) => {
      const {
        params: { platformLogId },
      } = req;

      const platformLog = await Log.getLogOrThrow(platformLogId);
      res.json({ opcode: OPCODE.SUCCESS, platformLog });
    })
  );

  return router;
}
