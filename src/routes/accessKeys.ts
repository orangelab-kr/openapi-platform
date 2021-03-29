import AccessKey from '../controllers/accessKey';
import { Log } from '../controllers';
import OPCODE from '../tools/opcode';
import { PlatformAccessKeyMiddleware } from '../middlewares';
import { PlatformLogType } from '@prisma/client';
import { Router } from 'express';
import Wrapper from '../tools/wrapper';

export default function getAccessKeysRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { loggined, query } = req;
      const { platformAccessKeys, total } = await AccessKey.getAccessKeys(
        loggined.platform,
        query
      );

      res.json({ opcode: OPCODE.SUCCESS, platformAccessKeys, total });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const { loggined, body } = req;
      const {
        platformAccessKeyId,
        platformSecretAccessKey,
      } = await AccessKey.createAccessKey(loggined.platform, body);
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
    PlatformAccessKeyMiddleware(),
    Wrapper(async (req, res) => {
      const { platformAccessKey } = req;
      res.json({ opcode: OPCODE.SUCCESS, platformAccessKey });
    })
  );

  router.post(
    '/:platformAccessKeyId',
    PlatformAccessKeyMiddleware(),
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
    PlatformAccessKeyMiddleware(),
    Wrapper(async (req, res) => {
      const { loggined, platformAccessKey } = req;
      const { platformAccessKeyId } = platformAccessKey;
      await AccessKey.deleteAccessKey(loggined.platform, platformAccessKey);
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
