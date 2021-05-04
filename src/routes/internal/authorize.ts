import {
  AccessKey,
  InternalPermissionMiddleware,
  OPCODE,
  PERMISSION,
  Wrapper,
} from '../..';

import { Router } from 'express';
import { Session } from '../../controllers';

export function getInternalAuthorizeRouter(): Router {
  const router = Router();

  router.post(
    '/user',
    InternalPermissionMiddleware(PERMISSION.AUTHORIZE_SESSION),
    Wrapper(async (req, res) => {
      const platformUser = await Session.authorizeWithSessionId(req.body);
      res.json({ opcode: OPCODE.SUCCESS, platformUser });
    })
  );

  router.post(
    '/accessKey',
    InternalPermissionMiddleware(PERMISSION.AUTHORIZE_ACCESS_KEYS),
    Wrapper(async (req, res) => {
      const accessKey = await AccessKey.authorizeWithAccessKey(req.body);
      res.json({ opcode: OPCODE.SUCCESS, accessKey });
    })
  );

  return router;
}
