import { Router } from 'express';
import {
  getInternalPlatformsAccessKeysRouter,
  getInternalPlatformsLogsRouter,
  getInternalPlatformsUsersRouter,
  InternalPermissionMiddleware,
  InternalPlatformMiddleware,
  PERMISSION,
  Platform,
  RESULT,
  Wrapper,
} from '../../..';

export * from './accessKeys';
export * from './logs';
export * from './users';

export function getInternalPlatformsRouter(): Router {
  const router = Router();

  router.use(
    '/:platformId/users',
    InternalPlatformMiddleware(),
    getInternalPlatformsUsersRouter()
  );

  router.use(
    '/:platformId/accessKeys',
    InternalPlatformMiddleware(),
    getInternalPlatformsAccessKeysRouter()
  );

  router.use(
    '/:platformId/logs',
    InternalPlatformMiddleware(),
    getInternalPlatformsLogsRouter()
  );

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.PLATFORMS_LIST),
    Wrapper(async (req) => {
      const { platforms, total } = await Platform.getPlatforms(req.query);
      throw RESULT.SUCCESS({ details: { platforms, total } });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.PLATFORMS_CREATE),
    Wrapper(async (req) => {
      const { platformId } = await Platform.createPlatform(req.body);
      throw RESULT.SUCCESS({ details: { platformId } });
    })
  );

  router.get(
    '/:platformId',
    InternalPermissionMiddleware(PERMISSION.PLATFORMS_VIEW),
    InternalPlatformMiddleware(),
    Wrapper(async (req) => {
      const { platform } = req.internal;
      throw RESULT.SUCCESS({ details: { platform } });
    })
  );

  router.post(
    '/:platformId',
    InternalPermissionMiddleware(PERMISSION.PLATFORMS_MODIFY),
    InternalPlatformMiddleware(),
    Wrapper(async (req) => {
      const { body, internal } = req;
      await Platform.modifyPlatform(internal.platform, body);
      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/:platformId',
    InternalPermissionMiddleware(PERMISSION.PLATFORMS_DELETE),
    InternalPlatformMiddleware(),
    Wrapper(async (req) => {
      const { platform } = req.internal;
      await Platform.deletePlatform(platform);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
