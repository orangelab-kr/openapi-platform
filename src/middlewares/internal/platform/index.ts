import { Callback, InternalError, OPCODE, Platform, Wrapper } from '../../..';

export * from './accessKey';
export * from './user';

export function InternalPlatformMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const { platformId } = req.params;
    if (!platformId) {
      throw new InternalError(
        '해당 플랫폼을 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    const platform = await Platform.getPlatformOrThrow(platformId);
    req.internal.platform = platform;

    next();
  });
}
