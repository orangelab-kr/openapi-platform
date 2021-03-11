import { Log } from '../controllers';
import OPCODE from '../tools/opcode';
import { Router } from 'express';
import Wrapper from '../tools/wrapper';

export default function getLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
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
