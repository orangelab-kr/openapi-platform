import {
  AccessKey,
  InternalPermissionMiddleware,
  RESULT,
  PERMISSION,
  Wrapper,
} from '../..';

import { Router } from 'express';
import { Session } from '../../controllers';

export function getInternalAuthorizeRouter(): Router {
  const router = Router();

  router.post(
    '/user',
    InternalPermissionMiddleware(PERMISSION.AUTHORIZE_USER),
    Wrapper(async (req) => {
      const platformUser = await Session.authorizeWithSessionId(req.body);
      throw RESULT.SUCCESS({ details: { platformUser } });
    })
  );

  router.post(
    '/accessKey',
    InternalPermissionMiddleware(PERMISSION.AUTHORIZE_ACCESS_KEY),
    Wrapper(async (req) => {
      const accessKey = await AccessKey.authorizeWithAccessKey(req.body);
      throw RESULT.SUCCESS({ details: { accessKey } });
    })
  );

  return router;
}
