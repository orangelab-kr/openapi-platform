import {
  AccessKey,
  Callback,
  InternalError,
  OPCODE,
  Session,
  Wrapper,
} from '..';

export function PlatformMiddleware(
  only: ('user' | 'accessKey')[] = ['user', 'accessKey']
): Callback {
  return Wrapper(async (req, res, next) => {
    const { headers } = req;
    const platformAccessKeyId = `${headers['x-hikick-platform-access-key-id']}`;
    if (only.includes('user') && headers.authorization) {
      const platformUserSessionId = headers.authorization.substr(7);
      const session = await Session.getUserSession(platformUserSessionId);

      req.loggined = <any>{};
      req.loggined.platform = session.platformUser.platform;
      req.loggined.platformUser = session.platformUser;
    } else if (only.includes('accessKey') && platformAccessKeyId) {
      const platformSecretAccessKey = `${headers['x-hikick-platform-secret-access-key']}`;
      const accessKey = await AccessKey.authorizeWithAccessKey({
        platformAccessKeyId,
        platformSecretAccessKey,
      });

      req.loggined = <any>{};
      req.loggined.platform = accessKey.platform;
      req.loggined.platformAccessKey = accessKey;
    }

    if (!req.loggined.platform) {
      throw new InternalError(
        '로그인이 필요한 서비스입니다.',
        OPCODE.REQUIRED_LOGIN
      );
    }

    next();
  });
}
