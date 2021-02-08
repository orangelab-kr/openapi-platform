import InternalPlatformMiddleware from '../../../middlewares/internal/platform';
import OPCODE from '../../../tools/opcode';
import Platform from '../../../controllers/platform';
import { Router } from 'express';
import Wrapper from '../../../tools/wrapper';
import getInternalPlatformsAccessKeysRouter from './accessKeys';
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

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { platforms, total } = await Platform.getPlatforms(req.query);
      res.json({ opcode: OPCODE.SUCCESS, platforms, total });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const { platformId } = await Platform.createPlatform(req.body);
      res.json({ opcode: OPCODE.SUCCESS, platformId });
    })
  );

  router.get(
    '/:platformId',
    InternalPlatformMiddleware(),
    Wrapper(async (req, res) => {
      const { platform } = req;
      res.json({ opcode: OPCODE.SUCCESS, platform });
    })
  );

  router.post(
    '/:platformId',
    InternalPlatformMiddleware(),
    Wrapper(async (req, res) => {
      const { body, platform } = req;
      await Platform.modifyPlatform(platform, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:platformId',
    InternalPlatformMiddleware(),
    Wrapper(async (req, res) => {
      const { platform } = req;
      await Platform.deletePlatform(platform);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
