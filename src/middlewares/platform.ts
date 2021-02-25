import { AccessKey, User } from '../controllers';
import { InternalError, OPCODE } from '../tools';
import Wrapper, { Callback } from '../tools/wrapper';

export default function PlatformMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const { headers } = req;
    const platformAccessKeyId = `${headers['x-hikick-platform-access-key-id']}`;
    if (headers.authorization) {
      const platformUserSessionId = headers.authorization.substr(7);
      const session = await User.getUserSession(platformUserSessionId);
      req.platform = session.platformUser.platform;
      req.platformUser = session.platformUser;
    } else if (platformAccessKeyId) {
      const platformSecretAccessKey = `${headers['x-hikick-platform-secret-access-key']}`;
      const accessKey = await AccessKey.authorizeWithAccessKey({
        platformAccessKeyId,
        platformSecretAccessKey,
      });

      req.platform = accessKey.platform;
      req.platformAccessKey = accessKey;
    }

    if (!req.platform) {
      throw new InternalError(
        '로그인이 필요한 서비스입니다.',
        OPCODE.REQUIRED_LOGIN
      );
    }

    next();
  });
}
