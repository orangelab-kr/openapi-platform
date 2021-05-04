import { AccessKey, Callback, InternalError, OPCODE, Wrapper } from '..';

export function PlatformAccessKeyMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const {
      loggined: { platform },
      params: { platformAccessKeyId },
    } = req;

    if (!platform || !platformAccessKeyId) {
      throw new InternalError(
        '해당 액세스 키를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    const platformAccessKey = await AccessKey.getAccessKeyOrThrow(
      platform,
      platformAccessKeyId
    );

    req.platformAccessKey = platformAccessKey;
    next();
  });
}
