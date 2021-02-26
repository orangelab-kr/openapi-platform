import AccessKey from '../controllers/accessKey';
import InternalPlatformAccessKeyMiddleware from '../middlewares/internal/platform/accessKey';
import { Log } from '../controllers';
import OPCODE from '../tools/opcode';
import { PlatformLogType } from '@prisma/client';
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
      Log.createRequestLog(
        req,
        PlatformLogType.ACCESS_KEY_CREATE,
        `${platformAccessKeyId} 액세스 키를 생성하였습니다.`
      );

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
      const { platformAccessKeyId } = platformAccessKey;
      await AccessKey.modifyAccessKey(platformAccessKey, body);
      Log.createRequestLog(
        req,
        PlatformLogType.ACCESS_KEY_MODIFY,
        `${platformAccessKeyId} 액세스 키를 수정하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:platformAccessKeyId',
    InternalPlatformAccessKeyMiddleware(),
    Wrapper(async (req, res) => {
      const { platform, platformAccessKey } = req;
      const { platformAccessKeyId } = platformAccessKey;
      await AccessKey.deleteAccessKey(platform, platformAccessKey);
      Log.createRequestLog(
        req,
        PlatformLogType.ACCESS_KEY_DELETE,
        `${platformAccessKeyId} 액세스 키를 삭제하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
