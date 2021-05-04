import { OPCODE, PlatformMiddleware, Session, User, Wrapper } from '..';

import { Router } from 'express';

export function getAuthRouter(): Router {
  const router = Router();

  router.get(
    '/',
    PlatformMiddleware(),
    Wrapper(async (req, res) => {
      const { platformUser, platformAccessKey } = req.loggined;
      res.json({
        opcode: OPCODE.SUCCESS,
        platformUser,
        platformAccessKey,
      });
    })
  );

  router.post(
    '/',
    PlatformMiddleware(['user']),
    Wrapper(async (req, res) => {
      const { body, loggined } = req;
      delete body.permissionGroupId;
      await User.modifyUser(loggined.platformUser, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.post(
    '/email',
    Wrapper(async (req, res) => {
      const { headers, body } = req;
      const userAgent = headers['user-agent'];
      const platformUser = await Session.loginUserByEmail(body);
      const sessionId = await Session.createSession(platformUser, userAgent);
      res.json({ opcode: OPCODE.SUCCESS, sessionId });
    })
  );

  router.post(
    '/phone',
    Wrapper(async (req, res) => {
      const { headers, body } = req;
      const userAgent = headers['user-agent'];
      const platformUser = await Session.loginUserByPhone(body);
      const sessionId = await Session.createSession(platformUser, userAgent);
      res.json({ opcode: OPCODE.SUCCESS, sessionId });
    })
  );

  router.delete(
    '/',
    PlatformMiddleware(['user']),
    Wrapper(async (req, res) => {
      await Session.revokeAllSession(req.loggined.platformUser);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
