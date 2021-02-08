import { PlatformModel, PlatformUserModel } from '@prisma/client';
import 'express';

declare global {
  namespace Express {
    interface Request {
      platform: PlatformModel;
      platformUser: PlatformUserModel;
      platformAccessKey: PlatformAccessKeyModel;
    }
  }
}
