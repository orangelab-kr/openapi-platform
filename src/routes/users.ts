import { OPCODE } from '../tools';
import { PlatformUserMiddleware } from '../middlewares';
import { Router } from 'express';
import { User } from '../controllers';
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
      res.json({ opcode: OPCODE.SUCCESS, platformUserId });
    })
  );

  router.post(
    '/:platformUserId',
    PlatformUserMiddleware(),
    Wrapper(async (req, res) => {
      const { platformUser, body } = req;
      await User.modifyUser(platformUser, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:platformUserId',
    PlatformUserMiddleware(),
    Wrapper(async (req, res) => {
      const { platform, platformUser } = req;
      await User.deleteUser(platform, platformUser);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
