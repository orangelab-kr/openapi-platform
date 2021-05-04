import {
  AccessKey,
  InternalPermissionMiddleware,
  OPCODE,
  PERMISSION,
  Wrapper,
} from '../..';

import { Router } from 'express';

export function getInternalAccessKeysRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_AUTHORIZE),
    Wrapper(async (req, res) => {
      const accessKey = await AccessKey.authorizeWithAccessKey(
        req.query as any
      );

      res.json({ opcode: OPCODE.SUCCESS, accessKey });
    })
  );

  return router;
}
