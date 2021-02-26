import { OPCODE, Wrapper } from '../../../tools';

import { Log } from '../../../controllers';
import { Router } from 'express';

export default function getInternalPlatformsLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
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
