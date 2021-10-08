import { Router } from 'express';
import { PlatformMiddleware, RESULT, Session, User, Wrapper } from '..';

export function getAuthRouter(): Router {
  const router = Router();

  router.get(
    '/',
    PlatformMiddleware({ permissionIds: ['auth.view'], final: true }),
    Wrapper(async (req) => {
      const { platformUser, platformAccessKey } = req.loggined;
      throw RESULT.SUCCESS({
        details: {
          platformUser,
          platformAccessKey,
        },
      });
    })
  );

  router.post(
    '/',
    PlatformMiddleware({
      only: ['user'],
      permissionIds: ['auth.update'],
      final: true,
    }),
    Wrapper(async (req) => {
      const { body, loggined } = req;
      delete body.permissionGroupId;
      await User.modifyUser(loggined.platformUser, body);
      throw RESULT.SUCCESS();
    })
  );

  router.post(
    '/email',
    Wrapper(async (req) => {
      const { headers, body } = req;
      const userAgent = headers['user-agent'];
      const platformUser = await Session.loginUserByEmail(body);
      const sessionId = await Session.createSession(platformUser, userAgent);
      throw RESULT.SUCCESS({ details: { sessionId } });
    })
  );

  router.post(
    '/phone',
    Wrapper(async (req) => {
      const { headers, body } = req;
      const userAgent = headers['user-agent'];
      const platformUser = await Session.loginUserByPhone(body);
      const sessionId = await Session.createSession(platformUser, userAgent);
      throw RESULT.SUCCESS({ details: { sessionId } });
    })
  );

  router.delete(
    '/',
    PlatformMiddleware({
      only: ['user'],
      permissionIds: ['auth.logout-all'],
      final: true,
    }),
    Wrapper(async (req) => {
      await Session.revokeAllSession(req.loggined.platformUser);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
