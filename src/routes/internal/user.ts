import { Router } from 'express';
import Wrapper from '../../tools/wrapper';

export default function getInternalUserRouter(): Router {
  const router = Router();

  router.post(
    '/',
    Wrapper(async (req, res) => {
      // const { platformUserId } = User.createUser()
    })
  );

  return router;
}
