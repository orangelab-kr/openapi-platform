import AccessKey from '../../controllers/accessKey';
import OPCODE from '../../tools/opcode';
import { Router } from 'express';
import Wrapper from '../../tools/wrapper';

export default function getInternalAccessKeysRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const accessKey = await AccessKey.authorizeWithAccessKey(
        req.query as any
      );

      res.json({ opcode: OPCODE.SUCCESS, accessKey });
    })
  );

  return router;
}
