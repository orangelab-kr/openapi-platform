import {
  PlatformAccessKeyModel,
  PlatformModel,
  PlatformUserModel,
} from '@prisma/client';
import 'express';

declare global {
  namespace Express {
    interface Request {
      permissionIds: string[];
      platform: PlatformModel;
      platformUser: PlatformUserModel;
      platformAccessKey: PlatformAccessKeyModel;
      loggined: {
        platform: PlatformModel;
        platformUser: PlatformUserModel;
        platformAccessKey: PlatformAccessKeyModel;
      };
      internal: {
        sub: string;
        iss: string;
        aud: string;
        prs: boolean[];
        iat: Date;
        exp: Date;
        platform: PlatformModel;
        platformUser: PlatformUserModel;
        platformAccessKey: PlatformAccessKeyModel;
      };
    }
  }
}
