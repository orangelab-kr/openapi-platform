import OPCODE from '../tools/opcode';
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

      res.json({ opcode: OPCODE.SUCCESS, webhooks });
    })
  );

  return router;
}
