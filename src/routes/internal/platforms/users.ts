import { Router } from 'express';
import {
  InternalPermissionMiddleware,
  InternalPlatformUserMiddleware,
  PERMISSION,
  RESULT,
  User,
  Wrapper,
} from '../../..';

export function getInternalPlatformsUsersRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.USERS_LIST),
    Wrapper(async (req) => {
      const { internal, query } = req;
      const { platformUsers, total } = await User.getUsers(
        internal.platform,
        query
      );

      throw RESULT.SUCCESS({ details: { platformUsers, total } });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.USERS_CREATE),
    Wrapper(async (req) => {
      const { internal, body } = req;
      const { platformUserId } = await User.createUser(internal.platform, body);
      throw RESULT.SUCCESS({ details: { platformUserId } });
    })
  );

  router.get(
    '/:platformUserId',
    InternalPermissionMiddleware(PERMISSION.USERS_VIEW),
    InternalPlatformUserMiddleware(),
    Wrapper(async (req) => {
      const { platformUser } = req.internal;
      throw RESULT.SUCCESS({ details: { platformUser } });
    })
  );

  router.post(
    '/:platformUserId',
    InternalPermissionMiddleware(PERMISSION.USERS_MODIFY),
    InternalPlatformUserMiddleware(),
    Wrapper(async (req) => {
      const { body, internal } = req;
      await User.modifyUser(internal.platformUser, body);
      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/:platformUserId',
    InternalPermissionMiddleware(PERMISSION.USERS_DELETE),
    InternalPlatformUserMiddleware(),
    Wrapper(async (req) => {
      const { platform, platformUser } = req.internal;
      await User.deleteUser(platform, platformUser);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
