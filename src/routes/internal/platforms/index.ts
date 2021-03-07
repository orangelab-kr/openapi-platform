import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../../middlewares/internal/permissions';

import InternalPlatformMiddleware from '../../../middlewares/internal/platform';
import OPCODE from '../../../tools/opcode';
import Platform from '../../../controllers/platform';
import { Router } from 'express';
import Wrapper from '../../../tools/wrapper';
import getInternalPlatformsAccessKeysRouter from './accessKeys';
import getInternalPlatformsLogsRouter from './logs';
import getInternalPlatformsUsersRouter from './users';

export default function getInternalPlatformsRouter(): Router {
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
    InternalPermissionMiddleware(PERMISSION.PLATFORMS_DETAIL),
    Wrapper(async (req, res) => {
      const { platforms, total } = await Platform.getPlatforms(req.query);
      res.json({ opcode: OPCODE.SUCCESS, platforms, total });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.PLATFORMS_CREATE),
    Wrapper(async (req, res) => {
      const { platformId } = await Platform.createPlatform(req.body);
      res.json({ opcode: OPCODE.SUCCESS, platformId });
    })
  );

  router.get(
    '/:platformId',
    InternalPermissionMiddleware(PERMISSION.PLATFORMS_VIEW),
    InternalPlatformMiddleware(),
    Wrapper(async (req, res) => {
      const { platform } = req;
      res.json({ opcode: OPCODE.SUCCESS, platform });
    })
  );

  router.post(
    '/:platformId',
    InternalPermissionMiddleware(PERMISSION.PLATFORMS_MODIFY),
    InternalPlatformMiddleware(),
    Wrapper(async (req, res) => {
      const { body, platform } = req;
      await Platform.modifyPlatform(platform, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:platformId',
    InternalPermissionMiddleware(PERMISSION.PLATFORMS_DELETE),
    InternalPlatformMiddleware(),
    Wrapper(async (req, res) => {
      const { platform } = req;
      await Platform.deletePlatform(platform);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
