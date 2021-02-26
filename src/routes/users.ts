import { Log, User } from '../controllers';

import { OPCODE } from '../tools';
import { PlatformLogType } from '@prisma/client';
import { PlatformUserMiddleware } from '../middlewares';
import { Router } from 'express';
import Wrapper from '../tools/wrapper';

export default function getUserRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { platform, query } = req;
      const { total, platformUsers } = await User.getUsers(platform, query);
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
      const { platform, body } = req;
      const { platformUserId } = await User.createUser(platform, body);
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
      const { platform, platformUser } = req;
      const { platformUserId } = platformUser;
      await User.deleteUser(platform, platformUser);
      Log.createRequestLog(
        req,
        PlatformLogType.USER_DELETE,
        `${platformUserId} 사용자를 추가하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
