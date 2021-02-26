import { InternalError, OPCODE } from '../../../tools';
import Wrapper, { Callback } from '../../../tools/wrapper';

import { User } from '../../../controllers';

export default function InternalPlatformUserMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const {
      internal: { platform },
      params: { platformUserId },
    } = req;

    if (!platform || !platformUserId) {
      throw new InternalError(
        '해당 사용자를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    const platformUser = await User.getUserOrThrow(platform, platformUserId);
    req.internal.platformUser = platformUser;

    next();
  });
}
