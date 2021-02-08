import { InternalPlatformUserMiddleware } from '../../../middlewares/internal';
import OPCODE from '../../../tools/opcode';
import { Router } from 'express';
import User from '../../../controllers/user';
import Wrapper from '../../../tools/wrapper';

export default function getInternalPlatformsUsersRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { platform, query } = req;
      const { platformUsers, total } = await User.getUsers(platform, query);
      res.json({ opcode: OPCODE.SUCCESS, platformUsers, total });
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

  router.get(
    '/:platformUserId',
    InternalPlatformUserMiddleware(),
    Wrapper(async (req, res) => {
      const { platformUser } = req;
      res.json({ opcode: OPCODE.SUCCESS, platformUser });
    })
  );

  router.post(
    '/:platformUserId',
    InternalPlatformUserMiddleware(),
    Wrapper(async (req, res) => {
      const { body, platformUser } = req;
      await User.modifyUser(platformUser, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:platformUserId',
    InternalPlatformUserMiddleware(),
    Wrapper(async (req, res) => {
      const { platform, platformUser } = req;
      await User.deleteUser(platform, platformUser);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
