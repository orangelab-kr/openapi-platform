import AccessKey from '../../controllers/accessKey';
import InternalPermissionMiddleware from '../../middlewares/internal/permissions';
import OPCODE from '../../tools/opcode';
import { PERMISSION } from '../../middlewares/internal';
import { Router } from 'express';
import Wrapper from '../../tools/wrapper';

export default function getInternalAccessKeysRouter(): Router {
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
