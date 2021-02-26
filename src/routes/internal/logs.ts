import { OPCODE, Wrapper } from '../../tools';

import { Log } from '../../controllers';
import { Router } from 'express';

export default function getInternalLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { query } = req;
      const { total, platformLogs } = await Log.getLogs(query);
      res.json({ opcode: OPCODE.SUCCESS, platformLogs, total });
    })
  );

  router.get(
    '/:platformLogId',
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
