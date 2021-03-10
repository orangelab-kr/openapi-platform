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
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_LIST),
    Wrapper(async (req, res) => {
      const { internal, query } = req;
      const { platformAccessKeys, total } = await AccessKey.getAccessKeys(
        internal.platform,
        query
      );

      res.json({ opcode: OPCODE.SUCCESS, platformAccessKeys, total });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_CREATE),
    Wrapper(async (req, res) => {
      const { internal, body } = req;
      const {
        platformAccessKeyId,
        platformSecretAccessKey,
      } = await AccessKey.createAccessKey(internal.platform, body);

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
      const { platformAccessKey } = req.internal;
      res.json({ opcode: OPCODE.SUCCESS, platformAccessKey });
    })
  );

  router.post(
    '/:platformAccessKeyId',
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_MODIFY),
    InternalPlatformAccessKeyMiddleware(),
    Wrapper(async (req, res) => {
      const { body, internal } = req;
      await AccessKey.modifyAccessKey(internal.platformAccessKey, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:platformAccessKeyId',
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_DELETE),
    InternalPlatformAccessKeyMiddleware(),
    Wrapper(async (req, res) => {
      const { platform, platformAccessKey } = req.internal;
      await AccessKey.deleteAccessKey(platform, platformAccessKey);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
