import AccessKey from '../../../controllers/accessKey';
import InternalPermissionMiddleware from '../../../middlewares/internal/permissions';
import InternalPlatformAccessKeyMiddleware from '../../../middlewares/internal/platform/accessKey';
import OPCODE from '../../../tools/opcode';
import { PERMISSION } from '../../../middlewares/internal';
import { Router } from 'express';
import Wrapper from '../../../tools/wrapper';

export default function getInternalPlatformsAccessKeysRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_DETAIL),
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
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_CREATE),
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
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_VIEW),
    InternalPlatformAccessKeyMiddleware(),
    Wrapper(async (req, res) => {
      const { platformAccessKey } = req;
      res.json({ opcode: OPCODE.SUCCESS, platformAccessKey });
    })
  );

  router.post(
    '/:platformAccessKeyId',
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_MODIFY),
    InternalPlatformAccessKeyMiddleware(),
    Wrapper(async (req, res) => {
      const { body, platformAccessKey } = req;
      await AccessKey.modifyAccessKey(platformAccessKey, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:platformAccessKeyId',
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_DELETE),
    InternalPlatformAccessKeyMiddleware(),
    Wrapper(async (req, res) => {
      const { platform, platformAccessKey } = req;
      await AccessKey.deleteAccessKey(platform, platformAccessKey);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
