import { RESULT, User, Wrapper, WrapperCallback } from '..';

export function PlatformUserMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const {
      loggined: { platform },
      params: { platformUserId },
    } = req;

    if (!platform || !platformUserId) throw RESULT.CANNOT_FIND_USER();
    const platformUser = await User.getUserOrThrow(platform, platformUserId);
    req.platformUser = platformUser;
    next();
  });
}
