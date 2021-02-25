import AccessKey from '../controllers/accessKey';
import InternalPlatformAccessKeyMiddleware from '../middlewares/internal/platform/accessKey';
import OPCODE from '../tools/opcode';
import { Router } from 'express';
import Wrapper from '../tools/wrapper';

export default function getAccessKeysRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { platform, query } = req;
      const { platformAccessKeys, total } = await AccessKey.getAccessKeys(
        platform,
        query
      );

      res.json({ opcode: OPCODE.SUCCESS, platformAccessKeys, total });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const { platform, body } = req;
      const {
        platformAccessKeyId,
        platformSecretAccessKey,
      } = await AccessKey.createAccessKey(platform, body);
      res.json({
        opcode: OPCODE.SUCCESS,
        platformAccessKeyId,
        platformSecretAccessKey,
      });
    })
  );

  router.get(
    '/:platformAccessKeyId',
    InternalPlatformAccessKeyMiddleware(),
    Wrapper(async (req, res) => {
      const { platformAccessKey } = req;
      res.json({ opcode: OPCODE.SUCCESS, platformAccessKey });
    })
  );

  router.post(
    '/:platformAccessKeyId',
    InternalPlatformAccessKeyMiddleware(),
    Wrapper(async (req, res) => {
      const { body, platformAccessKey } = req;
      await AccessKey.modifyAccessKey(platformAccessKey, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:platformAccessKeyId',
    InternalPlatformAccessKeyMiddleware(),
    Wrapper(async (req, res) => {
      const { platform, platformAccessKey } = req;
      await AccessKey.deleteAccessKey(platform, platformAccessKey);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
