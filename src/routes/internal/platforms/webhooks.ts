import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../../middlewares/internal/permissions';

import OPCODE from '../../../tools/opcode';
import { Router } from 'express';
import Webhook from '../../../controllers/webhook';
import Wrapper from '../../../tools/wrapper';

export default function getInternalWebhooksRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.WEBHOOK_VIEW),
    Wrapper(async (req, res) => {
      const { platform } = req.internal;
      const webhooks = await Webhook.getWebhooks(platform);
      res.json({ opcode: OPCODE.SUCCESS, webhooks });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.WEBHOOK_MODIFY),
    Wrapper(async (req, res) => {
      const { internal, body } = req;
      const webhooks = await Webhook.setWebhooks(internal.platform, body);
      res.json({ opcode: OPCODE.SUCCESS, webhooks });
    })
  );

  return router;
}
