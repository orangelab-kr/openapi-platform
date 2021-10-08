import { AccessKey, RESULT, Wrapper, WrapperCallback } from '../../..';

export function InternalPlatformAccessKeyMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const {
      internal: { platform },
      params: { platformAccessKeyId },
    } = req;

    if (!platform || !platformAccessKeyId) {
      throw RESULT.CANNOT_FIND_ACCESS_KEY();
    }

    const platformAccessKey = await AccessKey.getAccessKeyOrThrow(
      platform,
      platformAccessKeyId
    );

    req.internal.platformAccessKey = platformAccessKey;
    next();
  });
}
