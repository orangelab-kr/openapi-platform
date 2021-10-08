import { PlatformLogType } from '@prisma/client';
import { Router } from 'express';
import {
  Log,
  PlatformMiddleware,
  PlatformUserMiddleware,
  RESULT,
  User,
  Wrapper,
} from '..';

export function getUserRouter(): Router {
  const router = Router();

  router.get(
    '/',
    PlatformMiddleware({ permissionIds: ['users.list'], final: true }),
    Wrapper(async (req) => {
      const { loggined, query } = req;
      const { total, platformUsers } = await User.getUsers(
        loggined.platform,
        query
      );

      throw RESULT.SUCCESS({ details: { platformUsers, total } });
    })
  );

  router.get(
    '/:platformUserId',
    PlatformMiddleware({ permissionIds: ['users.view'], final: true }),
    PlatformUserMiddleware(),
    Wrapper(async (req) => {
      const { platformUser } = req;
      throw RESULT.SUCCESS({ details: { platformUser } });
    })
  );

  router.post(
    '/',
    PlatformMiddleware({ permissionIds: ['users.create'], final: true }),
    Wrapper(async (req) => {
      const { loggined, body } = req;
      const { platformUserId } = await User.createUser(loggined.platform, body);
      Log.createRequestLog(
        req,
        PlatformLogType.USER_CREATE,
        `${platformUserId} 사용자를 추가하였습니다.`
      );

      throw RESULT.SUCCESS({ details: { platformUserId } });
    })
  );

  router.post(
    '/:platformUserId',
    PlatformMiddleware({ permissionIds: ['users.update'], final: true }),
    PlatformUserMiddleware(),
    Wrapper(async (req) => {
      const { platformUser, body } = req;
      const { platformUserId } = platformUser;
      await User.modifyUser(platformUser, body);
      Log.createRequestLog(
        req,
        PlatformLogType.USER_MODIFY,
        `${platformUserId} 사용자를 수정하였습니다.`
      );

      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/:platformUserId',
    PlatformMiddleware({ permissionIds: ['users.delete'], final: true }),
    PlatformUserMiddleware(),
    Wrapper(async (req) => {
      const { loggined, platformUser } = req;
      const { platformUserId } = platformUser;
      await User.deleteUser(loggined.platform, platformUser);
      Log.createRequestLog(
        req,
        PlatformLogType.USER_DELETE,
        `${platformUserId} 사용자를 삭제하였습니다.`
      );

      throw RESULT.SUCCESS();
    })
  );

  return router;
}
