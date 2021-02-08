import { AccessKey, User } from '../controllers';
import { InternalError, OPCODE } from '../tools';
import Wrapper, { Callback } from '../tools/wrapper';

export default function PlatformMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const { headers } = req;
    if (headers.authorization) {
      const platformUserSessionId = headers.authorization.substr(7);
      const session = await User.getUserSession(platformUserSessionId);
      req.platform = session.platformUser.platform;
      req.platformUser = session.platformUser;
    } else if (headers['X-HIKICK-PLATFORM-ACCESS-KEY-ID']) {
      const accessKey = await AccessKey.authorizeWithAccessKey({
        platformAccessKeyId: String(headers['X-HIKICK-PLATFORM-ACCESS-KEY-ID']),
        platformSecretAccessKey: String(
          headers['X-HIKICK-PLATFORM-SECRET-ACCESS-KEY']
        ),
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
