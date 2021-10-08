import { PlatformLogType } from '@prisma/client';
import { Router } from 'express';
import {
  AccessKey,
  Log,
  PlatformAccessKeyMiddleware,
  PlatformMiddleware,
  RESULT,
  Wrapper,
} from '..';

export function getAccessKeysRouter(): Router {
  const router = Router();

  router.get(
    '/',
    PlatformMiddleware({ permissionIds: ['accessKeys.list'], final: true }),
    Wrapper(async (req) => {
      const { loggined, query } = req;
      const { platformAccessKeys, total } = await AccessKey.getAccessKeys(
        loggined.platform,
        query
      );

      throw RESULT.SUCCESS({ details: { platformAccessKeys, total } });
    })
  );

  router.post(
    '/',
    PlatformMiddleware({ permissionIds: ['accessKeys.create'], final: true }),
    Wrapper(async (req) => {
      const { loggined, body } = req;
      const { platformAccessKeyId, platformSecretAccessKey } =
        await AccessKey.createAccessKey(loggined.platform, body);
      Log.createRequestLog(
        req,
        PlatformLogType.ACCESS_KEY_CREATE,
        `${platformAccessKeyId} 액세스 키를 생성하였습니다.`
      );

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
    PlatformMiddleware({ permissionIds: ['accessKeys.view'], final: true }),
    PlatformAccessKeyMiddleware(),
    Wrapper(async (req) => {
      const { platformAccessKey } = req;
      throw RESULT.SUCCESS({ details: { platformAccessKey } });
    })
  );

  router.post(
    '/:platformAccessKeyId',
    PlatformMiddleware({ permissionIds: ['accessKeys.update'], final: true }),
    PlatformAccessKeyMiddleware(),
    Wrapper(async (req) => {
      const { body, platformAccessKey } = req;
      const { platformAccessKeyId } = platformAccessKey;
      await AccessKey.modifyAccessKey(platformAccessKey, body);
      Log.createRequestLog(
        req,
        PlatformLogType.ACCESS_KEY_MODIFY,
        `${platformAccessKeyId} 액세스 키를 수정하였습니다.`
      );

      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/:platformAccessKeyId',
    PlatformMiddleware({ permissionIds: ['accessKeys.delete'], final: true }),
    PlatformAccessKeyMiddleware(),
    Wrapper(async (req) => {
      const { loggined, platformAccessKey } = req;
      const { platformAccessKeyId } = platformAccessKey;
      await AccessKey.deleteAccessKey(loggined.platform, platformAccessKey);
      Log.createRequestLog(
        req,
        PlatformLogType.ACCESS_KEY_DELETE,
        `${platformAccessKeyId} 액세스 키를 삭제하였습니다.`
      );

      throw RESULT.SUCCESS();
    })
  );

  return router;
}
