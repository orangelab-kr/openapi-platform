import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../../middlewares/internal/permissions';

import { InternalPlatformUserMiddleware } from '../../../middlewares/internal';
import OPCODE from '../../../tools/opcode';
import { Router } from 'express';
import User from '../../../controllers/user';
import Wrapper from '../../../tools/wrapper';

export default function getInternalPlatformsUsersRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.USERS_DETAIL),
    Wrapper(async (req, res) => {
      const { internal, query } = req;
      const { platformUsers, total } = await User.getUsers(
        internal.platform,
        query
      );

      res.json({ opcode: OPCODE.SUCCESS, platformUsers, total });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.USERS_CREATE),
    Wrapper(async (req, res) => {
      const { internal, body } = req;
      const { platformUserId } = await User.createUser(internal.platform, body);
      res.json({ opcode: OPCODE.SUCCESS, platformUserId });
    })
  );

  router.get(
    '/:platformUserId',
    InternalPermissionMiddleware(PERMISSION.USERS_VIEW),
    InternalPlatformUserMiddleware(),
    Wrapper(async (req, res) => {
      const { platformUser } = req.internal;
      res.json({ opcode: OPCODE.SUCCESS, platformUser });
    })
  );

  router.post(
    '/:platformUserId',
    InternalPermissionMiddleware(PERMISSION.USERS_MODIFY),
    InternalPlatformUserMiddleware(),
    Wrapper(async (req, res) => {
      const { body, internal } = req;
      await User.modifyUser(internal.platformUser, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:platformUserId',
    InternalPermissionMiddleware(PERMISSION.USERS_DELETE),
    InternalPlatformUserMiddleware(),
    Wrapper(async (req, res) => {
      const { platform, platformUser } = req.internal;
      await User.deleteUser(platform, platformUser);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
