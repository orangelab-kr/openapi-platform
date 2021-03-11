import { InternalError, OPCODE } from '../tools';
import Wrapper, { Callback } from '../tools/wrapper';

import { User } from '../controllers';

export default function PlatformUserMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const {
      loggined: { platform },
      params: { platformUserId },
    } = req;

    if (!platform || !platformUserId) {
      throw new InternalError(
        '해당 사용자를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    const platformUser = await User.getUserOrThrow(platform, platformUserId);
    req.platformUser = platformUser;

    next();
  });
}
