import Wrapper, { Callback } from '../../tools/wrapper';

import InternalError from '../../tools/error';
import { OPCODE } from '../../tools';

export enum PERMISSION {
  PLATFORMS = 'platform.platforms',
  PLATFORMS_VIEW = 'platform.platforms.view',
  PLATFORMS_CREATE = 'platform.platforms.create',
  PLATFORMS_MODIFY = 'platform.platforms.modify',
  PLATFORMS_DELETE = 'platform.platforms.delete',

  USERS = 'platform.users',
  USERS_VIEW = 'platform.users.view',
  USERS_CREATE = 'platform.users.create',
  USERS_MODIFY = 'platform.users.modify',
  USERS_DELETE = 'platform.users.delete',

  ACCESS_KEYS = 'platform.access_keys',
  ACCESS_KEYS_AUTHORIZE = 'platform.access_keys.authorize',
  ACCESS_KEYS_VIEW = 'platform.access_keys.view',
  ACCESS_KEYS_CREATE = 'platform.access_keys.create',
  ACCESS_KEYS_MODIFY = 'platform.access_keys.modify',
  ACCESS_KEYS_DELETE = 'platform.access_keys.delete',

  PERMISSIONS = 'platform.permissions',
  PERMISSIONS_VIEW = 'platform.permissions.view',
  PERMISSIONS_CREATE = 'platform.permissions.create',
  PERMISSIONS_MODIFY = 'platform.permissions.modify',
  PERMISSIONS_DELETE = 'platform.permissions.delete',

  PERMISSION_GROUPS = 'platform.permission_groups',
  PERMISSION_GROUPS_VIEW = 'platform.permission_groups.view',
  PERMISSION_GROUPS_CREATE = 'platform.permission_groups.create',
  PERMISSION_GROUPS_MODIFY = 'platform.permission_groups.modify',
  PERMISSION_GROUPS_DELETE = 'platform.permission_groups.delete',
}

export default function InternalPermissionMiddleware(
  permission: PERMISSION
): Callback {
  return Wrapper(async (req, res, next) => {
    if (!req.internal.prs.includes(permission)) {
      throw new InternalError(
        `${permission} 권한이 없습니다.`,
        OPCODE.ACCESS_DENIED
      );
    }

    await next();
  });
}
