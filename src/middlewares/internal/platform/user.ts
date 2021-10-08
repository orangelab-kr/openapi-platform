import { RESULT, User, Wrapper, WrapperCallback } from '../../..';

export function InternalPlatformUserMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const {
      internal: { platform },
      params: { platformUserId },
    } = req;

    if (!platform || !platformUserId) throw RESULT.CANNOT_FIND_USER();
    const platformUser = await User.getUserOrThrow(platform, platformUserId);
    req.internal.platformUser = platformUser;

    next();
  });
}
