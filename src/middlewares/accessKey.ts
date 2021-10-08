import { AccessKey, RESULT, Wrapper, WrapperCallback } from '..';

export function PlatformAccessKeyMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const {
      loggined: { platform },
      params: { platformAccessKeyId },
    } = req;

    if (!platform || !platformAccessKeyId) {
      throw RESULT.CANNOT_FIND_ACCESS_KEY();
    }

    const platformAccessKey = await AccessKey.getAccessKeyOrThrow(
      platform,
      platformAccessKeyId
    );

    req.platformAccessKey = platformAccessKey;
    next();
  });
}
