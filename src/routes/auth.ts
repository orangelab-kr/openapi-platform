import { OPCODE } from '../tools';
import { PlatformMiddleware } from '../middlewares';
import { Router } from 'express';
import Session from '../controllers/session';
import { User } from '../controllers';
import Wrapper from '../tools/wrapper';

export default function getAuthRouter(): Router {
  const router = Router();

  router.get(
    '/',
    PlatformMiddleware(),
    Wrapper(async (req, res) => {
      const { platformUser, platformAccessKey } = req.internal;
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
      const { body, internal } = req;
      delete body.permissionGroupId;
      await User.modifyUser(internal.platformUser, body);
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
      await Session.revokeAllSession(req.platformUser);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
