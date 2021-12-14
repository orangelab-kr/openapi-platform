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
      platformUser: PlatformUserModel & { platform: PlatformModel };
      platformAccessKey: PlatformAccessKeyModel & { platform: PlatformModel };
      loggined: {
        platform: PlatformModel;
        platformUser: PlatformUserModel & { platform: PlatformModel };
        platformAccessKey: PlatformAccessKeyModel & { platform: PlatformModel };
      };
      internal: {
        sub: string;
        iss: string;
        aud: string;
        prs: boolean[];
        iat: Date;
        exp: Date;
        platform: PlatformModel;
        platformUser: PlatformUserModel & { platform: PlatformModel };
        platformAccessKey: PlatformAccessKeyModel & { platform: PlatformModel };
      };
    }
  }
}
