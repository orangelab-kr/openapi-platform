import { InternalError, OPCODE } from '../../../tools';
import Wrapper, { Callback } from '../../../tools/wrapper';

import { Platform } from '../../../controllers';

export { default as InternalPlatformAccessKeyMiddleware } from './accessKey';
export { default as InternalPlatformUserMiddleware } from './user';
export default function InternalPlatformMiddleware(): Callback {
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
