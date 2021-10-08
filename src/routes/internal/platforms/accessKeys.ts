import { Router } from 'express';
import {
  AccessKey,
  InternalPermissionMiddleware,
  InternalPlatformAccessKeyMiddleware,
  PERMISSION,
  RESULT,
  Wrapper,
} from '../../..';

export function getInternalPlatformsAccessKeysRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_LIST),
    Wrapper(async (req) => {
      const { internal, query } = req;
      const { platformAccessKeys, total } = await AccessKey.getAccessKeys(
        internal.platform,
        query
      );

      throw RESULT.SUCCESS({ details: { platformAccessKeys, total } });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_CREATE),
    Wrapper(async (req) => {
      const { internal, body } = req;
      const { platformAccessKeyId, platformSecretAccessKey } =
        await AccessKey.createAccessKey(internal.platform, body);

      throw RESULT.SUCCESS({
        details: {
          platformAccessKeyId,
          platformSecretAccessKey,
        },
      });
    })
  );

  router.get(
    '/:platformAccessKeyId',
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_VIEW),
    InternalPlatformAccessKeyMiddleware(),
    Wrapper(async (req) => {
      const { platformAccessKey } = req.internal;
      throw RESULT.SUCCESS({ details: { platformAccessKey } });
    })
  );

  router.post(
    '/:platformAccessKeyId',
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_MODIFY),
    InternalPlatformAccessKeyMiddleware(),
    Wrapper(async (req) => {
      const { body, internal } = req;
      await AccessKey.modifyAccessKey(internal.platformAccessKey, body);
      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/:platformAccessKeyId',
    InternalPermissionMiddleware(PERMISSION.ACCESS_KEYS_DELETE),
    InternalPlatformAccessKeyMiddleware(),
    Wrapper(async (req) => {
      const { platform, platformAccessKey } = req.internal;
      await AccessKey.deleteAccessKey(platform, platformAccessKey);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
