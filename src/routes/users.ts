import { Log, OPCODE, PlatformUserMiddleware, User, Wrapper } from '..';

import { PlatformLogType } from '@prisma/client';
import { Router } from 'express';

export function getUserRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { loggined, query } = req;
      const { total, platformUsers } = await User.getUsers(
        loggined.platform,
        query
      );

      res.json({ opcode: OPCODE.SUCCESS, platformUsers, total });
    })
  );

  router.get(
    '/:platformUserId',
    PlatformUserMiddleware(),
    Wrapper(async (req, res) => {
      const { platformUser } = req;
      res.json({ opcode: OPCODE.SUCCESS, platformUser });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const { loggined, body } = req;
      const { platformUserId } = await User.createUser(loggined.platform, body);
      Log.createRequestLog(
        req,
        PlatformLogType.USER_CREATE,
        `${platformUserId} 사용자를 추가하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS, platformUserId });
    })
  );

  router.post(
    '/:platformUserId',
    PlatformUserMiddleware(),
    Wrapper(async (req, res) => {
      const { platformUser, body } = req;
      const { platformUserId } = platformUser;
      await User.modifyUser(platformUser, body);
      Log.createRequestLog(
        req,
        PlatformLogType.USER_MODIFY,
        `${platformUserId} 사용자를 수정하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:platformUserId',
    PlatformUserMiddleware(),
    Wrapper(async (req, res) => {
      const { loggined, platformUser } = req;
      const { platformUserId } = platformUser;
      await User.deleteUser(loggined.platform, platformUser);
      Log.createRequestLog(
        req,
        PlatformLogType.USER_DELETE,
        `${platformUserId} 사용자를 삭제하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
