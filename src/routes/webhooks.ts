import { Log } from '../controllers';
import OPCODE from '../tools/opcode';
import { PlatformLogType } from '.prisma/client';
import { Router } from 'express';
import Webhook from '../controllers/webhook';
import Wrapper from '../tools/wrapper';

export default function getWebhooksRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { platform } = req.loggined;
      const webhooks = await Webhook.getWebhooks(platform);
      res.json({ opcode: OPCODE.SUCCESS, webhooks });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const { loggined, body } = req;
      const webhooks = await Webhook.setWebhooks(loggined.platform, req.body);
      Log.createRequestLog(
        req,
        PlatformLogType.WEBHOOK_MODIFY,
        `${Object.keys(body).join(', ')} 웹훅을 수정하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS, webhooks });
    })
  );

  return router;
}
