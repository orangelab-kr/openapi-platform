import { Platform, RESULT, Wrapper, WrapperCallback } from '../../..';

export * from './accessKey';
export * from './user';

export function InternalPlatformMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const { platformId } = req.params;
    if (!platformId) throw RESULT.CANNOT_FIND_PLATFORM();
    const platform = await Platform.getPlatformOrThrow(platformId);
    req.internal.platform = platform;

    next();
  });
}
