import {
  AccessKey,
  Callback,
  InternalError,
  OPCODE,
  Session,
  Wrapper,
} from '..';

export function PlatformMiddleware(
  props: {
    only?: ('user' | 'accessKey')[];
    permissionIds?: string[];
    final?: boolean;
  } = {}
): Callback {
  const { only, permissionIds, final } = {
    only: ['user', 'accessKey'],
    permissionIds: [],
    final: false,
    ...props,
  };

  return Wrapper(async (req, res, next) => {
    if (req.permissionIds === undefined) req.permissionIds = [];
    req.permissionIds.push(...permissionIds);

    if (!final) return next();
    const { headers } = req;
    const platformAccessKeyId = `${headers['x-hikick-platform-access-key-id']}`;
    if (only.includes('user') && headers.authorization) {
      const sessionId = headers.authorization.substr(7);
      const platformUser = await Session.authorizeWithSessionId({
        sessionId,
        permissionIds,
      });

      req.loggined = <any>{};
      req.loggined.platform = platformUser.platform;
      req.loggined.platformUser = platformUser;
    } else if (only.includes('accessKey') && platformAccessKeyId) {
      const platformSecretAccessKey = `${headers['x-hikick-platform-secret-access-key']}`;
      const accessKey = await AccessKey.authorizeWithAccessKey({
        platformAccessKeyId,
        platformSecretAccessKey,
        permissionIds,
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
