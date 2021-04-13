import Wrapper, { Callback } from '../../tools/wrapper';

import InternalError from '../../tools/error';
import { OPCODE } from '../../tools';

export enum PERMISSION {
  PLATFORMS_LIST,
  PLATFORMS_VIEW,
  PLATFORMS_CREATE,
  PLATFORMS_MODIFY,
  PLATFORMS_DELETE,

  USERS_LIST,
  USERS_VIEW,
  USERS_CREATE,
  USERS_MODIFY,
  USERS_DELETE,

  ACCESS_KEYS_LIST,
  ACCESS_KEYS_AUTHORIZE,
  ACCESS_KEYS_VIEW,
  ACCESS_KEYS_CREATE,
  ACCESS_KEYS_MODIFY,
  ACCESS_KEYS_DELETE,

  PERMISSIONS_LIST,
  PERMISSIONS_VIEW,
  PERMISSIONS_CREATE,
  PERMISSIONS_MODIFY,
  PERMISSIONS_DELETE,

  PERMISSION_GROUPS_LIST,
  PERMISSION_GROUPS_VIEW,
  PERMISSION_GROUPS_CREATE,
  PERMISSION_GROUPS_MODIFY,
  PERMISSION_GROUPS_DELETE,

  LOGS_LIST,
  LOGS_VIEW,
}

export default function InternalPermissionMiddleware(
  permission: PERMISSION
): Callback {
  return Wrapper(async (req, res, next) => {
    if (!req.internal.prs[permission]) {
      throw new InternalError(
        `${PERMISSION[permission]} 권한이 없습니다.`,
        OPCODE.ACCESS_DENIED
      );
    }

    await next();
  });
}
